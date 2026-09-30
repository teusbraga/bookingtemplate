import React, { useState } from 'react';
import { GitFork, Key, Link2, ShieldCheck, Database, ArrowRight } from 'lucide-react';
import { TABLES_DEFINITIONS } from '../data/sqlSchema';

export const ErdVisualizer: React.FC = () => {
  const [highlightTable, setHighlightTable] = useState<string | null>(null);

  const relationships = [
    { from: 'profiles', fromCol: 'id', to: 'medicos', toCol: 'profile_id', type: '1:1' },
    { from: 'medicos', fromCol: 'id', to: 'disponibilidades', toCol: 'medico_id', type: '1:N' },
    { from: 'medicos', fromCol: 'id', to: 'marcacoes', toCol: 'medico_id', type: '1:N' },
    { from: 'profiles', fromCol: 'id', to: 'marcacoes', toCol: 'cliente_id', type: '1:N' },
    { from: 'profiles', fromCol: 'id', to: 'conversas', toCol: 'cliente_id', type: '0..1:N' },
    { from: 'profiles', fromCol: 'id', to: 'integracoes_google_calendar', toCol: 'user_id', type: '1:1' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <GitFork className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Diagrama Relacional (ERD) — 7 Tabelas Supabase / PostgreSQL
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Estrutura normalizada em 3FN garantindo rastreabilidade completa: cadastro unificado em{' '}
              <code className="text-indigo-300 font-mono">profiles</code>, catálogo clínico em{' '}
              <code className="text-indigo-300 font-mono">medicos</code>, agenda em{' '}
              <code className="text-indigo-300 font-mono">disponibilidades</code>, agendamentos protegidos em{' '}
              <code className="text-emerald-400 font-mono">marcacoes</code>, máquina de bot em{' '}
              <code className="text-indigo-300 font-mono">conversas</code>, logs idempotentes em{' '}
              <code className="text-indigo-300 font-mono">mensagens_log</code> e credenciais em{' '}
              <code className="text-indigo-300 font-mono">integracoes_google_calendar</code>.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-slate-400">PK / FK</span>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400">Exclusion btree_gist</span>
            </div>
          </div>
        </div>
      </div>

      {/* Relationship Graph Pills */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Chaves Estrangeiras & Cardinalidades:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          {relationships.map((rel, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono transition-all ${
                highlightTable === rel.from || highlightTable === rel.to
                  ? 'bg-indigo-950/60 border-indigo-400 text-indigo-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span className="font-bold text-slate-200">{rel.from}.{rel.fromCol}</span>
              <span className="text-indigo-400 font-sans text-[11px] font-bold">({rel.type})</span>
              <ArrowRight className="h-3 w-3 text-slate-500" />
              <span className="font-bold text-slate-200">{rel.to}.{rel.toCol}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ERD Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TABLES_DEFINITIONS.map((table) => {
          const isHighlighted = highlightTable === table.name;
          const isMarcacoes = table.name === 'marcacoes';

          return (
            <div
              key={table.name}
              onMouseEnter={() => setHighlightTable(table.name)}
              onMouseLeave={() => setHighlightTable(null)}
              className={`rounded-2xl border transition-all duration-200 p-4 space-y-3 ${
                isMarcacoes
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                  : isHighlighted
                  ? 'bg-slate-900 border-indigo-500/60 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-emerald-400" />
                  <span className="font-mono font-bold text-sm text-white">{table.name}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isMarcacoes
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {table.tag}
                </span>
              </div>

              {/* Columns */}
              <div className="space-y-1.5 font-mono text-xs">
                {table.columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-slate-800/40"
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      {col.isPrimary ? (
                        <Key className="h-3 w-3 text-amber-400 shrink-0" />
                      ) : col.isForeign ? (
                        <Link2 className="h-3 w-3 text-indigo-400 shrink-0" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-600 shrink-0 ml-1 mr-0.5" />
                      )}
                      <span className={`truncate ${col.isPrimary ? 'text-amber-300 font-bold' : 'text-slate-200'}`}>
                        {col.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] shrink-0">
                      <span className="text-slate-400">{col.type}</span>
                      {col.isUnique && <span className="text-cyan-400 font-bold text-[9px]">UQ</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Exclusion Constraint Callout for Marcacoes */}
              {isMarcacoes && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] space-y-1">
                  <div className="flex items-center space-x-1 text-emerald-300 font-bold font-sans">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Constraint de Exclusão Ativa</span>
                  </div>
                  <p className="text-slate-300 font-mono text-[10px]">
                    EXCLUDE USING gist (medico_id WITH =, tstzrange(inicio, fim, '[)') WITH &&) WHERE (status != 'cancelado')
                  </p>
                </div>
              )}

              {/* Foreign Keys footer */}
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/70 font-sans">
                {table.constraints.length} constraints • {table.indexes.length} índices
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
