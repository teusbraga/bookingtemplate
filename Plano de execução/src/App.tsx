import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { SchemaViewer } from './components/SchemaViewer';
import { ConstraintLab } from './components/ConstraintLab';
import { ErdVisualizer } from './components/ErdVisualizer';
import { SlotCalculator } from './components/SlotCalculator';
import { ArchitecturePhases } from './components/ArchitecturePhases';
import { Database, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('schema');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'schema' && <SchemaViewer />}
        {activeTab === 'lab' && <ConstraintLab />}
        {activeTab === 'erd' && <ErdVisualizer />}
        {activeTab === 'slots' && <SlotCalculator />}
        {activeTab === 'architecture' && <ArchitecturePhases />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <span className="font-medium text-slate-400">
              Supabase / Postgres 15+ Schema com btree_gist Constraint
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>ACID Guarantees</span>
            </span>
            <span className="flex items-center space-x-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>0 Race Conditions</span>
            </span>
            <span>Pronto para Copiar & Executar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
