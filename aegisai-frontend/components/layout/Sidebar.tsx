'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/logs', icon: 'segment', label: 'Live Logs' },
  { href: '/incidents', icon: 'emergency', label: 'AI Incidents' },
  { href: '/services', icon: 'hub', label: 'Service Graph' },
  { href: '/how-it-works', icon: 'help', label: 'How It Works' },
  { href: '/docs', icon: 'description', label: 'API Docs' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-sidebar-nav-width flex-col sticky left-0 top-0 bg-surface-container-low border-r border-white/10 flex shrink-0">
      <div className="flex flex-col h-full py-panel-padding">
        {/* Logo */}
        <div className="px-6 mb-8">
          <div className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            AegisAI
          </div>
          <div className="text-on-surface-variant font-body-sm text-body-sm mt-1">SRE Autonomous Mode</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ href, icon, label }) => {
            const isActive = pathname === href || (href === '/dashboard' && pathname === '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 rounded-lg ${
                  isActive
                    ? 'text-primary bg-primary/10 border-r-2 border-primary shadow-[0_0_15px_rgba(173,198,255,0.1)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span className="font-body-md text-body-md">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMsakhk5YMR_cCJHBPT8lA8ekRw0ZPfNYPYROMkU3sEOlLS4TqnM8gvyXUd_FNrW8q0VnDcbq7uDin4RZx1ubT4PauQ-F0kQ5WnhjbyEDl5bHcTqaCdztOil54RDHxTeYPPIjVwPgQn8x0zQAOkvALfq_yf0sVRnpVM1hgnRoxf3ZIR1U0EaX_a1s3dmXzFl7d1CpXxc8T_H0FChmmDmZE3tcxPXIL0L1B73ZqtnmG3i_h7UYEJ6j8pL3f73_IvuEhie0vBb3_JLw"
                alt="Admin"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-body-sm text-body-sm text-on-surface font-semibold">Admin</span>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Root Access</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
