import React, { useState } from 'react';
import { Copy, Check, Info, ShieldCheck, Zap, Terminal, Search, ExternalLink } from 'lucide-react';
import { FULL_POSTGRES_SQL, TABLES_DEFINITIONS } from '../data/sqlSchema';

export const SchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedSubTab, setSelectedSubTab] = useState<'full' | 'constraint_deepdive' | 'modular' | 'rls'>('full');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('marcacoes');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTables = TABLES_DEFINITIONS.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTableDef = TABLES_DEFINITIONS.find((t) => t.name === selectedTable) || TABLES_DEFINITIONS[3];

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the Constraint */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Schema Oficial PostgreSQL / Supabase com Prevenção ACID de Conflitos
              </h2>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Responde integralmente à <strong className="text-emerald-400">Fase 0</strong> solicitada. A constraint nativa de exclusão{' '}
              <code className="bg-slate-950/80 px-2 py-0.5 rounded text-emerald-300 font-mono text-xs border border-emerald-500/20">
                EXCLUDE USING gist (medico_id WITH =, tstzrange(inicio, fim, '[)') WITH &&) WHERE (status != 'cancelado')
              </code>{' '}
              garante que <span className="underline decoration-emerald-500/60">nenhuma condição de corrida</span> (race condition)
              duplique consultas no mesmo médico, mesmo com milhares de requisições simultâneas via Site e WhatsApp!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCopy(FULL_POSTGRES_SQL)}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copiado para o Clipboard!' : 'Copiar DDL Completo'}</span>
            </button>
          </div>
        </div>

        {/* 3 Pillars Callout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-start space-x-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
            <Zap className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">btree_gist Obrigatório</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Permite combinar comparação de igualdade escalar (UUID) com intersecção de range temporal (&&).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
            <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Intervalo Semi-Aberto [)</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                [14:00, 14:30) e [14:30, 15:00) NÃO colidem! Permite consultas consecutivas perfeitamente contíguas.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">WHERE (status != 'cancelado')</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                O índice parcial exclui cancelamentos. Se uma consulta for cancelada, o horário é liberado na hora.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedSubTab('full')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedSubTab === 'full'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📄 Script SQL Completo (Supabase)
          </button>
          <button
            onClick={() => setSelectedSubTab('constraint_deepdive')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedSubTab === 'constraint_deepdive'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛡️ A Constraint de Conflito em Detalhes
          </button>
          <button
            onClick={() => setSelectedSubTab('modular')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedSubTab === 'modular'
                ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📦 Inspeção Tabela a Tabela ({TABLES_DEFINITIONS.length})
          </button>
          <button
            onClick={() => setSelectedSubTab('rls')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedSubTab === 'rls'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔒 Políticas RLS & Permissões
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Supabase SQL Editor Ready • PostgreSQL 14+ / 15 / 16
        </div>
      </div>

      {/* Sub Tab: Script Completo */}
      {selectedSubTab === 'full' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">schema_agendamento_supabase.sql ({FULL_POSTGRES_SQL.split('\n').length} linhas)</span>
            <span>Inclui extensões, enums, 7 tabelas, constraints de exclusão, triggers e RLS</span>
          </div>

          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="font-mono text-slate-300">SQL DDL & Migration Code</span>
              </div>
              <button
                onClick={() => handleCopy(FULL_POSTGRES_SQL)}
                className="flex items-center space-x-1 text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[600px] scrollbar-thin">
              <code>{FULL_POSTGRES_SQL}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Sub Tab: Aprofundamento na Constraint */}
      {selectedSubTab === 'constraint_deepdive' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Por que a Constraint EXCLUDE USING gist é a Solução Definitiva?
                </h3>
                <p className="text-xs text-slate-400">
                  Comparações entre bloqueio em aplicação (Node/Vercel) vs Constraint Nativa no Postgres
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Abordagem Frágil */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-semibold">
                  <span>❌ Validar apenas no Node / Vercel (SELECT then INSERT)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Se um paciente no <strong>Site</strong> e outro no <strong>WhatsApp</strong> clicarem em "Agendar"
                  no milissegundo 14:00:00:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Requisição A faz <code className="text-rose-300">SELECT marcacoes WHERE ...</code> → Encontra 0 conflitos</li>
                  <li>Requisição B faz <code className="text-rose-300">SELECT marcacoes WHERE ...</code> → Encontra 0 conflitos</li>
                  <li>Requisição A insere a consulta</li>
                  <li>Requisição B insere a consulta</li>
                  <li><strong className="text-rose-300">Resultado: Overbooking duplo!</strong> Médico tem 2 pacientes no mesmo horário.</li>
                </ol>
              </div>

              {/* Abordagem Perfeita */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                  <span>✅ Constraint EXCLUDE USING gist no Postgres (ACID)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  A trava é atômica no mecanismo de armazenamento e índice GiST do PostgreSQL:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>O Postgres avalia o índice GiST durante a transação de gravação.</li>
                  <li>A primeira transação comita com sucesso.</li>
                  <li>A segunda transação é <strong className="text-emerald-400">imediatamente rejeitada</strong> com erro <code className="text-emerald-300">23P01 (exclusion_violation)</code>.</li>
                  <li>Impossível haver sobreposição sob qualquer carga ou latência de rede!</li>
                </ol>
              </div>
            </div>

            {/* Código da Constraint em Destaque */}
            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 font-mono">Trecho Exato na tabela public.marcacoes</span>
                <span className="text-[11px] text-slate-500">PostgreSQL 14+</span>
              </div>
              <pre className="text-xs font-mono text-emerald-300 bg-slate-900/90 p-3 rounded-lg overflow-x-auto">
{`-- 1. Obrigatório antes de criar a tabela:
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Na declaração da tabela marcacoes:
CONSTRAINT marcacoes_sem_sobreposicao_medico
  EXCLUDE USING gist (
    medico_id WITH =,
    tstzrange(inicio, fim, '[)') WITH &&
  )
  WHERE (status != 'cancelado')`}
              </pre>
            </div>

            {/* Decomposição sintática */}
            <div className="space-y-2 pt-2 text-xs">
              <h4 className="font-semibold text-slate-200">Anatomia dos Parâmetros:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-amber-300 font-bold">medico_id WITH =</span>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Exige que a colisão de horários só ocorra para o <em>mesmo</em> médico. Médicos diferentes podem ter consultas no mesmo horário sem interferência.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-amber-300 font-bold">tstzrange(inicio, fim, '[)') WITH &&</span>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Converte início e fim em um intervalo de tempo com timezone. <code className="text-emerald-400 font-mono">[)</code> significa semi-aberto: inclui o início e exclui o fim exato.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-amber-300 font-bold">Operador &&</span>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Operador nativo do Postgres para <em>overlap</em> (intersecção não vazia). Retorna falso se dois intervalos apenas se encostam nas bordas.
                  </p>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-amber-300 font-bold">WHERE (status != 'cancelado')</span>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Índice parcial: quando o paciente ou médico cancela a consulta (mudando status para 'cancelado'), ela sai do índice e o horário fica imediatamente livre para novo agendamento!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab: Tabela a Tabela */}
      {selectedSubTab === 'modular' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Table List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar tabelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredTables.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTable(t.name)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedTable === t.name
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-md'
                      : 'bg-slate-900/50 border-slate-800/70 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-white">{t.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {t.columns.length} colunas
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium mt-0.5">{t.tag}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Active Table Deep Inspection */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold font-mono text-white">public.{activeTableDef.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {activeTableDef.tag}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-1">{activeTableDef.description}</p>
            </div>

            {/* Columns Table */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Colunas & Tipos</h4>
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Nome</th>
                      <th className="p-2.5">Tipo</th>
                      <th className="p-2.5">Atributos</th>
                      <th className="p-2.5">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-mono">
                    {activeTableDef.columns.map((c) => (
                      <tr key={c.name} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold text-white flex items-center space-x-1.5">
                          <span>{c.name}</span>
                          {c.isPrimary && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-sans font-bold">
                              PK
                            </span>
                          )}
                          {c.isForeign && (
                            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded font-sans">
                              FK
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-emerald-400 text-[11px]">{c.type}</td>
                        <td className="p-2.5 text-slate-400 text-[11px]">
                          {c.isUnique && <span className="text-cyan-400 mr-1.5">UNIQUE</span>}
                          {!c.isNullable && <span className="text-slate-400 mr-1.5">NOT NULL</span>}
                          {c.defaultValue && <span className="text-slate-500">DEF: {c.defaultValue}</span>}
                        </td>
                        <td className="p-2.5 text-slate-300 text-[11px] font-sans">{c.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Constraints */}
            {activeTableDef.constraints.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Constraints & Regras de Integridade
                </h4>
                <div className="space-y-2">
                  {activeTableDef.constraints.map((ct) => (
                    <div
                      key={ct.name}
                      className={`p-3 rounded-xl border text-xs ${
                        ct.type === 'EXCLUSION'
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-white">{ct.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            ct.type === 'EXCLUSION'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ct.type}
                        </span>
                      </div>
                      <div className="font-mono text-emerald-300 text-[11px] mt-1 bg-slate-900/80 p-2 rounded">
                        {ct.definition}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1.5">{ct.purpose}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Indexes */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Índices Otimizados</h4>
              <div className="flex flex-wrap gap-2">
                {activeTableDef.indexes.map((idx, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg"
                  >
                    CREATE INDEX {idx}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab: RLS */}
      {selectedSubTab === 'rls' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Row Level Security (RLS) Nativo do Supabase</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              No Supabase, as requisições que chegam com o JWT do usuário autenticado no navegador só acessam as linhas permitidas.
              Já o backend da API (Vercel) e os Webhooks do WhatsApp operam com a chave <code className="text-cyan-300 font-mono">service_role</code>,
              que faz bypass do RLS para orquestração segura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TABLES_DEFINITIONS.map((table) => (
              <div key={table.name} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-white">public.{table.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                    RLS ENABLED
                  </span>
                </div>
                <div className="space-y-1.5 pt-1 text-xs">
                  {table.rlsPolicies.map((pol, i) => (
                    <div key={i} className="flex items-start space-x-2 text-slate-300">
                      <span className="text-cyan-400 text-sm leading-none">•</span>
                      <span>{pol}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
