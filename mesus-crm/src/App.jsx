import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './lib/supabase';
import { AGENCY_MASTER_KEY, FIXED_GID, GOOGLE_APPS_SCRIPT_URL, API_KEY_WINDSOR } from './lib/utils';
import Loading from './components/Loading';
import Login from './components/Login';
import Header from './components/Header';
import Kanban from './components/Kanban';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';
import Modal from './components/Modal';

function App() {
    const [loggedClient, setLoggedClient] = useState(null);
    const [isAgencyAdmin, setIsAgencyAdmin] = useState(false);
    const [accessKey, setAccessKey] = useState('');
    const [allLeads, setAllLeads] = useState([]);
    const [allClients, setAllClients] = useState([]);
    const [currentView, setCurrentView] = useState('kanban');
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncStatusMsg, setSyncStatusMsg] = useState('');
    const [error, setError] = useState(null);
    const [editingLead, setEditingLead] = useState(null);

    const [dateRange, setDateRange] = useState(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    });

    const [adsMetrics, setAdsMetrics] = useState({ investment: 0, adsLeads: 0, loading: false });
    const existingPhonesRef = useRef(new Set());

    const clearMemoryData = () => {
        setAllLeads([]);
        setAdsMetrics({ investment: 0, adsLeads: 0, loading: false });
        setError(null);
        setSyncStatusMsg('');
        existingPhonesRef.current.clear();
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    // 1. Windsor.ai Integration
    const fetchAdsData = useCallback(async () => {
        if (!loggedClient || loggedClient.id === 'admin') return;
        setAdsMetrics(prev => ({ ...prev, loading: true }));
        const mId = String(loggedClient.meta_account_id || "").replace(/\D/g, "");
        const gId = String(loggedClient.google_account_id || "").replace(/\D/g, "");
        const url = `https://connectors.windsor.ai/all?api_key=${API_KEY_WINDSOR}&date_from=${dateRange.start}&date_to=${dateRange.end}&fields=account_id,spend,conversions,leads&_renderer=json`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            const rows = Array.isArray(data) ? data : (data.data || []);
            const clientRows = rows.filter(row => {
                const id = String(row.account_id || "").toLowerCase();
                return (mId && id.includes(mId)) || (gId && id.includes(gId));
            });
            const spend = clientRows.reduce((a, c) => a + (parseFloat(c.spend) || 0), 0);
            const leads = clientRows.reduce((a, c) => a + (parseFloat(c.conversions || c.leads || 0)), 0);
            setAdsMetrics({ investment: spend, adsLeads: Math.round(leads), loading: false });
        } catch (e) {
            setAdsMetrics(prev => ({ ...prev, loading: false }));
        }
    }, [dateRange, loggedClient]);

    useEffect(() => { 
        if (loggedClient && !isAgencyAdmin) fetchAdsData(); 
    }, [loggedClient, dateRange, fetchAdsData]);

    // 2. FETCH LEADS (SUPABASE)
    const fetchLeads = useCallback(async () => {
        if (!loggedClient) return;
        
        let query = supabase.from('leads').select('*');
        if (loggedClient.id !== 'admin') {
            query = query.eq('client_id', loggedClient.id);
        }

        const { data, error } = await query;
        if (error) {
            console.error("Erro ao buscar leads:", error);
            return;
        }

        existingPhonesRef.current = new Set(data.map(l => l.phone));

        const dateFiltered = data.filter(l => {
            const created = l.created_at?.split('T')[0];
            return created >= dateRange.start && created <= dateRange.end;
        });
        setAllLeads(dateFiltered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    }, [loggedClient, dateRange]);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    // 3. SYNC PLANILHA
    const syncCRMPlanilha = useCallback(async (isAuto = false) => {
        if (!loggedClient?.sheet_id || loggedClient.id === 'admin') return;
        if (!isAuto) { setSyncing(true); setSyncStatusMsg('Sincronizando via Supabase...'); }
        
        try {
            const params = new URLSearchParams({ spreadsheetId: loggedClient.sheet_id, gid: FIXED_GID });
            const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`);
            const payload = await response.json();
            
            if (!Array.isArray(payload)) { setSyncStatusMsg('Erro na leitura da planilha.'); return; }

            const leadsToInsert = [];

            for (const row of payload) {
                const name = String(row['Nome'] || row['nome'] || "").trim();
                const tel = String(row['Número'] || row['número'] || row['Telefone'] || row['WhatsApp'] || "").trim().replace(/\D/g, '');

                if (!name || !tel || name.toLowerCase() === "null" || tel.length < 5) continue;

                if (!existingPhonesRef.current.has(tel)) {
                    const budgetRaw = row['Receita de tratamentos'] || row['Orçamento'] || 0;
                    const budgetVal = parseFloat(String(budgetRaw).replace(/[^\d.,]/g, '').replace(',', '.'));
                    
                    leadsToInsert.push({
                        client_id: loggedClient.id,
                        name: name.substring(0, 100),
                        phone: tel,
                        budget: isNaN(budgetVal) ? 0 : budgetVal,
                        source: String(row['Origem'] || "Planilha").trim(),
                        status: 'lead_novo',
                        followup_seq: 0,
                        created_at: new Date().toISOString()
                    });
                    existingPhonesRef.current.add(tel);
                }
            }

            if (leadsToInsert.length > 0) {
                const { error: insError } = await supabase.from('leads').insert(leadsToInsert);
                if (insError) throw insError;
            }

            if (!isAuto) setSyncStatusMsg(leadsToInsert.length > 0 ? `${leadsToInsert.length} novos leads!` : 'Já atualizado.');
            fetchLeads();
        } catch (err) {
            console.error(err);
            if (!isAuto) setSyncStatusMsg('Erro na sincronização.');
        } finally { 
            setSyncing(false); 
            setTimeout(() => setSyncStatusMsg(''), 4000);
        }
    }, [loggedClient, fetchLeads]);

    // 4. Fluxo de Login
    const handleLogin = async () => {
    if (!accessKey) return;

    setLoading(true);
    setError(null);
    clearMemoryData();

    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', accessKey)
        .single();

    if (error || !data) {
        setError("Chave de acesso inválida.");
        setLoading(false);
        return;
    }

    setLoggedClient(data);

    if (data.is_admin === true) {
        setIsAgencyAdmin(true);
        setCurrentView('admin');
    } else {
        setIsAgencyAdmin(false);
        setCurrentView('kanban');
    }

    setLoading(false);
};

    // 5. Admin Actions
    useEffect(() => {
        if (isAgencyAdmin) {
            const fetchClients = async () => {
                const { data } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
                setAllClients(data || []);
            };
            fetchClients();
        }
    }, [isAgencyAdmin]);

    const registerNewClient = async (e) => {
        e.preventDefault();
        const form = e.target;
        const { error } = await supabase.from('clientes').insert([{
            id: form.cli_id.value.trim(),
            name: form.cli_name.value,
            meta_account_id: form.cli_meta.value,
            google_account_id: form.cli_google.value,
            sheet_id: form.cli_sheet.value,
            sheet_gid: FIXED_GID,
            role: "cliente",
            created_at: new Date().toISOString()
        }]);
        if (!error) { alert("Cliente salvo!"); form.reset(); }
        else alert("Erro ao cadastrar: ID já existe.");
    };

    const clearLeadsOfClient = async (id) => {
        if (!confirm("Limpar leads?")) return;
        await supabase.from('leads').delete().eq('client_id', id);
        fetchLeads();
        alert("Limpo.");
    };

    const deleteClient = async (id) => {
        if (!confirm("Excluir cliente?")) return;
        await supabase.from('clientes').delete().eq('id', id);
        const { data } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
        setAllClients(data || []);
    };

    // 6. Lead Actions
    const updateStatus = async (id, status) => {
        await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
        fetchLeads();
    };

    const incrementFollowUp = async (e, lead) => {
        e.stopPropagation();
        const nextFO = Math.min((lead.followup_seq || 0) + 1, 5);
        await supabase.from('leads').update({ followup_seq: nextFO, updated_at: new Date().toISOString() }).eq('id', lead.id);
        fetchLeads();
    };

    const saveLeadEdit = async (id, data) => {
        await supabase.from('leads').update(data).eq('id', id);
        setEditingLead(null);
        fetchLeads();
    };

    if (loading) return <Loading />;

    if (!loggedClient) {
        return <Login accessKey={accessKey} setAccessKey={setAccessKey} handleLogin={handleLogin} error={error} />;
    }

    return (
        <div className="min-h-screen bg-[#0d1117] font-sans text-[#c9d1d9] text-left">
            <Header 
                loggedClient={loggedClient}
                dateRange={dateRange}
                setDateRange={setDateRange}
                currentView={currentView}
                setCurrentView={setCurrentView}
                isAgencyAdmin={isAgencyAdmin}
                syncCRMPlanilha={syncCRMPlanilha}
                syncing={syncing}
                handleLogout={() => { clearMemoryData(); setLoggedClient(null); setIsAgencyAdmin(false); }}
            />

            {syncStatusMsg && <div className="bg-indigo-600 text-white text-[10px] font-black uppercase py-2 text-center animate-pulse">{syncStatusMsg}</div>}

            <main className="p-4 md:p-12 w-full mx-auto overflow-hidden">
                {currentView === 'kanban' && (
                    <Kanban 
                        allLeads={allLeads} 
                        updateStatus={updateStatus} 
                        setEditingLead={setEditingLead} 
                        incrementFollowUp={incrementFollowUp} 
                    />
                )}

                {currentView === 'dash' && (
                    <Dashboard adsMetrics={adsMetrics} allLeads={allLeads} />
                )}

                {currentView === 'admin' && isAgencyAdmin && (
                    <Admin 
                        allClients={allClients} 
                        registerNewClient={registerNewClient} 
                        deleteClient={deleteClient} 
                        clearLeadsOfClient={clearLeadsOfClient} 
                    />
                )}
            </main>

            {editingLead && (
                <Modal lead={editingLead} onClose={() => setEditingLead(null)} onSave={saveLeadEdit} />
            )}
        </div>
    );
}

export default App;