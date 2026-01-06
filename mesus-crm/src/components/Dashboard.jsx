import React from 'react';
import Icon from './ui/Icon';
import { formatCurrency } from '../lib/utils';

function StatCard({ title, value, icon, color, sub }) {
    return (
        <div className={`${color} p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group hover:scale-[1.04] transition-all duration-500 border border-[#30363d] min-h-[160px] flex flex-col justify-center text-left`}>
            <div className="relative z-10 text-left">
                <div className="bg-[#0d1117]/60 w-10 h-10 rounded-[0.75rem] flex items-center justify-center mb-4 border border-[#30363d]">{icon}</div>
                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-300/70 mb-1">{title}</p>
                <p className="text-xl xl:text-2xl font-black tracking-tighter text-white truncate leading-tight" title={value}>{value}</p>
                <p className="text-[7px] font-bold mt-4 text-slate-400/50 uppercase tracking-widest">{sub}</p>
            </div>
        </div>
    );
}

function VolumeItem({ label, value, color }) {
    return (
        <div className="flex items-center justify-between px-2 md:px-6 text-right">
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">{label}</p>
            <p className={`text-2xl md:text-4xl font-black ${color} tracking-tighter`}>{value}</p>
        </div>
    );
}

function ConversionCircle({ label, percent, sub, color }) {
    return (
        <div className="text-center flex flex-col items-center group text-center">
            <div className="relative w-28 h-28 md:w-40 md:h-40 flex items-center justify-center mb-4 md:mb-8 text-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r="45%" stroke="#0d1117" strokeWidth="8" fill="transparent" />
                    <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="300" strokeDashoffset={300 - (300 * percent) / 100} strokeLinecap="round" className={`${color} transition-all duration-1000 shadow-[0_0_20px_currentColor]`} />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                    <span className={`text-xl md:text-4xl font-black tracking-tighter ${color}`}>{percent.toFixed(1)}%</span>
                </div>
            </div>
            <p className="text-[9px] md:text-xs font-black text-white uppercase tracking-[0.2em] mb-1 text-center">{label}</p>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tighter text-center">{sub}</p>
        </div>
    );
}

export default function Dashboard({ adsMetrics, allLeads }) {
    const faturamentoReal = allLeads.filter(l => l.status === 'venda_ganha').reduce((acc, curr) => acc + (parseFloat(curr.budget) || 0), 0);
    const agendadosT = allLeads.filter(l => ['agendado','confirmar','comparecimento','falta','reagendar','venda_em_aberto','venda_ganha','venda_perdida'].includes(l.status)).length;
    const compareceramT = allLeads.filter(l => ['comparecimento','venda_em_aberto','venda_ganha','venda_perdida'].includes(l.status)).length;
    const vendasT = allLeads.filter(l => l.status === 'venda_ganha').length;

    const taxaAgendamento = allLeads.length > 0 ? (agendadosT / allLeads.length) * 100 : 0;
    const taxaShowUp = agendadosT > 0 ? (compareceramT / agendadosT) * 100 : 0;
    const taxaVendas = compareceramT > 0 ? (vendasT / compareceramT) * 100 : 0;

    const roas = adsMetrics.investment > 0 ? faturamentoReal / adsMetrics.investment : 0;
    const cac = vendasT > 0 ? adsMetrics.investment / vendasT : adsMetrics.investment;

    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                <StatCard title="Investimento Ads" value={adsMetrics.loading ? "..." : formatCurrency(adsMetrics.investment)} icon={<Icon name="dollar-sign" />} color="bg-[#161b22]" sub="Windsor Data" />
                <StatCard title="Faturamento CRM" value={formatCurrency(faturamentoReal)} icon={<Icon name="trending-up" />} color="bg-[#161b22]" sub="Vendas Ganhas" />
                <StatCard title="ROAS Real" value={roas.toFixed(2)} icon={<Icon name="target" />} color="bg-indigo-600" sub="Eficiência Real" />
                <StatCard title="CAC Médio" value={formatCurrency(cac)} icon={<Icon name="users" />} color="bg-[#161b22]" sub="Custo Aquisição" />
            </div>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 bg-[#161b22] p-12 rounded-[4.5rem] border border-[#30363d] shadow-2xl flex flex-col justify-between">
                    <h3 className="text-2xl font-black text-white mb-14 uppercase tracking-tighter text-right px-4">Métricas Funil</h3>
                    <div className="space-y-12 text-right px-8">
                        <VolumeItem label="Leads Windsor Ads" value={adsMetrics.adsLeads} color="text-[#484f58]" />
                        <VolumeItem label="Leads no CRM" value={allLeads.length} color="text-indigo-400" />
                        <div className="h-px bg-[#30363d]"></div>
                        <VolumeItem label="Agendamentos" value={agendadosT} color="text-blue-400" />
                        <VolumeItem label="Comparecimentos" value={compareceramT} color="text-purple-400" />
                        <VolumeItem label="Vendas Ganhas" value={vendasT} color="text-emerald-500" />
                    </div>
                </div>
                <div className="lg:col-span-2 bg-[#161b22] p-14 rounded-[4.5rem] border border-[#30363d] shadow-2xl text-center">
                    <h3 className="text-2xl font-black text-white mb-14 uppercase tracking-tighter text-center">Taxas de Eficiência</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                        <ConversionCircle label="Taxa Agendamento" percent={taxaAgendamento} sub="Leads → Agenda" color="text-indigo-400" />
                        <ConversionCircle label="Taxa Show-up" percent={taxaShowUp} sub="Agenda → Show" color="text-blue-400" />
                        <ConversionCircle label="Taxa Vendas" percent={taxaVendas} sub="Show → Vendas" color="text-emerald-500" />
                    </div>
                </div>
            </section>
        </div>
    );
}