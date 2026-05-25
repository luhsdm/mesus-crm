import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * ROTA DE SINCRONIZAÇÃO SEGURA
 * Caminho: /src/app/api/sync/route.ts
 *
 * Esta rota:
 * 1. Verifica autenticação
 * 2. Pega o sheet_id do cliente
 * 3. Chama Google Apps Script para trazer dados
 * 4. INSERE os dados na tabela leads do Supabase
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const startDateInput = body.start_date;
    const endDateInput = body.end_date;

    // 1. Verificar Autenticação
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log(`[SYNC] Iniciando sincronização para usuário: ${user.id}`);

    // 2. Pegar o sheet_id do cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('sheet_id')
      .eq('id', user.id)
      .single();

    if (clienteError || !cliente?.sheet_id) {
      console.error('[SYNC] Erro ao buscar cliente:', clienteError);
      return NextResponse.json(
        { error: 'Configuração da planilha não encontrada' },
        { status: 404 }
      );
    }

    console.log(`[SYNC] Sheet ID encontrado: ${cliente.sheet_id}`);

    // 3. Chamar Google Apps Script
    const gasUrl = process.env.GAS_SYNC_URL;
    const gasToken = process.env.N8N_SECRET_TOKEN;

    if (!gasUrl || !gasToken) {
      throw new Error('Variáveis GAS_SYNC_URL ou N8N_SECRET_TOKEN não configuradas');
    }

    // Pegar o período do filtro do dashboard (ultimos 30 dias por padrao)
    const endDate = endDateInput ? new Date(endDateInput) : new Date();
    const startDate = startDateInput ? new Date(startDateInput) : new Date(new Date().setDate(new Date().getDate() - 30));

    const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`[SYNC] Sincronizando período: ${startDateStr} até ${endDateStr}`);
    const syncUrl = `${gasUrl}?sheet_id=${cliente.sheet_id}&start_date=${startDateStr}&end_date=${endDateStr}`;

    console.log('[SYNC] Chamando Google Apps Script...');
    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gasToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[SYNC] Erro GAS:', errorData);
      throw new Error(`Google Apps Script retornou erro: ${response.status}`);
    }

    const leads = await response.json();
    console.log(`[SYNC] Recebidos ${Array.isArray(leads) ? leads.length : 0} leads do GAS`);
    console.log(`[SYNC] Amostra do primeiro lead:`, leads[0]);

    if (!Array.isArray(leads) || leads.length === 0) {
      console.warn('[SYNC] Nenhum lead retornado do GAS');
      return NextResponse.json({
        success: true,
        message: 'Sincronização concluída (0 registros)',
        count: 0,
      });
    }

    // 4. Processar leads antes de inserir
const processedLeads = leads.map((lead: any) => {
  const statusMapping: Record<string, string> = {
    'Cadastrado': 'lead_novo',
    'Em Atendimento': 'em_atendimento',
    'Agendado': 'agendado',
    'Confirmar': 'confirmar',
    'Compareceu': 'comparecimento',
    'Falta': 'falta',
    'Reagendar': 'reagendar',
    'Orçamento': 'venda_em_aberto',
    'Venda Ganha': 'venda_ganha',
    'Perdida': 'venda_perdida',
    'lead_novo': 'lead_novo',
    'em_atendimento': 'em_atendimento',
    'agendado': 'agendado',
    'confirmar': 'confirmar',
    'comparecimento': 'comparecimento',
    'falta': 'falta',
    'reagendar': 'reagendar',
    'venda_em_aberto': 'venda_em_aberto',
    'venda_ganha': 'venda_ganha',
    'venda_perdida': 'venda_perdida',
  };

  return {
    user_id: user.id,
    name: (lead.name || lead.Nome || '').toString().trim(),
    phone: (lead.phone || lead.Telefone || '').toString().trim(),
    budget: parseFloat(lead.budget || lead.Orçamento) || 0,
    notes: (lead.notes || lead.Observações || '').toString(),
    status: statusMapping[lead.status] || 'lead_novo',
    follow_up: parseInt(lead.follow_up || 0),
    created_at: lead.created_at || new Date().toISOString(),
  };
}).filter((lead: any) => lead.name !== '' && lead.phone !== '');

// dedupe local antes do upsert (mesmo usuário + nome + telefone)
const dedupeMap = new Map<string, boolean>();
const dedupedLeads = processedLeads.reverse().filter((lead: any) => {
  const key = `${lead.user_id}::${lead.name}::${lead.phone}`;
  if (dedupeMap.has(key)) return false;
  dedupeMap.set(key, true);
  return true;
}).reverse(); // mantém o mais recente por key

console.log(`[SYNC] Deduplicados: ${processedLeads.length} -> ${dedupedLeads.length}`);

if (dedupedLeads.length === 0) {
  return NextResponse.json({
    success: true,
    message: 'Nenhum lead válido para inserir',
    count: 0,
  });
}

// 5. Inserção/upsert no Supabase
console.log(`[SYNC] Iniciando upsert de ${dedupedLeads.length} leads...`);
const { data, error: insertError } = await supabase
  .from('leads')
  .upsert(dedupedLeads, { onConflict: 'user_id,name,phone' });

if (insertError) {
  console.error('[SYNC] Erro ao inserir leads:', insertError);
  throw insertError;
}

const insertedCount = data ? data.length : dedupedLeads.length;
console.log(`[SYNC] ✅ ${insertedCount} leads sincronizados com sucesso (upsert)`);

return NextResponse.json({
  success: true,
  message: `✅ Sincronização concluída: ${insertedCount} leads importados`,
  count: insertedCount,
});

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[SYNC] ❌ Erro na sincronização:', message);
    return NextResponse.json(
      { error: 'Erro ao sincronizar: ' + message },
      { status: 500 }
    );
  }
}

