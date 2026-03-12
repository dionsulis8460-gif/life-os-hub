import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef } from "react";

export interface Subscription {
  id: string;
  user_id: string;
  status: "trial" | "limited_free" | "active" | "cancelled";
  plan: "modular" | "combo" | "full" | null;
  selected_modules: string[];
  store: "google_play" | "apple" | "web" | null;
  store_transaction_id: string | null;
  store_product_id: string | null;
  trial_started_at: string;
  trial_ends_at: string;
  limited_free_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const transitionAttempted = useRef(false);

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data as Subscription;
    },
    enabled: !!user,
  });

  const transitionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const limitedFreeEndsAt = new Date();
      limitedFreeEndsAt.setDate(limitedFreeEndsAt.getDate() + 7);

      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: "limited_free",
          limited_free_ends_at: limitedFreeEndsAt.toISOString(),
          selected_modules: [],
        })
        .eq("id", subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
    },
  });

  const isTrialActive = subscription
    ? subscription.status === "trial" && new Date(subscription.trial_ends_at) > new Date()
    : false;

  const isTrialExpired =
    subscription?.status === "trial" && !isTrialActive;

  // Auto-transition expired trial → limited_free
  useEffect(() => {
    if (isTrialExpired && subscription && !transitionAttempted.current) {
      transitionAttempted.current = true;
      transitionMutation.mutate(subscription.id);
    }
  }, [isTrialExpired, subscription?.id]);

  const isActive = subscription?.status === "active";
  const isFullPlan = subscription?.plan === "full";

  const isLimitedFreeActive = subscription?.status === "limited_free" &&
    subscription.limited_free_ends_at &&
    new Date(subscription.limited_free_ends_at) > new Date();

  const hasModuleAccess = (module: string) => {
    if (!subscription) return false;
    if (isTrialActive) return true;
    if (subscription.status === "active") {
      if (subscription.plan === "full") return true;
      return subscription.selected_modules?.includes(module) ?? false;
    }
    if (subscription.status === "limited_free") {
      const limitEnd = subscription.limited_free_ends_at;
      if (limitEnd && new Date(limitEnd) > new Date()) {
        return subscription.selected_modules?.length === 1 && subscription.selected_modules.includes(module);
      }
    }
    return false;
  };

  const trialDaysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const limitedFreeDaysLeft = subscription?.limited_free_ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.limited_free_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    subscription,
    isLoading,
    isTrialActive,
    isActive,
    isFullPlan,
    isLimitedFreeActive,
    hasModuleAccess,
    trialDaysLeft,
    limitedFreeDaysLeft,
    refetch,
  };
};