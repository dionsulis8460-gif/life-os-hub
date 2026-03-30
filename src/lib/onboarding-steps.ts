/**
 * Step definitions for the per-module onboarding guide.
 * Each step has a title, a description, and an optional action hint shown
 * as a small badge pointing users to the relevant UI element.
 */

export interface GuideStep {
  title: string;
  description: string;
  /** Short action hint shown below the description (e.g. "👆 Clique em Nova tarefa"). */
  hint?: string;
}

export const MODULE_GUIDE_STEPS: Record<string, GuideStep[]> = {
  /** ─── Dashboard ─── */
  "": [
    {
      title: "Bem-vindo ao seu Dashboard! 👋",
      description:
        "Aqui você tem uma visão geral de todos os seus módulos: tarefas, finanças, hábitos, metas, estudos e alimentação.",
    },
    {
      title: "Cartões de resumo",
      description:
        "Cada cartão exibe um resumo do módulo correspondente. Clique na seta (→) no canto de um cartão para ir direto àquele módulo.",
      hint: "👆 Clique na seta de qualquer cartão",
    },
    {
      title: "Navegação lateral",
      description:
        "Use o menu à esquerda (ou o menu inferior no celular) para acessar qualquer módulo a qualquer momento.",
    },
  ],

  /** ─── Rotina ─── */
  rotina: [
    {
      title: "Bem-vindo à Rotina! ✅",
      description:
        "Aqui você cria e gerencia suas tarefas diárias. Organize o que precisa fazer e acompanhe seu progresso ao longo do dia.",
    },
    {
      title: "Criando sua primeira tarefa",
      description:
        'Clique em "Nova tarefa" no canto superior direito para adicionar uma tarefa. Defina o título, prioridade e horário.',
      hint: '👆 Clique em "Nova tarefa"',
    },
    {
      title: "Prioridades e filtros",
      description:
        "Cada tarefa tem uma prioridade: 🔴 Alta, 🟡 Média ou ⚪ Baixa. Use os filtros para visualizar apenas as tarefas que precisam de atenção.",
      hint: "🔽 Use os filtros de status e prioridade",
    },
    {
      title: "Marcando como concluída",
      description:
        "Clique no ícone de checkbox ao lado de uma tarefa para marcá-la como concluída. A barra de progresso no topo mostra seu avanço do dia.",
    },
  ],

  /** ─── Finanças ─── */
  financas: [
    {
      title: "Bem-vindo às Finanças! 💰",
      description:
        "Controle suas receitas e despesas mensais, visualize gráficos por categoria e acompanhe seu saldo em tempo real.",
    },
    {
      title: "Registrando uma transação",
      description:
        'Clique em "Nova transação" para registrar uma receita ou despesa. Informe o valor, descrição, categoria e data.',
      hint: '👆 Clique em "Nova transação"',
    },
    {
      title: "Resumo financeiro",
      description:
        "Os três cartões no topo mostram suas Receitas, Despesas e Saldo atual. O gráfico de pizza exibe a distribuição de despesas por categoria.",
    },
    {
      title: "Histórico de transações",
      description:
        "Role a página para ver todas as transações do mês ordenadas por data. Clique no ícone de lixo para excluir uma transação.",
    },
  ],

  /** ─── Estudos ─── */
  estudos: [
    {
      title: "Bem-vindo aos Estudos! 📚",
      description:
        "Organize suas matérias, cronometre sessões de estudo com o timer Pomodoro e acompanhe seu progresso semanal.",
    },
    {
      title: "Crie sua primeira matéria",
      description:
        'Clique em "Gerenciar matérias" e depois em "Nova matéria" para adicionar uma disciplina. Escolha um nome e uma cor.',
      hint: '👆 Clique em "Gerenciar matérias"',
    },
    {
      title: "Timer Pomodoro",
      description:
        "Selecione a matéria e o tópico, depois clique em Iniciar para começar o timer. O Pomodoro padrão são 25 min de foco + 5 min de pausa.",
      hint: "▶ Clique em Iniciar para começar",
    },
    {
      title: "Seu progresso semanal",
      description:
        "O gráfico de barras na parte inferior mostra suas horas de estudo nos últimos 7 dias. Cada sessão salva é contabilizada automaticamente.",
    },
  ],

  /** ─── Hábitos ─── */
  habitos: [
    {
      title: "Bem-vindo aos Hábitos! 🧠",
      description:
        "Construa hábitos consistentes acompanhando sua frequência diária e sequência de dias consecutivos.",
    },
    {
      title: "Criando um hábito",
      description:
        'Clique em "Novo hábito" para adicionar um hábito. Escolha um nome, ícone, cor e frequência (diário, dias de semana ou fins de semana).',
      hint: '👆 Clique em "Novo hábito"',
    },
    {
      title: "Marcando como feito hoje",
      description:
        "Clique no botão de check em um cartão de hábito para marcar como concluído hoje. O anel de progresso no topo atualiza em tempo real.",
      hint: "✅ Clique no botão de check do hábito",
    },
    {
      title: "Sequência e histórico",
      description:
        "Cada hábito exibe os últimos 7 dias e sua sequência atual de dias consecutivos. Mantenha a consistência para aumentar o streak!",
    },
  ],

  /** ─── Alimentação ─── */
  alimentacao: [
    {
      title: "Bem-vindo à Alimentação! 🥗",
      description:
        "Registre suas refeições e acompanhe suas calorias e macronutrientes (proteínas, carboidratos e gorduras) diariamente.",
    },
    {
      title: "Registrando uma refeição",
      description:
        'Clique em "Nova refeição" para adicionar o que você comeu. Informe o nome, tipo de refeição, calorias e macros.',
      hint: '👆 Clique em "Nova refeição"',
    },
    {
      title: "Resumo do dia",
      description:
        "Os cartões no topo mostram suas calorias totais, proteínas, carboidratos e gorduras ingeridos hoje.",
    },
    {
      title: "Histórico semanal",
      description:
        "O gráfico de barras exibe suas calorias dos últimos 7 dias. Use o gráfico de pizza para ver a distribuição de macros.",
    },
  ],

  /** ─── Metas ─── */
  metas: [
    {
      title: "Bem-vindo às Metas! 🎯",
      description:
        "Defina objetivos de médio e longo prazo, adicione marcos intermediários e acompanhe seu progresso com uma barra visual.",
    },
    {
      title: "Criando uma meta",
      description:
        'Clique em "Nova meta" para criar um objetivo. Defina título, descrição, categoria, prazo e progresso inicial.',
      hint: '👆 Clique em "Nova meta"',
    },
    {
      title: "Adicionando marcos",
      description:
        "Dentro de uma meta, adicione marcos (sub-objetivos) para dividir a jornada em etapas menores. Marque cada marco conforme avança.",
      hint: "➕ Clique em uma meta para expandir e adicionar marcos",
    },
    {
      title: "Atualizando o progresso",
      description:
        "Use o controle de progresso (0–100%) para registrar onde você está. Metas com 100% são movidas automaticamente para a aba de concluídas.",
    },
  ],
};

/** The 6 selectable modules shown in the onboarding wizard. */
export const WIZARD_MODULES = [
  {
    key: "rotina",
    label: "Rotina",
    emoji: "✅",
    description: "Tarefas e atividades do dia a dia",
    path: "/app/rotina",
  },
  {
    key: "financas",
    label: "Finanças",
    emoji: "💰",
    description: "Receitas, despesas e saldo",
    path: "/app/financas",
  },
  {
    key: "habitos",
    label: "Hábitos",
    emoji: "🧠",
    description: "Construa consistência diária",
    path: "/app/habitos",
  },
  {
    key: "estudos",
    label: "Estudos",
    emoji: "📚",
    description: "Timer Pomodoro e progresso",
    path: "/app/estudos",
  },
  {
    key: "alimentacao",
    label: "Alimentação",
    emoji: "🥗",
    description: "Calorias e macronutrientes",
    path: "/app/alimentacao",
  },
  {
    key: "metas",
    label: "Metas",
    emoji: "🎯",
    description: "Objetivos e marcos de progresso",
    path: "/app/metas",
  },
] as const;
