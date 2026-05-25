'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Search,
  Plus,
  RefreshCw,
  Calendar,
  Zap,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  ShieldAlert,
} from 'lucide-react';

// ─── TIPOS ──────────────────────────────────────────────────────────────────
interface Lead {
  id: string;
  name: string;
  phone: string;
  budget: number;
  notes: string;
  status: string;
  follow_up: number;
  funil_ativo: string | null;
  created_at: string;
  last_moved_at: string;
  updated_at: string;
  loss_reason?: string;
}

interface FunilMeta {
  label: string;
  cls: string;
}

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
// Dias de follow-up: 3, 5, 7, 10, 15, 25, 30 dias após o primeiro contato
const FOLLOW_UP_STEPS = [3, 5, 7, 10, 15, 25, 30];

const FUNIL_META: Record<string, FunilMeta> = {
  followup:   { label: 'Follow-up',  cls: 'bg-[#5c54ed]/20 text-[#9d97f5] border-[#5c54ed]/30' },
  resgate:    { label: 'Resgate',    cls: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  reativacao: { label: 'Reativação', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
  nutricao:   { label: 'Nutrição',   cls: 'bg-green-500/15 text-green-400 border-green-500/25' },
};

const KANBAN_COLUMNS = [
  { id: 'lead_novo',        title: 'Lead Novo',  color: '#5c54ed', bg: 'rgba(92,84,237,.15)'  },
  { id: 'em_atendimento',  title: 'Atendimento', color: '#eab308', bg: 'rgba(234,179,8,.12)'  },
  { id: 'agendado',         title: 'Agendado',   color: '#3b82f6', bg: 'rgba(59,130,246,.12)' },
  { id: 'confirmar',        title: 'Confirmar',  color: '#a855f7', bg: 'rgba(168,85,247,.12)' },
  { id: 'comparecimento',  title: 'Compareceu',  color: '#22c55e', bg: 'rgba(34,197,94,.12)'  },
  { id: 'falta',            title: 'Falta',       color: '#ef4444', bg: 'rgba(239,68,68,.12)'  },
  { id: 'reagendar',        title: 'Reagendar',   color: '#f97316', bg: 'rgba(249,115,22,.12)' },
  { id: 'venda_em_aberto', title: 'Orçamento',    color: '#0d9488', bg: 'rgba(13,148,136,.12)' },
  { id: 'venda_ganha',     title: 'Venda Ganha', color: '#059669', bg: 'rgba(5,150,105,.12)'  },
  { id: 'venda_perdida',   title: 'Perdida',      color: '#475569', bg: 'rgba(71,85,105,.12)'  },
];

const LOSS_REASONS = ['Sem resposta', 'Preço', 'Concorrente', 'Não qualificado', 'Remarcou', 'Outro'];

// ─── UTILITÁRIOS ─────────────────────────────────────────────────────────────
const fmtBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const daysSince = (ts: string) => {
  if (!ts) return null;
  return Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
};

const DaysBadge = ({ ts, reference }: { ts: string; reference: string }) => {
  const d = daysSince(ts || reference);
  if (d === null) return null;
  const colorCls = d < 4 ? 'text-[#3fb950] bg-green-500/10' : d < 8 ? 'text-[#d29922] bg-yellow-500/15' : 'text-[#f85149] bg-red-500/15';
  return <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${colorCls}`}>{d}d</span>;
};

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────
export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [pendingWin, setPendingWin] = useState<Lead | null>(null);
  const [pendingLoss, setPendingLoss] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [supabase, setSupabase] = useState<any>(null);

  // Filtro de Data (Default: últimos 30 dias)
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  });

  // Inicialização segura do Cliente Supabase
  useEffect(() => {
    const init = async () => {
      try {
        console.log('1️⃣ Iniciando Supabase...');
        const { createBrowserClient } = await import('@supabase/ssr');
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
        console.log('2️⃣ URL:', url ? '✅' : '❌', 'KEY:', key ? '✅' : '❌');
        if (url && key) {
          const client = createBrowserClient(url, key);
          setSupabase(client);
          console.log('3️⃣ Supabase inicializado!');
        } else {
          console.error('❌ Variáveis de ambiente faltando!');
        }
      } catch (err) {
        console.error('❌ Erro ao inicializar Supabase:', err);
      }
    };
    init();
  }, []);

  const fetchLeads = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.warn('❌ Usuário não autenticado:', userError?.message);
        setLoading(false);
        return;
      }

      console.log('5️⃣ Usuário autenticado:', user.id);

      const startDate = `${dateRange.start}T00:00:00.000Z`;
      const endDate = `${dateRange.end}T23:59:59.999Z`;

      console.log('6️⃣ Data range:', dateRange);
      console.log('7️⃣ Buscando leads...');

      let query = supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id);

      if (dateRange.start && dateRange.end) {
        query = query
          .gte('created_at', startDate)
          .lte('created_at', endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro Supabase:', error?.message || error?.code);
        throw error;
      }

      console.log('✅ Leads encontrados:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('📋 Primeiro lead:', data[0]);
      } else {
        console.warn('⚠️ Nenhum lead encontrado. Verifique RLS e dados.');
      }
      setLeads((data as Lead[]) || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('❌ Erro ao buscar leads:', errorMessage);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, dateRange]);

  useEffect(() => {
    if (supabase) {
      console.log('4️⃣ Supabase pronto, iniciando fetchLeads()');
      fetchLeads();
    } else {
      console.warn('⚠️ Supabase ainda não inicializado');
    }
  }, [supabase, fetchLeads]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: dateRange.start,
          end_date: dateRange.end,
        }),
      });

      if (res.ok) {
        await fetchLeads();
      } else {
        console.error('Falha na sincronização:', res.status);
      }
    } catch (err) {
      console.error('Erro na sincronização:', err);
    } finally {
      setSyncing(false);
    }
  };

  const updateStatus = async (id: string, status: string, extraFields: Partial<Lead> = {}) => {
    if (!supabase) return;
    const updates = {
      status,
      last_moved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...extraFields,
    };

    // Atualização otimista
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

    const { error } = await supabase.from('leads').update(updates).eq('id', id);
    if (error) {
      console.error('Erro ao atualizar lead:', error.message);
      // Reverte para o estado real em caso de erro
      fetchLeads();
    }
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }: { data: { user: { app_metadata?: { role?: string } } | null } }) => {
      setIsAdmin(data.user?.app_metadata?.role === 'admin');
    });
  }, [supabase]);

  const metrics = useMemo(() => {
    const total        = leads.length;
    const agendamentos = leads.filter(l => ['agendado', 'confirmar', 'comparecimento', 'venda_ganha'].includes(l.status)).length;
    const comparecimentos = leads.filter(l => ['comparecimento', 'venda_ganha'].includes(l.status)).length;
    const vendas       = leads.filter(l => l.status === 'venda_ganha');
    const emAberto     = leads.filter(l => l.status === 'venda_em_aberto');
    const faturamento  = vendas.reduce((acc, l) => acc + (l.budget || 0), 0);
    const receitaAberta = emAberto.reduce((acc, l) => acc + (l.budget || 0), 0);
    return { total, agendamentos, comparecimentos, vendas: vendas.length, faturamento, receitaAberta };
  }, [leads]);

  const groupedLeads = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    KANBAN_COLUMNS.forEach(c => { map[c.id] = []; });

    const filtered = leads.filter(l =>
      l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone?.includes(searchTerm)
    );

    filtered.forEach(l => {
      if (map[l.status]) {
        map[l.status].push(l);
      } else {
        map['lead_novo'].push(l);
      }
    });
    return map;
  }, [leads, searchTerm]);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e6edf3] flex flex-col font-sans selection:bg-[#5c54ed]/30">
      <header className="h-16 border-b border-[#21262d] flex items-center justify-between px-6 bg-[#0a0c10]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-[#5c54ed] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(92,84,237,0.3)]">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg block leading-none">Mesus CRM</span>
            <span className="text-[10px] text-[#7d8590] font-bold uppercase tracking-widest">Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
            <input
              type="text"
              placeholder="Pesquisar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#111318] border border-[#30363d] rounded-full py-2 pl-10 pr-4 text-xs outline-none focus:border-[#5c54ed] transition-all w-64 placeholder:text-[#484f58]"
            />
          </div>

          {isAdmin && (
            <a
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#9d97f5] border border-[#5c54ed]/30 bg-[#5c54ed]/10 rounded-xl hover:bg-[#5c54ed]/20 transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </a>
          )}
          <button
            onClick={handleSignOut}
            aria-label="Sair do sistema"
            className="p-2.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl text-[#7d8590] transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Funil de Vendas</h2>
            <p className="text-xs text-[#7d8590] mt-1 font-medium">Gestão estratégica de leads por período.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#111318] border border-[#30363d] rounded-xl px-4 py-2 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-[#7d8590]" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-transparent border-none text-[11px] font-bold text-[#e6edf3] outline-none cursor-pointer [color-scheme:dark]"
              />
              <ArrowRight className="w-3 h-3 text-[#30363d]" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-transparent border-none text-[11px] font-bold text-[#e6edf3] outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                aria-label="Sincronizar leads"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#111318] border border-[#30363d] rounded-xl text-xs font-bold hover:bg-[#161b22] transition-all text-[#7d8590] hover:text-[#e6edf3] disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing || loading ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar'}
              </button>
              <button
                aria-label="Adicionar novo lead"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#5c54ed] text-white rounded-xl text-xs font-bold hover:bg-[#4a42d4] transition-all shadow-lg shadow-[#5c54ed]/20"
              >
                <Plus className="w-4 h-4" />
                Novo Lead
              </button>
            </div>
          </div>
        </div>

        {/* ── Painel de Métricas Comerciais ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-[#5c54ed]" />
              <span className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Total Leads</span>
            </div>
            <p className="text-3xl font-black text-[#e6edf3]">{metrics.total}</p>
            <p className="text-[10px] text-[#7d8590] mt-1">no período selecionado</p>
          </div>

          <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-[#3b82f6]" />
              <span className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Agendamentos</span>
            </div>
            <p className="text-3xl font-black text-[#3b82f6]">{metrics.agendamentos}</p>
            <p className="text-[10px] text-[#7d8590] mt-1">agendado + confirmar + compareceu</p>
          </div>

          <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#a855f7]" />
              <span className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Comparecimentos</span>
            </div>
            <p className="text-3xl font-black text-[#a855f7]">{metrics.comparecimentos}</p>
            <p className="text-[10px] text-[#7d8590] mt-1">compareceu + vendas ganhas</p>
          </div>

          <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />
              <span className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Vendas</span>
            </div>
            <p className="text-3xl font-black text-[#3fb950]">{metrics.vendas}</p>
            <p className="text-[10px] text-[#7d8590] mt-1">vendas fechadas</p>
          </div>

          <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[#3fb950]" />
              <span className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Faturamento</span>
            </div>
            <p className="text-2xl font-black text-[#3fb950] leading-tight">{fmtBRL(metrics.faturamento)}</p>
            <p className="text-[10px] text-[#7d8590] mt-1">receita bruta confirmada</p>
          </div>

          <div className="bg-[#111318] border border-[#0d9488]/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[#0d9488]" />
              <span className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Em Aberto</span>
            </div>
            <p className="text-2xl font-black text-[#0d9488] leading-tight">{fmtBRL(metrics.receitaAberta)}</p>
            <p className="text-[10px] text-[#7d8590] mt-1">orçamentos pendentes</p>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto pb-6 scrollbar-hide">
          <div className="flex gap-5 h-full min-w-max">
            {KANBAN_COLUMNS.map((col) => {
              const columnLeads = groupedLeads[col.id] || [];
              return (
                <div
                  key={col.id}
                  className="w-72 flex flex-col gap-4"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const id = e.dataTransfer.getData('lead-id');
                    const lead = leads.find(l => l.id === id);
                    if (!lead) return;
                    if (col.id === 'venda_ganha') return setPendingWin(lead);
                    if (col.id === 'venda_perdida') return setPendingLoss(lead);
                    updateStatus(id, col.id);
                  }}
                >
                  <div className="flex items-center justify-between px-2 py-1" style={{ borderLeft: `3px solid ${col.color}` }}>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: col.color }}>{col.title}</span>
                    <span className="bg-[#111318] text-[10px] px-2.5 py-0.5 rounded-full border border-[#30363d] font-bold text-[#7d8590]">
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="flex-1 bg-[#111318]/40 border border-[#21262d] rounded-[24px] p-2.5 flex flex-col gap-3 min-h-[400px]">
                    {columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('lead-id', lead.id)}
                        onClick={() => setEditingLead(lead)}
                        className="bg-[#0d1117] border border-[#21262d] p-4 rounded-2xl shadow-sm hover:border-[#5c54ed]/50 transition-all cursor-grab active:cursor-grabbing group animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-[13px] font-bold group-hover:text-[#5c54ed] transition-colors line-clamp-1">{lead.name}</h4>
                          <DaysBadge ts={lead.last_moved_at} reference={lead.created_at} />
                        </div>
                        <p className="text-[10px] font-mono text-[#7d8590] mb-3">{lead.phone}</p>
                        <div className="flex gap-1 mb-4">
                          {FOLLOW_UP_STEPS.map(step => (
                            <div
                              key={step}
                              className={`w-4 h-4 rounded-[4px] flex items-center justify-center text-[7px] font-black transition-all ${
                                lead.follow_up === step ? 'bg-[#5c54ed] text-white shadow-[0_0_8px_rgba(92,84,237,0.4)]' :
                                lead.follow_up > step ? 'bg-[#30363d] text-[#7d8590]' : 'border border-[#30363d] text-[#484f58]'
                              }`}
                            >
                              {step}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-[#21262d]/50">
                          <div className="flex gap-2">
                            {lead.funil_ativo && (
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${FUNIL_META[lead.funil_ativo]?.cls || ''}`}>
                                {FUNIL_META[lead.funil_ativo]?.label}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-[#3fb950]">{fmtBRL(lead.budget)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {editingLead && (
        <LeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={async (id: string, data: Partial<Lead>) => {
            if (!supabase) return;
            const { error } = await supabase.from('leads').update(data).eq('id', id);
            if (!error) {
              setEditingLead(null);
              fetchLeads();
            } else {
              console.error('Erro ao salvar lead:', error.message);
            }
          }}
        />
      )}

      <StatusFlowModals
        pendingWin={pendingWin}
        setPendingWin={setPendingWin}
        pendingLoss={pendingLoss}
        setPendingLoss={setPendingLoss}
        updateStatus={updateStatus}
      />
    </div>
  );
}

// ─── SUBCOMPONENTES ─────────────────────────────────────────────────────────

interface LeadModalProps {
  lead: Lead;
  onClose: () => void;
  onSave: (id: string, data: Partial<Lead>) => Promise<void>;
}

function LeadModal({ lead, onClose, onSave }: LeadModalProps) {
  const [form, setForm] = useState<Lead>({ ...lead });
  const [saving, setSaving] = useState(false);

  // Atualiza o form quando o lead muda (ex: atualização em tempo real)
  useEffect(() => {
    setForm({ ...lead });
  }, [lead]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    await onSave(lead.id, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#111318] border border-[#21262d] rounded-[32px] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center px-8 py-6 border-b border-[#21262d]">
          <h3 className="font-bold text-lg tracking-tight">Ficha do Lead</h3>
          <button onClick={onClose} aria-label="Fechar modal" className="p-2 hover:bg-[#161b22] rounded-xl text-[#7d8590] transition-all"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">Nome Completo</label>
              <input
                className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 px-4 text-sm focus:border-[#5c54ed] outline-none transition-all"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">WhatsApp</label>
              <input
                className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] font-mono rounded-xl py-3 px-4 text-sm focus:border-[#5c54ed] outline-none"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">Orçamento (R$)</label>
              <input
                type="number"
                min={0}
                className="w-full bg-[#0a0c10] border border-[#30363d] text-[#3fb950] font-bold rounded-xl py-3 px-4 text-sm focus:border-[#5c54ed] outline-none"
                value={form.budget}
                onChange={e => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">Observações Estratégicas</label>
            <textarea
              rows={4}
              className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 px-4 text-sm focus:border-[#5c54ed] outline-none resize-none"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-4">Ações de Funil Automático</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(FUNIL_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, funil_ativo: key })}
                  className={`text-[10px] font-bold uppercase px-4 py-2 rounded-xl border transition-all ${
                    form.funil_ativo === key ? 'bg-[#5c54ed] border-[#5c54ed] text-white' : 'border-[#30363d] text-[#7d8590] hover:border-[#484f58]'
                  }`}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-[#21262d] bg-[#111318]">
          <button
            disabled={saving}
            onClick={handleSave}
            className="w-full bg-[#5c54ed] hover:bg-[#4a42d4] text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-[#5c54ed]/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatusFlowModalsProps {
  pendingWin: Lead | null;
  setPendingWin: (lead: Lead | null) => void;
  pendingLoss: Lead | null;
  setPendingLoss: (lead: Lead | null) => void;
  updateStatus: (id: string, status: string, extra?: Partial<Lead>) => Promise<void>;
}

function StatusFlowModals({ pendingWin, setPendingWin, pendingLoss, setPendingLoss, updateStatus }: StatusFlowModalsProps) {
  const winValRef = useRef<HTMLInputElement>(null);
  const lossReasonRef = useRef<HTMLSelectElement>(null);

  if (!pendingWin && !pendingLoss) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      {pendingWin && (
        <div className="bg-[#111318] border border-[#3fb950]/30 p-8 rounded-[32px] w-full max-w-sm text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-[#3fb950]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-[#3fb950] w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Venda Confirmada!</h3>
          <p className="text-sm text-[#7d8590] mb-8">Qual o valor final do contrato para <b>{pendingWin.name}</b>?</p>
          <input
            ref={winValRef}
            type="number"
            min={0}
            defaultValue={pendingWin.budget}
            className="w-full bg-[#0a0c10] border border-[#30363d] text-[#3fb950] text-3xl font-black text-center py-4 rounded-2xl mb-8 outline-none focus:border-[#3fb950]"
          />
          <div className="flex gap-3">
            <button onClick={() => setPendingWin(null)} className="flex-1 py-4 text-xs font-bold text-[#7d8590] hover:bg-white/5 rounded-2xl transition-all">Cancelar</button>
            <button
              onClick={() => {
                const val = winValRef.current?.value ?? '0';
                updateStatus(pendingWin.id, 'venda_ganha', { budget: parseFloat(val) || 0 });
                setPendingWin(null);
              }}
              className="flex-1 py-4 bg-[#3fb950] text-white text-xs font-bold rounded-2xl shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all"
            >
              Finalizar Venda
            </button>
          </div>
        </div>
      )}

      {pendingLoss && (
        <div className="bg-[#111318] border border-red-500/30 p-8 rounded-[32px] w-full max-w-sm text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Lead Perdido</h3>
          <p className="text-sm text-[#7d8590] mb-8">Por que não conseguimos fechar com <b>{pendingLoss.name}</b>?</p>
          <select
            ref={lossReasonRef}
            className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] py-4 px-4 rounded-2xl mb-8 outline-none focus:border-red-500"
          >
            <option value="">Selecione um motivo...</option>
            {LOSS_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="flex gap-3">
            <button onClick={() => setPendingLoss(null)} className="flex-1 py-4 text-xs font-bold text-[#7d8590] hover:bg-white/5 rounded-2xl transition-all">Voltar</button>
            <button
              onClick={() => {
                const reason = lossReasonRef.current?.value ?? '';
                updateStatus(pendingLoss.id, 'venda_perdida', { loss_reason: reason });
                setPendingLoss(null);
              }}
              className="flex-1 py-4 bg-red-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
            >
              Arquivar Lead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
