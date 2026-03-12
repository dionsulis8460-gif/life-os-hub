const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/50">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md accent-gradient" />
          <span className="font-semibold text-sm">LifeOS</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 LifeOS. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
