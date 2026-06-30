'use client';

import Sidebar from '../../components/layout/Sidebar';
import { DependencyGraph } from '../../components/graph/DependencyGraph';

export default function ServicesPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto p-8 bg-[#0a0a0c]">
        <DependencyGraph />
      </div>
    </div>
  );
}
}
