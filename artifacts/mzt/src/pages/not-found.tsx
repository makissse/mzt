export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-black font-mono text-primary">404</h1>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
          Страница не найдена
        </p>
      </div>
    </div>
  );
}
