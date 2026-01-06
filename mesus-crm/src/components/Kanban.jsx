import React, { useRef } from 'react';
import { KANBAN_COLUMNS, formatCurrency } from '../lib/utils';

export default function Kanban({ allLeads, updateStatus, setEditingLead, incrementFollowUp }) {
    const scrollContainerRef = useRef(null);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    const handleBoardMouseDown = (e) => {
        if (e.target.closest('.lead-card') || e.target.closest('button')) return;
        isDraggingRef.current = true;
        startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    };

    const handleBoardMouseMove = (e) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        const walk = (e.pageX - scrollContainerRef.current.offsetLeft - startXRef.current) * 2; 
        scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none text-left">Pipeline Comercial</h2>
            <div 
                ref={scrollContainerRef} 
                onMouseDown={handleBoardMouseDown} 
                onMouseLeave={() => isDraggingRef.current = false} 
                onMouseUp={() => isDraggingRef.current = false} 
                onMouseMove={handleBoardMouseMove} 
                className="flex gap-8 overflow-x-auto pb-12 min-h-[80vh] custom-scrollbar grab-scroll scroll-smooth text-left"
            >
                {KANBAN_COLUMNS.map(col => {
                    const colLeads = allLeads.filter(l => l.status === col.id);
                    return (
                        <div 
                            key={col.id} 
                            onDragOver={(e) => e.preventDefault()} 
                            onDrop={(e) => updateStatus(e.dataTransfer.getData("id"), col.id)} 
                            className="flex-shrink-0 w-[18rem] md:w-[25rem] bg-[#161b22]/40 rounded-[2.5rem] md:rounded-[3.5rem] p-5 md:p-7 flex flex-col border border-[#30363d] backdrop-blur-md"
                        >
                            <div className={`flex justify-between items-center mb-6 md:mb-8 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] text-white font-black shadow-2xl ${col.color}`}>
                                <span className="text-[10px] md:text-[12px] uppercase tracking-[0.2em]">{col.title}</span>
                                <span className="bg-black/30 px-3 md:px-5 py-1 md:py-2 rounded-2xl text-[10px] font-black">{colLeads.length}</span>
                            </div>
                            <div className="flex-1 space-y-4 md:space-y-5 overflow-y-auto pr-2 custom-scrollbar">
                                {colLeads.map(l => (
                                    <div 
                                        key={l.id} 
                                        draggable 
                                        onDragStart={(e) => e.dataTransfer.setData("id", l.id)} 
                                        onClick={() => setEditingLead(l)} 
                                        className="bg-[#1c2128] p-5 md:p-7 rounded-[2rem] md:rounded-[2.5rem] border border-[#30363d] hover:border-indigo-500 transition-all cursor-pointer group shadow-md active:cursor-grabbing text-left lead-card"
                                    >
                                        <p className="font-black text-white text-md group-hover:text-indigo-400 transition truncate mb-2">{l.name}</p>
                                        <p className="text-[11px] text-[#8b949e] font-bold mb-1">{l.phone}</p>
                                        <p className="text-[10px] text-[#484f58] font-black uppercase truncate">{l.source}</p>
                                        {l.budget > 0 && <div className="mt-4 pt-4 border-t border-[#30363d] flex justify-between items-center"><span className="text-[9px] font-black text-[#484f58] uppercase">Tratamento</span><p className="text-lg font-black text-indigo-400">{formatCurrency(l.budget)}</p></div>}
                                        {col.isFollowUp && (
                                            <div className="mt-5 pt-4 border-t border-[#30363d]">
                                                <div className="flex justify-between items-center mb-2"><span className="text-[9px] font-black text-amber-500 uppercase">Follow-up</span><span className="text-[10px] font-black text-amber-500">{l.followup_seq || 0}/5</span></div>
                                                <div className="flex gap-1.5" onClick={(e) => incrementFollowUp(e, l)}>{[1, 2, 3, 4, 5].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= (l.followup_seq || 0) ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-[#0d1117]'}`}></div>)}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}