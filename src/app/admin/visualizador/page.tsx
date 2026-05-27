'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, RefreshCw, BarChart3, Table2, Bug, Users, ArrowLeft, TrendingUp } from 'lucide-react';

const CLIENTES = [
  { id: 'anna-hof', nome: 'Dra Anna HOF', sheet_id: '1N2oAsy3PJud__z9MBSFrX9wr1AVfw_b-X-YpgDHIdkQ' },
  { id: 'rafael-rocha', nome: 'Dr Rafael Rocha', sheet_id: '1iX55z4aFf7CIzLHD0OVGdZCeCWrMfgK-hE_3LLAkfko' },
  { id: 'lucas-pitao', nome: 'Dr Lucas Pitão', sheet_id: '1ssM8yBQsSpby-y7FXqs8NmWAAjzsfigxhR4P4J7mfys' },
  { id: 'raphael-moreira', nome: 'Dr Raphael Moreira', sheet_id: '1hnJ7rl0Hcy2GcWdh3nMN7s9nhBCtahKsHYiQglAF_JE' },
  { id: 'orgulho-sao-vicente', nome: 'Orgulho São Vicente', sheet_id: '1-Xp3qunysH4vw8jrU8wWW0g8eTzLK2pt4jmoSxMDId0' },
  { id: 'orgulho-santos', nome: 'Orgulho Sorrir Santos', sheet_id: '1bWYYqtG_2TZ3Zs0r5wkvadSI8gEMAug-9nZUp-jxYuc' },
  { id: 'orgulho-peruibe', nome: 'Orgulho Sorrir Peruíbe', sheet_id: '17_CS-0I470XfX5sQMLAd0jdQJxng4gFCBkO1eaQx8qA' },
  { id: 'william-henrique', nome: 'Dr William Henrique', sheet_id: '14Ss2564FyP_SJeXxTI8OI-5n0tRMlchsJJYFJrxRrxY' },
  { id: 'michelle-santos', nome: 'Dra Michelle Santos', sheet_id: '1pQpLfdt9gCHoRekLRpqFk9pwW2V51ksCN_NTJd1G_zY' },
  { id: 'integrare', nome: 'Integrare Odontologia', sheet_id: '1TEuyWftgK9iM2rINKEeg-xTAZGVFxibmWZpokn6XCEc' },
  { id: 'bottega', nome: 'Espaço Bottega', sheet_id: '1AAcB8qjEf-NDM36lPTCOuUst7tsACIvfNe4QgsJf_yM' },
  { id: 'vitor-rios', nome: 'Victor Rios', sheet_id: '1NQlACxzoHdcjBpH7B2_WDpiMc6uAnznEtiMWHMopHjo' },
  { id: 'gglow', nome: 'Clínica GGlow', sheet_id: '1zOwuPWh_g2fLHyfmBfHl1RIPYznzGdf7yGidGnq9qN0' },
  { id: 'los-angeles', nome: 'Los Angeles Estética', sheet_id: '1zBcRC0HaV4JXg1Cix-XBl6cZzQ6044oFMhM3NlTZn7E' },
  { id: 'lumia', nome: 'Lumia Odontologia', sheet_id: '1fVoRc627ZhHEBKFIGuGvvtiMDBrO_2D3Wp2mWZlH3Go' },
  { id: 'ariel-figueira', nome: 'Dr Ariel Figueira', sheet_id: '1WFTrrqeiaYa9WCzaLcchnKDnpnWr6VG6n-PRwvYf8tI' },
  { id: 'oral-mais-beltrao', nome: 'Oral Mais Beltrão', sheet_id: '1GA6X-NLnj3VYhIRRkcpvOcOwUrzlUhhvWcI4sW22XrU' },
  { id: 'maria-krieger', nome: 'Dra Maria E. Krieger', sheet_id: '1AnHkl8G4jmxNcRY5jYuiPo4M02JHTpHG3dpmOZysuE0' },
  { id: 'elodonto', nome: 'Clínica Elodonto', sheet_id: '17eesV8xZKnisx9pJo11RndZOcKDwIT6zet8dBfHrPlM' },
  { id: 'lorenna-campos', nome: 'Dra Lorenna Campos', sheet_id: '1cOJAkSMqbJVBHX6RUMibxQEoAQHwEu1I3snXTvcxqOY' },
  { id: 'victoriano-faces', nome: 'Victoriano Faces', sheet_id: '12dTGJBLDOdxxPAX0WJJR7R6Zhu_NtZ9xX19VsUvdK8A' },
  { id: 'cristiane-tiburtino', nome: 'Dra Cristiane Tiburtino', sheet_id: '1bM8T1h-gAZdbOgjWQqkFoJPU_vODLI-ObIt9OtTLGic' },
  { id: 'implante-day', nome: 'ImplanteDay', sheet_id: '1WsTH2JpoX5HyXqAD6xAN3_GBL84flGi-qUvGCoGSHcc' },
  { id: 'botocenter-alphaville', nome: 'Botocenter Alphaville', sheet_id: '1YEZlqqIaTKVGUOUxQzxUQ-yjjzc3EYvyOYp96y_Q4vY' },
  { id: 'bruno-araujo', nome: 'Dr Bruno Araújo', sheet_id: '1Vc5IT497LN25AUD8ckoH7CkXJ-72O7ypn8ZxuoAUELg' },
  { id: 'acesso-saude-cic', nome: 'Acesso Saúde CIC', sheet_id: '1SuyRNdYrGZXtBFmB0-Hv91ZICa7geeFHx6Ayiz7jU08' },
  { id: 'lea', nome: 'Dra Lea', sheet_id: '1hQu7EiDa6hI0Wr7WVdcSBNg2eiaLucOw6P_mDgNkd0Y' },
  { id: 'carolina-macedo', nome: 'Dra Carolina Macedo', sheet_id: '' },
  { id: 'teste', nome: '🧪 Teste', sheet_id: '1tgbbzwTBV8Q9Q6Cgxche6JzPc4KX4AmP1J43Jn1HJ18' },
];

const COL_ALIASES: Record<string, string[]> = {
  Data: ['Data', 'data', 'DATA', 'Date', 'date'],
  Ano: ['Ano', 'ano'],
  Mes: ['Mes', 'Mês', 'MES', 'mês', 'mes'],
  'Agendou?': ['Agendou?', 'Agendou', 'Agendamento', 'Agendado?', 'Status Agendamento', 'Agendado'],
  'Compareceu?': ['Compareceu?', 'Compareceu', 'Comparecimento', 'Comparece', 'Comparecimento?'],
  'Ganhou?': ['Ganhou?', 'Ganhou', 'Ganho', 'Venda', 'Status Venda', 'Venda?'],
  'Contato?': ['Contato?', 'Contato', 'Contatado?', 'Contatado', 'Contato Feito?'],
  'Receita de Consultas': ['Receita de Consultas', 'Receita Consultas', 'Consultas', 'Valor Consultas', 'Receita Cons', 'Receita de Consulta'],
  'Receita de Tratamentos': ['Receita de Tratamentos', 'Receita Tratamentos', 'Tratamentos', 'Valor Tratamentos', 'Receita Trat'],
  Campanha: ['Campanha', 'Campaign', 'Campanha de Anúncios', 'Nome da Campanha'],
  Conjunto: ['Conjunto', 'Ad Set', 'Conjunto de Anúncios', 'AdSet'],
  'Anúncio': ['Anúncio', 'Anuncio', 'Ad', 'Anúncio', 'Anuncio', 'Nome do Anúncio'],
  Criativo: ['Criativo', 'Creative', 'Criativo do Anúncio'],
  SourceID: ['SourceID', 'Source', 'Origem ID', 'Id Origem', 'source_id', 'ID Origem'],
  Plataforma: ['Plataforma', 'Platform', 'Plataforma de Anúncios'],
  Midia: ['Mídia', 'Mídia', 'Media', 'Midia'],
  Origem: ['Origem', 'Origem do Lead', 'Fonte'],
};

type Tab = 'tabela' | 'funil' | 'dados';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const fmtBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR').format(v || 0);

function buildColMap(header: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  header.forEach((name, i) => {
    const key = name.trim();
    if (key && !(key in map)) map[key] = i;
  });
  return map;
}

function findCol(colMap: Record<string, number>, canonical: string): number | undefined {
  const aliases = COL_ALIASES[canonical] || [canonical];
  for (const alias of aliases) {
    if (colMap[alias] !== undefined) return colMap[alias];
  }
  return undefined;
}

const asStr = (v: unknown) => String(v ?? '');

function getSafe(row: string[], colMap: Record<string, number>, name: string, fallback = ''): string {
  const idx = findCol(colMap, name);
  return idx !== undefined ? asStr(row[idx]).trim() : fallback;
}

function extractYear(row: string[], colMap: Record<string, number>): string {
  const data = getSafe(row, colMap, 'Data');
  const match = data.match(/(\d{4})$/);
  return match ? match[1] : '';
}

function parseBRL(v: unknown): number {
  const s = asStr(v).trim();
  if (!s) return 0;
  let cleaned = s.replace(/^R?\$?\s*/, '').replace(/\./g, '').replace(',', '.').trim();
  let val = parseFloat(cleaned);
  if (!isNaN(val)) return val;
  val = parseFloat(s);
  if (!isNaN(val)) return val;
  return 0;
}

function isAgendamento(v: string): boolean {
  const s = v.trim().toLowerCase();
  if (!s) return false;
  const sim = ['agendado', 'agendou', 'agendamento', 'agendada'];
  if (sim.includes(s)) return true;
  if (s === 'sim' || s === 's') return true;
  return false;
}

function isComparecimento(v: string): boolean {
  const s = v.trim().toLowerCase();
  if (!s) return false;
  const sim = ['compareceu', 'sim', 's', 'presente', 'comparece', 'sim, compareceu', 'comparecimento'];
  if (sim.includes(s)) return true;
  return false;
}

function isFechamento(v: string): boolean {
  const s = v.trim().toLowerCase();
  if (!s) return false;
  const sim = ['ganha', 'ganhou', 'ganho', 'sim', 's', 'fechado', 'fechou', 'venda', 'venda fechada', 'venda ganha', 'venda realizada'];
  if (sim.includes(s)) return true;
  const nao = ['perdida', 'perdeu', 'nao', 'não', 'n'];
  if (nao.includes(s)) return false;
  if (s.includes('ganh') || s.includes('vend') || s.includes('fech')) return true;
  return false;
}

function getPipelineStage(row: string[], colMap: Record<string, number>): string {
  const agendou = getSafe(row, colMap, 'Agendou?');
  const compareceu = getSafe(row, colMap, 'Compareceu?');
  const ganhou = getSafe(row, colMap, 'Ganhou?');
  const contato = getSafe(row, colMap, 'Contato?');

  if (agendou === 'Agendado') return 'agendado';
  if (agendou === 'Não agendado') return 'nao_agendado';
  if (agendou === 'Em atendimento') return 'em_atendimento';
  if (agendou === 'Realizar Follow UP' || agendou.includes('Follow UP') || contato.includes('Follow UP')) return 'follow_up';
  if (compareceu === 'Compareceu') {
    if (ganhou === 'Ganha' || ganhou === 'Ganho') return 'venda_ganha';
    if (ganhou === 'Perdida') return 'venda_perdida';
    return 'compareceu';
  }
  if (compareceu === 'Faltou') return 'faltou';
  if (compareceu === 'Reagendou' || compareceu === 'Reagendar') return 'reagendou';
  if (contato === 'Contato Feito' || contato === 'Contato Realizado') return 'contato_feito';
  return 'lead_novo';
}

const PIPELINE_LABELS: Record<string, string> = {
  lead_novo: 'Lead Novo',
  contato_feito: 'Contato Feito',
  follow_up: 'Follow-up',
  em_atendimento: 'Em Atendimento',
  agendado: 'Agendado',
  nao_agendado: 'Não Agendado',
  compareceu: 'Compareceu',
  faltou: 'Faltou',
  reagendou: 'Reagendou',
  venda_ganha: 'Venda Ganha',
  venda_perdida: 'Venda Perdida',
};

const PIPELINE_COLORS: Record<string, string> = {
  lead_novo: '#7d8590',
  contato_feito: '#5c54ed',
  follow_up: '#eab308',
  em_atendimento: '#3b82f6',
  agendado: '#22c55e',
  nao_agendado: '#ef4444',
  compareceu: '#a855f7',
  faltou: '#f97316',
  reagendou: '#0d9488',
  venda_ganha: '#059669',
  venda_perdida: '#475569',
};

const AVATAR_COLORS = [
  'from-[#5c54ed] to-[#9d97f5]',
  'from-[#22c55e] to-[#4ade80]',
  'from-[#eab308] to-[#facc15]',
  'from-[#a855f7] to-[#c084fc]',
  'from-[#ef4444] to-[#f87171]',
  'from-[#3b82f6] to-[#60a5fa]',
  'from-[#ec4899] to-[#f472b6]',
  'from-[#14b8a6] to-[#2dd4bf]',
  'from-[#f97316] to-[#fb923c]',
  'from-[#8b5cf6] to-[#a78bfa]',
];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getInitials(nome: string) {
  return nome
    .split(' ')
    .filter(w => w.length > 0 && !['de', 'da', 'do', 'das', 'dos'].includes(w.toLowerCase()))
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function VisualizadorPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [selectedCliente, setSelectedCliente] = useState<(typeof CLIENTES)[0] | null>(null);
  const [customSid, setCustomSid] = useState('');
  const [customNome, setCustomNome] = useState('');
  const [rows, setRows] = useState<string[][]>([]);
  const [colMap, setColMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('tabela');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('Todos');
  const [selectedMonth, setSelectedMonth] = useState<string>('Todos');
  const [showDebug, setShowDebug] = useState(false);
  const [error, setError] = useState('');
  const [editSidId, setEditSidId] = useState<string | null>(null);
  const [editSidValue, setEditSidValue] = useState('');

  const fetchData = useCallback(async (sid: string) => {
    if (!sid) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/sheets?sid=${sid}`);
      const json = await res.json();
      if (json.error) {
        setError(json.error);
        setRows([]);
        setColMap({});
        return;
      }
      const values: string[][] = json.values || [];
      if (values.length < 2) {
        setRows([]);
        setColMap({});
        return;
      }
      const header = values[0];
      const map = buildColMap(header);
      setColMap(map);
      setRows(values.slice(1).map(r => r.map(c => String(c ?? ''))));
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados');
      setRows([]);
      setColMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCliente?.sheet_id) {
      setCustomSid('');
      fetchData(selectedCliente.sheet_id);
    }
  }, [selectedCliente, fetchData]);

  const handleSelectCliente = (c: (typeof CLIENTES)[0]) => {
    if (!c.sheet_id) {
      setEditSidId(c.id);
      setEditSidValue('');
      return;
    }
    setSelectedCliente(c);
  };

  const handleSaveSid = () => {
    if (editSidId && editSidValue) {
      const idx = CLIENTES.findIndex(c => c.id === editSidId);
      if (idx !== -1) {
        CLIENTES[idx].sheet_id = editSidValue;
        setSelectedCliente(CLIENTES[idx]);
        setEditSidId(null);
        setEditSidValue('');
      }
    }
  };

  const handleCustomFetch = () => {
    if (customSid) {
      setSelectedCliente(null);
      fetchData(customSid);
    }
  };

  const handleBack = () => {
    setSelectedCliente(null);
    setRows([]);
    setColMap({});
    setError('');
  };

  const col = useCallback((name: string) => findCol(colMap, name), [colMap]);

  const years = useMemo(() => {
    const set = new Set<string>();
    rows.forEach(r => {
      const v = extractYear(r, colMap);
      if (v) set.add(v);
    });
    return Array.from(set).sort();
  }, [rows, colMap]);

  const filteredRows = useMemo(() => {
    const mesIdx = col('Mes');
    return rows.filter(r => {
      if (selectedYear !== 'Todos') {
        if (extractYear(r, colMap) !== selectedYear) return false;
      }
      if (selectedMonth !== 'Todos' && mesIdx !== undefined) {
        const mesVal = (r[mesIdx] || '').toLowerCase().trim();
        const targetAbbr = MONTHS[parseInt(selectedMonth) - 1].substring(0, 3).toLowerCase();
        if (!mesVal.startsWith(targetAbbr)) return false;
      }
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return r.some(cell => (cell || '').toLowerCase().includes(searchLower));
      }
      return true;
    });
  }, [rows, col, colMap, selectedYear, selectedMonth, searchTerm]);

  const dimensionData = useMemo(() => {
    const dimNames = ['Campanha', 'Conjunto', 'Anúncio', 'Criativo', 'SourceID', 'Plataforma'];
    const dimIndices = dimNames.map(name => col(name)).filter(idx => idx !== undefined) as number[];
    const receitaCIdx = col('Receita de Consultas');
    const receitaTIdx = col('Receita de Tratamentos');

    const map = new Map<string, { leads: number; receitaC: number; receitaT: number; stages: Record<string, number> }>();

    filteredRows.forEach(row => {
      const key = dimIndices.map(idx => (row[idx] || '').trim() || '-').join('||');
      if (!map.has(key)) {
        map.set(key, { leads: 0, receitaC: 0, receitaT: 0, stages: {} });
      }
      const entry = map.get(key)!;
      entry.leads++;
      if (receitaCIdx !== undefined) entry.receitaC += parseBRL(row[receitaCIdx] || '');
      if (receitaTIdx !== undefined) entry.receitaT += parseBRL(row[receitaTIdx] || '');
      const stage = getPipelineStage(row, colMap);
      entry.stages[stage] = (entry.stages[stage] || 0) + 1;
    });

    return Array.from(map.entries()).map(([key, val]) => {
      const parts = key.split('||');
      const obj: Record<string, string> = {};
      dimIndices.forEach((idx, i) => {
        obj[dimNames[i]] = parts[i] || '-';
      });
      return { ...obj, ...val, _key: key };
    }).sort((a, b) => b.leads - a.leads);
  }, [filteredRows, col]);

  const totals = useMemo(() => {
    return dimensionData.reduce((acc, d) => ({
      leads: acc.leads + d.leads,
      receitaC: acc.receitaC + d.receitaC,
      receitaT: acc.receitaT + d.receitaT,
    }), { leads: 0, receitaC: 0, receitaT: 0 });
  }, [dimensionData]);

  const funnelKpis = useMemo(() => {
    const agendouIdx = col('Agendou?');
    const compareceuIdx = col('Compareceu?');
    const ganhouIdx = col('Ganhou?');
    let leads = 0, agendamentos = 0, comparecimentos = 0, fechamentos = 0;
    filteredRows.forEach(row => {
      leads++;
      if (agendouIdx !== undefined && isAgendamento(asStr(row[agendouIdx]))) agendamentos++;
      if (compareceuIdx !== undefined && isComparecimento(asStr(row[compareceuIdx]))) comparecimentos++;
      if (ganhouIdx !== undefined && isFechamento(asStr(row[ganhouIdx]))) fechamentos++;
    });
    return {
      leads, agendamentos, comparecimentos, fechamentos,
      txAgendamento: leads > 0 ? (agendamentos / leads) * 100 : 0,
      txComparecimento: agendamentos > 0 ? (comparecimentos / agendamentos) * 100 : 0,
      txFechamento: comparecimentos > 0 ? (fechamentos / comparecimentos) * 100 : 0,
    };
  }, [filteredRows, col]);

  const campanhaRanking = useMemo(() => {
    const campanhaIdx = col('Campanha');
    const agendouIdx = col('Agendou?');
    const compareceuIdx = col('Compareceu?');
    const ganhouIdx = col('Ganhou?');
    if (campanhaIdx === undefined) return [];
    const map = new Map<string, { leads: number; agendamentos: number; comparecimentos: number; fechamentos: number }>();
    filteredRows.forEach(row => {
      const nome = (row[campanhaIdx] || '').trim() || '(sem campanha)';
      if (!map.has(nome)) map.set(nome, { leads: 0, agendamentos: 0, comparecimentos: 0, fechamentos: 0 });
      const entry = map.get(nome)!;
      entry.leads++;
      if (agendouIdx !== undefined && isAgendamento(asStr(row[agendouIdx]))) entry.agendamentos++;
      if (compareceuIdx !== undefined && isComparecimento(asStr(row[compareceuIdx]))) entry.comparecimentos++;
      if (ganhouIdx !== undefined && isFechamento(asStr(row[ganhouIdx]))) entry.fechamentos++;
    });
    return Array.from(map.entries())
      .map(([nome, v]) => ({ nome, ...v, taxa: v.leads > 0 ? (v.agendamentos / v.leads) * 100 : 0 }))
      .sort((a, b) => b.agendamentos - a.agendamentos);
  }, [filteredRows, col]);

  const anuncioRanking = useMemo(() => {
    const anuncioIdx = col('Anúncio');
    const agendouIdx = col('Agendou?');
    const compareceuIdx = col('Compareceu?');
    const ganhouIdx = col('Ganhou?');
    if (anuncioIdx === undefined) return [];
    const map = new Map<string, { leads: number; agendamentos: number; comparecimentos: number; fechamentos: number }>();
    filteredRows.forEach(row => {
      const nome = (row[anuncioIdx] || '').trim() || '(sem anúncio)';
      if (!map.has(nome)) map.set(nome, { leads: 0, agendamentos: 0, comparecimentos: 0, fechamentos: 0 });
      const entry = map.get(nome)!;
      entry.leads++;
      if (agendouIdx !== undefined && isAgendamento(asStr(row[agendouIdx]))) entry.agendamentos++;
      if (compareceuIdx !== undefined && isComparecimento(asStr(row[compareceuIdx]))) entry.comparecimentos++;
      if (ganhouIdx !== undefined && isFechamento(asStr(row[ganhouIdx]))) entry.fechamentos++;
    });
    return Array.from(map.entries())
      .map(([nome, v]) => ({ nome, ...v, taxa: v.leads > 0 ? (v.agendamentos / v.leads) * 100 : 0 }))
      .sort((a, b) => b.agendamentos - a.agendamentos);
  }, [filteredRows, col]);

  const funnelPct = (v: number) => v.toFixed(1).replace('.', ',');

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-[#e6edf3] font-sans">
        <header className="h-16 border-b border-[#21262d] flex items-center justify-between px-6 bg-[#0a0c10]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-[#5c54ed] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(92,84,237,0.3)]">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg block leading-none">CRM Dashboard</span>
              <span className="text-[10px] text-[#7d8590] font-bold uppercase tracking-widest">Visualizador</span>
            </div>
          </div>
        </header>
        <main className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-[#111318] rounded-2xl" />
            <div className="grid grid-cols-6 gap-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-[#111318] rounded-2xl" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e6edf3] font-sans">
      <header className="h-16 border-b border-[#21262d] flex items-center justify-between px-6 bg-[#0a0c10]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-[#5c54ed] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(92,84,237,0.3)]">
            <BarChart3 className="text-white w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg block leading-none">
              {selectedCliente ? selectedCliente.nome : 'CRM Dashboard'}
            </span>
            <span className="text-[10px] text-[#7d8590] font-bold uppercase tracking-widest">Visualizador</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedCliente && (
            <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-[#30363d] rounded-xl hover:bg-[#161b22] transition-all">
              <ArrowLeft className="w-3.5 h-3.5" /> Clientes
            </button>
          )}
          <button onClick={() => {
            if (selectedCliente?.sheet_id) fetchData(selectedCliente.sheet_id);
            else if (customSid) handleCustomFetch();
          }} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-[#30363d] rounded-xl hover:bg-[#161b22] transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {!selectedCliente && !customSid && rows.length === 0 ? (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-4 p-4 bg-[#111318] border border-[#21262d] rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[#5c54ed]/20 flex items-center justify-center flex-shrink-0">
                  <Search className="w-5 h-5 text-[#5c54ed]" />
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="text" placeholder="Ou cole um Sheet ID manualmente..." value={customSid}
                    onChange={e => setCustomSid(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleCustomFetch(); }}
                    className="flex-1 bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:border-[#5c54ed] transition-all placeholder:text-[#484f58]"
                  />
                  <button onClick={handleCustomFetch} className="px-4 py-2.5 text-xs font-bold bg-[#5c54ed] text-white rounded-xl hover:bg-[#4a42d4] transition-all whitespace-nowrap">
                    Carregar
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest mb-3">
                Selecione um cliente
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {CLIENTES.map((c, i) => (
                <div key={c.id}>
                  {editSidId === c.id ? (
                    <div className="bg-[#111318] border-2 border-[#5c54ed] rounded-2xl p-4 flex flex-col items-center gap-3">
                      <p className="text-xs font-bold text-center">{c.nome}</p>
                      <input
                        type="text" placeholder="Cole o Sheet ID..." value={editSidValue}
                        onChange={e => setEditSidValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveSid(); }}
                        className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl px-3 py-2 text-[10px] font-mono outline-none focus:border-[#5c54ed] placeholder:text-[#484f58]"
                        autoFocus
                      />
                      <div className="flex gap-2 w-full">
                        <button onClick={handleSaveSid} disabled={!editSidValue} className="flex-1 py-2 text-[10px] font-bold bg-[#5c54ed] text-white rounded-xl hover:bg-[#4a42d4] disabled:opacity-40">
                          Salvar
                        </button>
                        <button onClick={() => setEditSidId(null)} className="py-2 text-[10px] font-bold border border-[#30363d] rounded-xl hover:bg-[#161b22] px-3">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => handleSelectCliente(c)}
                      className="w-full bg-[#111318] border border-[#21262d] rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-[#161b22] hover:border-[#30363d] transition-all group relative">
                      {!c.sheet_id && (
                        <span className="absolute top-2 right-2 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          Configurar
                        </span>
                      )}
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(i)} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                        <span className="text-white font-black text-sm">{getInitials(c.nome)}</span>
                      </div>
                      <span className="text-[11px] font-bold text-center leading-tight">{c.nome}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-[#5c54ed] animate-spin" />
          </div>
        ) : error ? (
          <div className="space-y-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-sm text-red-400">
              {error}
            </div>
            <button onClick={handleBack} className="text-xs text-[#5c54ed] hover:underline">
              ← Voltar para clientes
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-32 text-[#7d8590]">
            <p className="text-lg font-bold">Nenhum dado encontrado</p>
            <p className="text-sm mt-1">Verifique se o Sheet ID está correto</p>
            <button onClick={handleBack} className="mt-4 text-xs text-[#5c54ed] hover:underline">
              ← Voltar para clientes
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                className="bg-[#111318] border border-[#30363d] text-[#e6edf3] rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-[#5c54ed]">
                <option value="Todos">Todos os anos</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                className="bg-[#111318] border border-[#30363d] text-[#e6edf3] rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-[#5c54ed]">
                <option value="Todos">Todos os meses</option>
                {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
              </select>

              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7d8590]" />
                <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#111318] border border-[#30363d] rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-[#5c54ed] transition-all" />
              </div>

              <div className="flex bg-[#111318] border border-[#30363d] rounded-xl overflow-hidden">
                <button onClick={() => setTab('tabela')} className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 ${tab === 'tabela' ? 'bg-[#5c54ed] text-white' : 'text-[#7d8590] hover:text-[#e6edf3]'}`}>
                  <BarChart3 className="w-3.5 h-3.5" /> Performance
                </button>
                <button onClick={() => setTab('funil')} className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 ${tab === 'funil' ? 'bg-[#5c54ed] text-white' : 'text-[#7d8590] hover:text-[#e6edf3]'}`}>
                  <TrendingUp className="w-3.5 h-3.5" /> Funil
                </button>
                <button onClick={() => setTab('dados')} className={`px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 ${tab === 'dados' ? 'bg-[#5c54ed] text-white' : 'text-[#7d8590] hover:text-[#e6edf3]'}`}>
                  <Table2 className="w-3.5 h-3.5" /> Dados
                </button>
                <button onClick={() => setShowDebug(!showDebug)} className={`px-3 py-2.5 text-xs font-bold transition-all ${showDebug ? 'bg-yellow-500/20 text-yellow-400' : 'text-[#7d8590] hover:text-[#e6edf3]'}`}>
                  <Bug className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {showDebug && colMap && Object.keys(colMap).length > 0 && (
              <div className="mb-6 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase text-yellow-400 tracking-widest mb-3">Colunas Detectadas</p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {[
                    'Ano', 'Mes', 'Agendou?', 'Compareceu?', 'Ganhou?', 'Contato?',
                    'Receita de Consultas', 'Receita de Tratamentos',
                    'Campanha', 'Conjunto', 'Anúncio', 'Criativo', 'SourceID', 'Plataforma', 'Mídia', 'Origem'
                  ].map(canonical => {
                    const idx = col(canonical);
                    const headerName = idx !== undefined ? Object.entries(colMap).find(([_, v]) => v === idx)?.[0] : null;
                    return (
                      <div key={canonical} className={`px-3 py-2 rounded-xl text-xs border ${idx !== undefined ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <span className="font-bold block">{canonical}</span>
                        <span className="text-[10px] opacity-70">
                          {idx !== undefined ? `${headerName} [${idx}]` : 'não encontrada'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[#7d8590] mt-3">Total de colunas na planilha: {Object.keys(colMap).length}</p>
                <div className="mt-3 space-y-1 text-[10px] font-mono">
                  <p className="text-yellow-400">Anos detectados: {years.length > 0 ? years.join(', ') : 'nenhum'}</p>
                  <p className="text-yellow-400">Total linhas: {rows.length} | Filtradas: {filteredRows.length}</p>
                  <p className="text-yellow-400">selectedYear: {selectedYear} | selectedMonth: {selectedMonth}</p>
                  {rows.slice(0, 3).map((r, i) => {
                    const di = col('Data'); const mi = col('Mes');
                    return (
                      <p key={i} className="text-[#7d8590]">Row {i}: Data='{di !== undefined ? r[di] : '?'}' | extractYear='{extractYear(r, colMap)}' | Mes='{mi !== undefined ? r[mi] : '?'}'</p>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === 'tabela' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest mb-2">Total Leads</p>
                    <p className="text-3xl font-black">{fmtNum(totals.leads)}</p>
                  </div>
                  <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest mb-2">Receita Consultas</p>
                    <p className="text-2xl font-black text-[#3fb950]">{fmtBRL(totals.receitaC)}</p>
                  </div>
                  <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest mb-2">Receita Tratamentos</p>
                    <p className="text-2xl font-black text-[#a855f7]">{fmtBRL(totals.receitaT)}</p>
                  </div>
                </div>

                <div className="bg-[#111318] border border-[#21262d] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#21262d] bg-[#161b22]">
                          {['Campanha', 'Conjunto', 'Anúncio', 'Criativo', 'SourceID', 'Plataforma', 'Leads', 'Receita C', 'Receita T', 'Stage'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase text-[#7d8590] tracking-widest whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dimensionData.map((d, i) => {
                          const dd = d as Record<string, unknown>;
                          const topStage = Object.entries(dd.stages as Record<string, number>).sort((a, b) => b[1] - a[1])[0];
                          return (
                            <tr key={i} className={`border-b border-[#21262d] hover:bg-[#161b22]/50 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-[#0d1117]/30'}`}>
                              <td className="px-4 py-3 font-bold text-xs">{String(dd.Campanha || '-')}</td>
                              <td className="px-4 py-3 text-xs text-[#7d8590]">{String(dd.Conjunto || '-')}</td>
                              <td className="px-4 py-3 text-xs text-[#7d8590]">{String(dd.Anúncio || '-')}</td>
                              <td className="px-4 py-3 text-xs text-[#7d8590] max-w-[200px] truncate">{String(dd.Criativo || '-')}</td>
                              <td className="px-4 py-3 font-mono text-[10px] text-[#9d97f5]">{String(dd.SourceID || '-')}</td>
                              <td className="px-4 py-3 text-xs">{String(dd.Plataforma || '-')}</td>
                              <td className="px-4 py-3 font-bold">{fmtNum(dd.leads as number)}</td>
                              <td className="px-4 py-3 text-[#3fb950] font-bold">{fmtBRL(dd.receitaC as number)}</td>
                              <td className="px-4 py-3 text-[#a855f7] font-bold">{fmtBRL(dd.receitaT as number)}</td>
                              <td className="px-4 py-3">
                                {topStage && (
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
                                    style={{ borderColor: PIPELINE_COLORS[topStage[0]], color: PIPELINE_COLORS[topStage[0]], backgroundColor: `${PIPELINE_COLORS[topStage[0]]}15` }}>
                                    {PIPELINE_LABELS[topStage[0]] || topStage[0]}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {dimensionData.length === 0 && (
                          <tr><td colSpan={10} className="text-center py-16 text-[#7d8590] text-sm">Nenhum dado para os filtros selecionados</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : tab === 'funil' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest mb-2">👥 Leads</p>
                    <p className="text-3xl font-black">{fmtNum(funnelKpis.leads)}</p>
                  </div>
                  <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest mb-2">📞 Agendamentos</p>
                    <p className="text-3xl font-black">{fmtNum(funnelKpis.agendamentos)}</p>
                    <p className="text-xs text-[#22c55e] font-bold mt-1">{funnelPct(funnelKpis.txAgendamento)}%</p>
                  </div>
                  <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest mb-2">🏥 Comparecimentos</p>
                    <p className="text-3xl font-black">{fmtNum(funnelKpis.comparecimentos)}</p>
                    <p className="text-xs text-[#a855f7] font-bold mt-1">{funnelPct(funnelKpis.txComparecimento)}%</p>
                  </div>
                  <div className="bg-[#111318] border border-[#21262d] rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest mb-2">💰 Fechamentos</p>
                    <p className="text-3xl font-black">{fmtNum(funnelKpis.fechamentos)}</p>
                    <p className="text-xs text-[#3fb950] font-bold mt-1">{funnelPct(funnelKpis.txFechamento)}%</p>
                  </div>
                </div>

                <div className="bg-[#111318] border border-[#21262d] rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#21262d] bg-[#161b22]">
                    <p className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Campanhas que mais geraram Agendamentos</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#21262d] bg-[#0d1117]/50">
                          {['Campanha', 'Leads', 'Agend.', 'Tx Agend.', 'Comp.', 'Fech.'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase text-[#7d8590] tracking-widest whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {campanhaRanking.slice(0, 50).map((d, i) => (
                          <tr key={i} className="border-b border-[#21262d] hover:bg-[#161b22]/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-xs max-w-[250px] truncate">{d.nome}</td>
                            <td className="px-4 py-3">{fmtNum(d.leads)}</td>
                            <td className="px-4 py-3 font-bold text-[#22c55e]">{fmtNum(d.agendamentos)}</td>
                            <td className="px-4 py-3 text-[#7d8590]">{funnelPct(d.taxa)}%</td>
                            <td className="px-4 py-3 text-[#a855f7]">{fmtNum(d.comparecimentos)}</td>
                            <td className="px-4 py-3 text-[#3fb950]">{fmtNum(d.fechamentos)}</td>
                          </tr>
                        ))}
                        {campanhaRanking.length === 0 && (
                          <tr><td colSpan={6} className="text-center py-16 text-[#7d8590] text-sm">Coluna "Campanha" não encontrada na planilha</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-[#111318] border border-[#21262d] rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#21262d] bg-[#161b22]">
                    <p className="text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Anúncios que mais geraram Agendamentos</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#21262d] bg-[#0d1117]/50">
                          {['Anúncio', 'Leads', 'Agend.', 'Tx Agend.', 'Comp.', 'Fech.'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase text-[#7d8590] tracking-widest whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {anuncioRanking.slice(0, 50).map((d, i) => (
                          <tr key={i} className="border-b border-[#21262d] hover:bg-[#161b22]/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-xs max-w-[250px] truncate">{d.nome}</td>
                            <td className="px-4 py-3">{fmtNum(d.leads)}</td>
                            <td className="px-4 py-3 font-bold text-[#22c55e]">{fmtNum(d.agendamentos)}</td>
                            <td className="px-4 py-3 text-[#7d8590]">{funnelPct(d.taxa)}%</td>
                            <td className="px-4 py-3 text-[#a855f7]">{fmtNum(d.comparecimentos)}</td>
                            <td className="px-4 py-3 text-[#3fb950]">{fmtNum(d.fechamentos)}</td>
                          </tr>
                        ))}
                        {anuncioRanking.length === 0 && (
                          <tr><td colSpan={6} className="text-center py-16 text-[#7d8590] text-sm">Coluna "Anúncio" não encontrada na planilha</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#111318] border border-[#21262d] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#161b22]">
                      <tr className="border-b border-[#21262d]">
                        {rows[0] && rows[0].slice(0, 30).map((_, i) => (
                          <th key={i} className="text-left px-3 py-2 text-[9px] font-black uppercase text-[#7d8590] tracking-widest whitespace-nowrap">
                            {Object.entries(colMap).find(([_, v]) => v === i)?.[0] || `Col ${i}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, ri) => (
                        <tr key={ri} className="border-b border-[#21262d] hover:bg-[#161b22]/30 transition-colors">
                          {row.slice(0, 30).map((cell, ci) => (
                            <td key={ci} className="px-3 py-2 text-xs text-[#e6edf3] max-w-[200px] truncate">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-[#21262d] text-[10px] text-[#7d8590] font-bold">
                  {fmtNum(filteredRows.length)} registros exibidos
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
