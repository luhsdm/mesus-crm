'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  X,
  UserPlus,
  Sheet,
  Mail,
  Lock,
  User,
  Edit2,
  Key,
} from 'lucide-react';

interface Cliente {
  id: string;
  email: string;
  role: string;
  created_at: string;
  sheet_id: string | null;
  nome: string | null;
  instance: string | null;
  apikey: string | null;
}

export default function AdminPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '', nome: '', sheet_id: '', instance: '', apikey: '' });
  const [editForm, setEditForm] = useState({ nome: '', sheet_id: '', instance: '', apikey: '' });

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/clients');
    if (res.ok) {
      const data = await res.json();
      setClientes(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const handleCreate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Erro ao criar cliente');
    } else {
      setShowForm(false);
      setForm({ email: '', password: '', nome: '', sheet_id: '', instance: '', apikey: '' });
      fetchClientes();
    }
    setSaving(false);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingId(cliente.id);
    setEditForm({
      nome: cliente.nome ?? '',
      sheet_id: cliente.sheet_id ?? '',
      instance: cliente.instance ?? '',
      apikey: cliente.apikey ?? '',
    });
    setShowEditForm(true);
    setError(null);
  };

  const handleUpdate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError(null);

    const res = await fetch('/api/admin/clients', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, ...editForm }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Erro ao atualizar cliente');
    } else {
      setShowEditForm(false);
      setEditingId(null);
      setEditForm({ nome: '', sheet_id: '', instance: '', apikey: '' });
      fetchClientes();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remover o cliente ${email}? Esta ação não pode ser desfeita.`)) return;
    await fetch('/api/admin/clients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchClientes();
  };

  const handleSignOut = async () => {
    const { createBrowserClient } = await import('@supabase/ssr');
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await sb.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e6edf3] font-sans">
      {/* Header */}
      <header className="h-16 border-b border-[#21262d] flex items-center justify-between px-6 bg-[#0a0c10]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-[#5c54ed] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(92,84,237,0.3)]">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg block leading-none">Mesus CRM</span>
            <span className="text-[10px] text-[#7d8590] font-bold uppercase tracking-widest">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#7d8590] hover:text-[#e6edf3] border border-[#30363d] rounded-xl hover:bg-[#161b22] transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </a>
          <button
            onClick={handleSignOut}
            aria-label="Sair"
            className="p-2.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl text-[#7d8590] transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-8 max-w-5xl mx-auto">
        {/* Título + botão */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <Users className="w-6 h-6 text-[#5c54ed]" />
              Clientes
            </h2>
            <p className="text-xs text-[#7d8590] mt-1">Gerencie os acessos ao sistema.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#5c54ed] text-white rounded-xl text-xs font-bold hover:bg-[#4a42d4] transition-all shadow-lg shadow-[#5c54ed]/20"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>

        {/* Lista de clientes */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="w-6 h-6 text-[#5c54ed] animate-spin" />
          </div>
        ) : (
          <div className="border border-[#21262d] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#21262d] bg-[#111318]">
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Nome</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-[#7d8590] tracking-widest">E-mail</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Sheet ID</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Instance</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Role</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-[#7d8590] tracking-widest">Criado em</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-[#7d8590] text-sm">
                      Nenhum cliente cadastrado ainda.
                    </td>
                  </tr>
                )}
                {clientes.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-[#21262d] hover:bg-[#111318]/50 transition-colors ${i === clientes.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <td className="px-6 py-4 font-bold">{c.nome ?? <span className="text-[#484f58]">—</span>}</td>
                    <td className="px-6 py-4 text-[#7d8590] font-mono text-xs">{c.email}</td>
                    <td className="px-6 py-4">
                      {c.sheet_id ? (
                        <span className="text-xs font-mono bg-[#111318] border border-[#30363d] px-2 py-1 rounded-lg text-[#9d97f5]">
                          {c.sheet_id.slice(0, 15)}…
                        </span>
                      ) : (
                        <span className="text-[#484f58] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {c.instance ? (
                        <span className="text-xs font-mono bg-[#111318] border border-[#30363d] px-2 py-1 rounded-lg text-[#9d97f5]">
                          {c.instance.slice(0, 15)}…
                        </span>
                      ) : (
                        <span className="text-[#484f58] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        c.role === 'admin'
                          ? 'bg-[#5c54ed]/20 text-[#9d97f5] border-[#5c54ed]/30'
                          : 'bg-[#111318] text-[#7d8590] border-[#30363d]'
                      }`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#7d8590] text-xs">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        aria-label={`Editar ${c.email}`}
                        className="p-2 hover:bg-[#5c54ed]/10 rounded-xl text-[#7d8590] hover:text-[#5c54ed] transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.email ?? '')}
                        aria-label={`Remover ${c.email}`}
                        className="p-2 hover:bg-red-500/10 rounded-xl text-[#484f58] hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal: Novo Cliente */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111318] border border-[#21262d] rounded-[32px] w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-8 py-6 border-b border-[#21262d] sticky top-0 bg-[#111318]">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#5c54ed]" />
                Novo Cliente
              </h3>
              <button onClick={() => setShowForm(false)} aria-label="Fechar" className="p-2 hover:bg-[#161b22] rounded-xl text-[#7d8590]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">Nome</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
                  <input
                    type="text"
                    placeholder="Nome da empresa ou pessoa"
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#5c54ed] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">E-mail *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
                  <input
                    type="email"
                    required
                    placeholder="cliente@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#5c54ed] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#5c54ed] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">Google Sheet ID</label>
                <div className="relative">
                  <Sheet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
                  <input
                    type="text"
                    placeholder="ID da planilha do Google"
                    value={form.sheet_id}
                    onChange={e => setForm({ ...form, sheet_id: e.target.value })}
                    className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#5c54ed] outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">Instance URL</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
                  <input
                    type="text"
                    placeholder="URL da instância (ex: https://n8n.empresa.com)"
                    value={form.instance}
                    onChange={e => setForm({ ...form, instance: e.target.value })}
                    className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#5c54ed] outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">API Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
                  <input
                    type="password"
                    placeholder="Chave de API da instância N8N"
                    value={form.apikey}
                    onChange={e => setForm({ ...form, apikey: e.target.value })}
                    className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#5c54ed] outline-none font-mono text-xs"
                  />
                </div>
              </div>

              {error && (
                <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#5c54ed] hover:bg-[#4a42d4] text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Criar Cliente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Cliente */}
      {showEditForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111318] border border-[#21262d] rounded-[32px] w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-8 py-6 border-b border-[#21262d] sticky top-0 bg-[#111318]">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#5c54ed]" />
                Editar Cliente
              </h3>
              <button onClick={() => setShowEditForm(false)} aria-label="Fechar" className="p-2 hover:bg-[#161b22] rounded-xl text-[#7d8590]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">Nome</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
                  <input
                    type="text"
                    placeholder="Nome da empresa ou pessoa"
                    value={editForm.nome}
                    onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                    className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#5c54ed] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">Google Sheet ID</label>
                <div className="relative">
                  <Sheet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
                  <input
                    type="text"
                    placeholder="ID da planilha do Google"
                    value={editForm.sheet_id}
                    onChange={e => setEditForm({ ...editForm, sheet_id: e.target.value })}
                    className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#5c54ed] outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">Instance URL</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
                  <input
                    type="text"
                    placeholder="URL da instância (ex: https://n8n.empresa.com)"
                    value={editForm.instance}
                    onChange={e => setEditForm({ ...editForm, instance: e.target.value })}
                    className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#5c54ed] outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#7d8590] block mb-2">API Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
                  <input
                    type="password"
                    placeholder="Chave de API da instância N8N"
                    value={editForm.apikey}
                    onChange={e => setEditForm({ ...editForm, apikey: e.target.value })}
                    className="w-full bg-[#0a0c10] border border-[#30363d] text-[#e6edf3] rounded-xl py-3 pl-12 pr-4 text-sm focus:border-[#5c54ed] outline-none font-mono text-xs"
                  />
                </div>
              </div>

              {error && (
                <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 bg-[#30363d] hover:bg-[#3d444c] text-[#e6edf3] font-bold py-4 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#5c54ed] hover:bg-[#4a42d4] text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                  Atualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
