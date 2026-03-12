import { motion } from "framer-motion";

const spring = { type: "spring" as const, duration: 0.4, bounce: 0 };

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

const PlaceholderPage = ({ title, description, icon: Icon }: PlaceholderPageProps) => {
  return (
    <div>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-1">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </motion.div>

      <motion.div
        className="rounded-3xl bg-card p-12 shadow-card flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.1 }}
      >
        <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Em breve</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Este módulo está sendo construído. Conecte o banco de dados para começar a usar.
        </p>
      </motion.div>
    </div>
  );
};

export default PlaceholderPage;
