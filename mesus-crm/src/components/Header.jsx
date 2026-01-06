import React from 'react';
import Icon from './ui/Icon';

export default function Header({ 
    loggedClient, 
    dateRange, 
    setDateRange, 
    currentView, 
    setCurrentView, 
    isAgencyAdmin, 
    syncCRMPlanilha, 
    syncing, 
    handleLogout 
}) {
    return (
        <header className="bg-[#161b22]/90 border-b border-[#30363d] px-4 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center sticky top-0 z-30 shadow-2xl glass-header gap-4 text-left">
            <div className="flex items-center gap-5 w-full md:w-auto text-left">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shrink-0">
                    <Icon name="bar-chart-3" size={28} />
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl font-black text-white uppercase tracking-tight leading-none truncate">{loggedClient?.name || 'Mesus'}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1.5 bg-green-900/20 px-2 py-0.5 rounded-full border border-green-900/30">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse status-active"></span>
                            <span className="text-[8px] text-green-400 font-black uppercase">Supabase Live</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 w-full md:w-auto">
                <div className="flex items-center bg-[#0d1117] p-1.5 rounded-2xl border border-[#30363d] px-4 gap-3">
                    <Icon name="calendar" size={16} className="text-slate-500" />
                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            value={dateRange.start} 
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} 
                            className="bg-transparent border-none text-[10px] font-black uppercase text-indigo-400 focus:ring-0" 
                        />
                        <span className="text-[8px] text-slate-500 font-black uppercase">até</span>
                        <input 
                            type="date" 
                            value={dateRange.end} 
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} 
                            className="bg-transparent border-none text-[10px] font-black uppercase text-indigo-400 focus:ring-0" 
                        />
                    </div>
                </div>
                <nav className="flex bg-[#0d1117] p-1.5 rounded-[1.5rem] border border-[#30363d]">
                    <button onClick={() => setCurrentView('kanban')} className={`px-4 md:px-8 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${currentView === 'kanban' ? 'bg-[#161b22] text-indigo-400 shadow-lg border border-[#30363d]' : 'text-[#484f58]'}`}>CRM</button>
                    <button onClick={() => setCurrentView('dash')} className={`px-4 md:px-8 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${currentView === 'dash' ? 'bg-[#161b22] text-indigo-400 shadow-lg border border-[#30363d]' : 'text-[#484f58]'}`}>Analytics</button>
                    {isAgencyAdmin && <button onClick={() => setCurrentView('admin')} className={`px-4 md:px-8 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${currentView === 'admin' ? 'bg-[#161b22] text-indigo-400 shadow-lg border border-[#30363d]' : 'text-[#484f58]'}`}>Gestão</button>}
                </nav>
                <button onClick={() => syncCRMPlanilha()} disabled={syncing} className={`p-4 bg-[#161b22] border border-[#30363d] rounded-2xl text-[#8b949e] ${syncing ? 'animate-spin text-indigo-500' : ''}`}><Icon name="refresh-cw" /></button>
                <button onClick={handleLogout} className="p-4 bg-[#161b22] border border-[#30363d] rounded-2xl text-[#8b949e] hover:text-red-500 transition-colors text-left"><Icon name="log-out" /></button>
            </div>
        </header>
    );
}