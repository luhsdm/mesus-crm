export const AGENCY_MASTER_KEY = import.meta.env.VITE_AGENCY_MASTER_KEY;
export const FIXED_GID = "1048674045"; // GID pode ficar fixo se não for sensível
export const API_KEY_WINDSOR = import.meta.env.VITE_WINDSOR_API_KEY;
export const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// ... resto do arquivo
export const KANBAN_COLUMNS = [
    { id: 'lead_novo', title: 'Lead Novo', color: 'bg-indigo-500', isFollowUp: false },
    { id: 'em_atendimento', title: 'Em Atendimento', color: 'bg-yellow-500', isFollowUp: true },
    { id: 'agendado', title: 'Agendado', color: 'bg-blue-500', isFollowUp: false },
    { id: 'confirmar', title: 'Confirmar', color: 'bg-purple-500', isFollowUp: false },
    { id: 'comparecimento', title: 'Comparecimento', color: 'bg-green-500', isFollowUp: false },
    { id: 'falta', title: 'Falta', color: 'bg-red-400', isFollowUp: true },
    { id: 'reagendar', title: 'Reagendar', color: 'bg-orange-500', isFollowUp: false },
    { id: 'venda_em_aberto', title: 'Orçamento Aberto', color: 'bg-teal-500', isFollowUp: true },
    { id: 'venda_perdida', title: 'Venda Perdida', color: 'bg-gray-500', isFollowUp: false },
    { id: 'venda_ganha', title: 'Venda Ganha', color: 'bg-emerald-600', isFollowUp: false },
];

export const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2 
    }).format(val || 0);
};