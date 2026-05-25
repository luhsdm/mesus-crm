import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Cliente com service role — ignora RLS, pode criar usuários
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getSessionAndRole() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.app_metadata?.role ?? null;
  return { user, role };
}

// GET /api/admin/clients — lista todos os clientes
export async function GET() {
  const { user, role } = await getSessionAndRole();
  if (!user || role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const service = getServiceClient();
  const { data: users, error: usersError } = await service.auth.admin.listUsers();
  if (usersError) {
    return NextResponse.json({ error: 'Erro ao listar usuários' }, { status: 500 });
  }

  const { data: clientes } = await service.from('clientes').select('*');
  const clientesMap = new Map((clientes ?? []).map((c: { id: string; sheet_id: string; nome: string; instance: string; apikey: string }) => [c.id, c]));

  const result = users.users.map(u => ({
    id: u.id,
    email: u.email,
    role: u.app_metadata?.role ?? 'user',
    created_at: u.created_at,
    sheet_id: clientesMap.get(u.id)?.sheet_id ?? null,
    nome: clientesMap.get(u.id)?.nome ?? null,
    instance: clientesMap.get(u.id)?.instance ?? null,
    apikey: clientesMap.get(u.id)?.apikey ?? null,
  }));

  return NextResponse.json(result);
}

// POST /api/admin/clients — cria novo cliente/usuário
export async function POST(req: NextRequest) {
  const { user, role } = await getSessionAndRole();
  if (!user || role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const body = await req.json();
  const { email, password, nome, sheet_id, instance, apikey } = body as {
    email: string;
    password: string;
    nome?: string;
    sheet_id?: string;
    instance?: string;
    apikey?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
  }

  const service = getServiceClient();

  // Cria o usuário no Auth
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: 'user' },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  // Atualiza nome, sheet_id, instance e apikey na tabela clientes
  if (nome || sheet_id || instance || apikey) {
    await service.from('clientes')
      .update({ nome: nome ?? null, sheet_id: sheet_id ?? null, instance: instance ?? null, apikey: apikey ?? null })
      .eq('id', created.user.id);
  }

  return NextResponse.json({ success: true, id: created.user.id });
}

// PUT /api/admin/clients — edita cliente existente
export async function PUT(req: NextRequest) {
  const { user, role } = await getSessionAndRole();
  if (!user || role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const body = await req.json();
  const { id, nome, sheet_id, instance, apikey } = body as {
    id: string;
    nome?: string;
    sheet_id?: string;
    instance?: string;
    apikey?: string;
  };

  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const service = getServiceClient();

  // Atualiza os campos na tabela clientes
  const { error } = await service.from('clientes')
    .update({
      nome: nome ?? null,
      sheet_id: sheet_id ?? null,
      instance: instance ?? null,
      apikey: apikey ?? null,
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/clients — remove usuário
export async function DELETE(req: NextRequest) {
  const { user, role } = await getSessionAndRole();
  if (!user || role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { id } = await req.json() as { id: string };
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

  const service = getServiceClient();
  const { error } = await service.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
