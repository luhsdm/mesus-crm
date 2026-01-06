import React, { useRef } from 'react';
import Icon from './ui/Icon';

export default function Modal({ lead, onClose, onSave }) {
    // Refs substituem document.getElementById para evitar acesso direto ao DOM
    const nameRef = useRef(null);
    const phoneRef = useRef(null);
    const budgetRef = useRef(null);

    const handleSave = () => {
        onSave(lead.id, {
            name: nameRef.current.value,
            phone: phoneRef.current.value,
            budget: parseFloat(budgetRef.current.value || 0)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#161b22] border border-[#30363d] w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300 text-left">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Ficha do Lead</h2>
                    <button onClick={onClose} className="p-3 hover:bg-[#0d1117] rounded-2xl text-slate-500 transition-colors text-left"><Icon name="x" /></button>
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Nome</label>
                            <input ref={nameRef} type="text" className="w-full mt-1 bg-[#0d1117] border border-[#30363d] p-4 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 transition-all text-left" defaultValue={lead.name} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Contacto</label>
                            <input ref={phoneRef} type="text" className="w-full mt-1 bg-[#0d1117] border border-[#30363d] p-4 rounded-2xl text-[#8b949e] font-bold outline-none text-left" defaultValue={lead.phone} />
                        </div>
                    </div>
                    <div className="relative text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Orçamento</label>
                        <div className="relative mt-1">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500"><Icon name="dollar-sign" size={18} /></div>
                            <input ref={budgetRef} type="number" className="w-full bg-[#0d1117] border border-[#30363d] p-4 pl-12 rounded-2xl text-indigo-400 font-black text-xl outline-none" defaultValue={lead.budget} />
                        </div>
                    </div>
                    <button onClick={handleSave} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center justify-center gap-3 shadow-xl active:scale-95 text-left">
                        <Icon name="save" size={20} /> Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}