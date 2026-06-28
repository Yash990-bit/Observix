export default function Page() {
  return (
    <>
      
{/*  TopNavBar  */}
<header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-gutter h-16 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
<div className="flex items-center gap-8">
<span className="font-headline-lg text-headline-lg font-bold text-primary tracking-tighter">AegisAI</span>
<nav className="hidden md:flex gap-6">
<a className="text-primary border-b-2 border-primary py-1 px-1 transition-colors cursor-pointer font-label-caps text-label-caps" href="#">Dashboard</a>
<a className="text-on-surface-variant hover:bg-white/5 py-1 px-1 transition-colors cursor-pointer font-label-caps text-label-caps" href="#">Incidents</a>
<a className="text-on-surface-variant hover:bg-white/5 py-1 px-1 transition-colors cursor-pointer font-label-caps text-label-caps" href="#">Observability</a>
</nav>
</div>
<div className="flex items-center gap-4">
<div className="bg-surface-container px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant text-sm">terminal</span>
<span className="font-data-mono text-data-mono text-on-surface-variant">/search incidents...</span>
</div>
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">notifications</span>
</div></div></header>

<aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-sidebar-nav-width bg-surface-container-low border-r border-white/10 flex flex-col z-40">
  <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-white/5 transition-colors">
      <span className="material-symbols-outlined">dashboard</span>
      <span className="font-label-caps text-label-caps">Dashboard</span>
    </a>
    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-white/5 transition-colors">
      <span className="material-symbols-outlined">segment</span>
      <span className="font-label-caps text-label-caps">Live Logs</span>
    </a>
    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 transition-colors">
      <span className="material-symbols-outlined">emergency</span>
      <span className="font-label-caps text-label-caps">AI Incidents</span>
    </a>
    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-white/5 transition-colors">
      <span className="material-symbols-outlined">hub</span>
      <span className="font-label-caps text-label-caps">Service Graph</span>
    </a>
    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-white/5 transition-colors">
      <span className="material-symbols-outlined">help</span>
      <span className="font-label-caps text-label-caps">How It Works</span>
    </a>
    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-white/5 transition-colors">
      <span className="material-symbols-outlined">description</span>
      <span className="font-label-caps text-label-caps">API Docs</span>
    </a>
  </nav>
</aside>
    </>
  );
}
