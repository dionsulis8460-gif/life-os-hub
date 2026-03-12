import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Play, Pause, RotateCcw, Clock, Flame, Timer, Trash2 } from "lucide-react";
import { useStudy, usePomodoro } from "@/hooks/useStudy";
import { SUBJECTS } from "@/types/study";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

const Estudos = () => {
  const { sessions, addSession, deleteSession, totalWeekMinutes, totalPomodoros, dailyData, todayMinutes } = useStudy();
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].label);
  const pomodoro = usePomodoro(25, 5);

  const handleFinishSession = () => {
    if (pomodoro.completedPomodoros === 0 && pomodoro.timeLeft === 25 * 60) {
      toast.error("Inicie pelo menos um pomodoro antes de salvar.");
      return;
    }
    const elapsed = pomodoro.completedPomodoros * 25 + Math.floor((25 * 60 - pomodoro.timeLeft) / 60);
    addSession({
      subject: selectedSubject,
      duration: Math.max(elapsed, 1),
      date: new Date().toISOString(),
      type: 'pomodoro',
      completedPomodoros: pomodoro.completedPomodoros,
    });
    pomodoro.reset();
    toast.success("Sessão registrada!");
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (pomodoro.progress / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estudos</h1>
          <p className="text-muted-foreground text-sm">Cronômetro Pomodoro e registro de sessões</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hoje</p>
              <p className="text-lg font-bold">{todayMinutes} min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(152,69%,53%)]/10">
              <Timer className="h-5 w-5 text-[hsl(152,69%,53%)]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
              <p className="text-lg font-bold">{Math.floor(totalWeekMinutes / 60)}h {totalWeekMinutes % 60}m</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(12,90%,60%)]/10">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pomodoros (semana)</p>
              <p className="text-lg font-bold">{totalPomodoros}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pomodoro Timer */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Pomodoro
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-6">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map(s => (
                  <SelectItem key={s.label} value={s.label}>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Circular timer */}
            <div className="relative w-52 h-52">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" strokeWidth="6" className="stroke-secondary" />
                <circle
                  cx="100" cy="100" r="90" fill="none" strokeWidth="6"
                  stroke={pomodoro.isBreak ? "hsl(152, 69%, 53%)" : "hsl(12, 90%, 60%)"}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tabular-nums">{pomodoro.display}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {pomodoro.isBreak ? "Pausa" : "Foco"}
                </span>
                {pomodoro.completedPomodoros > 0 && (
                  <span className="text-xs text-primary mt-1">🍅 {pomodoro.completedPomodoros}</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={pomodoro.toggle} size="lg" className="gap-2">
                {pomodoro.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {pomodoro.isRunning ? "Pausar" : "Iniciar"}
              </Button>
              <Button onClick={pomodoro.reset} variant="outline" size="lg">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button onClick={handleFinishSession} variant="secondary" size="lg">
                Salvar sessão
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Progresso semanal</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 30%, 18%)" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }} axisLine={false} tickLine={false} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(220, 20%, 11%)', border: '1px solid hsl(217, 30%, 18%)', borderRadius: 8, color: 'hsl(210, 40%, 98%)' }}
                  formatter={(value: number) => [`${value} min`, 'Estudo']}
                />
                <Bar dataKey="minutos" fill="hsl(12, 90%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sessions history */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Sessões recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma sessão registrada ainda.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              <AnimatePresence>
                {sessions.slice(0, 20).map(session => {
                  const subj = SUBJECTS.find(s => s.label === session.subject);
                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: subj?.color || 'hsl(215,20%,65%)' }} />
                        <div>
                          <p className="text-sm font-medium">{session.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(session.date), "dd/MM · HH:mm")} · {session.duration}min
                            {session.completedPomodoros ? ` · 🍅${session.completedPomodoros}` : ''}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => deleteSession(session.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Estudos;
