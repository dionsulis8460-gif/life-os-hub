export type Priority = "alta" | "media" | "baixa";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  time: string; // HH:mm format
  done: boolean;
  createdAt: string;
}

export const priorityConfig: Record<Priority, { label: string; className: string; dotClass: string }> = {
  alta: { label: "Alta", className: "bg-destructive/15 text-destructive", dotClass: "bg-destructive" },
  media: { label: "Média", className: "bg-primary/15 text-primary", dotClass: "bg-primary" },
  baixa: { label: "Baixa", className: "bg-muted text-muted-foreground", dotClass: "bg-muted-foreground" },
};
