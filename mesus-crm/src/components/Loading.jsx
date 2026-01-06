import React from 'react';
import Icon from './ui/Icon';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center gap-4">
            <Icon name="refresh-cw" size={48} className="animate-spin text-indigo-500" />
            <p className="font-black text-indigo-500 tracking-widest text-[10px] uppercase">Conectando ao Supabase...</p>
        </div>
    );
}