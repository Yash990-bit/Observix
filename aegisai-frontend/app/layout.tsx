import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AegisAI — Autonomous SRE & Distributed Observability Platform',
  description: 'Production-grade AI observability dashboard with real-time logs, incident intelligence, and root cause analysis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Geist:wght@400;600;800&family=JetBrains+Mono:wght@400;500;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="flex min-h-screen w-full font-body-md text-body-md bg-surface-container-lowest text-on-surface overflow-hidden">
        {children}
      </body>
    </html>
  );
}
