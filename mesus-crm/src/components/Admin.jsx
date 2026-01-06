import React from 'react';
import Icon from './ui/Icon';

export default function Admin({ allClients, registerNewClient, deleteClient, clearLeadsOfClient }) {
    return (
        <div className="space-y-16 animate-in fade-in duration-700 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
                <div className="bg-[#161b22] p-12 rounded-[4rem] border border-[#30363d] shadow-2xl text-left">
                    <h3 className="text-xl font-bold text-white mb-8 border-b border-[#30363d] pb-4">Onboarding Supabase</h3>
                    <form onSubmit={registerNewClient} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Login (ID)</label><input name="cli_id" type="text" placeholder="Ex: clinica_01" className="w-full mt-2 bg-[#0d1117] border border-[#30363d] p-5 rounded-2xl text-white font-bold outline-none" required /></div>
                            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome</label><input name="cli_name" type="text" placeholder="Nome Clínica" className="w-full mt-2 bg-[#0d1117] border border-[#30363d] p-5 rounded-2xl text-white font-bold outline-none" required /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Meta Ads ID</label><input name="cli_meta" type="text" className="w-full mt-2 bg-[#0d1117] border border-[#30363d] p-5 rounded-2xl text-[#8b949e] font-bold outline-none" /></div>
                            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Google Ads ID</label><input name="cli_google" type="text" className="w-full mt-2 bg-[#0d1117] border border-[#30363d] p-5 rounded-2xl text-[#8b949e] font-bold outline-none" /></div>
                        </div>
                        <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Sheet ID</label><input name="cli_sheet" type="text" className="w-full mt-2 bg-[#0d1117] border border-[#30363d] p-5 rounded-2xl text-[#8b949e] font-bold outline-none" /></div>
                        <button type="submit" className="w-full bg-emerald-600 text-white p-6 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition flex items-center justify-center gap-3 shadow-xl"><Icon name="user-plus" /> Registrar Cliente</button>
                    </form>
                </div>
                <div className="bg-[#161b22] p-12 rounded-[4rem] border border-[#30363d] shadow-2xl flex flex-col text-left">
                    <h3 className="text-xl font-bold text-white mb-8 border-b border-[#30363d] pb-4 text-left">Gestão de Acessos ({allClients.length})</h3>
                    <div className="overflow-y-auto max-h-[500px] custom-scrollbar pr-4 text-left">
                        <div className="space-y-4">
                            {allClients.map(c => (
                                <div key={c.id} className="bg-[#0d1117] p-6 rounded-[2rem] border border-[#30363d] flex justify-between items-center group hover:border-indigo-500 transition-all text-left">
                                    <div className="text-left">
                                        <p className="font-black text-white text-lg leading-tight">{c.name}</p>
                                        <p className="text-indigo-400 font-bold text-[11px] uppercase tracking-widest mt-1 text-left">Chave: {c.id}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => clearLeadsOfClient(c.id)} className="p-4 bg-amber-900/10 text-amber-500 rounded-2xl hover:bg-amber-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 text-left"><Icon name="trash-2" size={20} /></button>
                                        <button onClick={() => deleteClient(c.id)} className="p-4 bg-red-900/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 text-left"><Icon name="x-circle" size={20} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}