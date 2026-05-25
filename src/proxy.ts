/**
 * @deprecated Este arquivo foi substituído por /middleware.ts na raiz do projeto.
 * O Next.js ignora este arquivo pois o middleware deve se chamar `middleware.ts`
 * e estar na raiz do projeto (fora de /src).
 *
 * NÃO EDITE ESTE ARQUIVO. Edite /middleware.ts.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * PROXY DE SEGURANÇA (Middleware)
 * Caminho: /src/proxy.ts
 * * Este ficheiro gere a interceção de rotas e protege o acesso ao dashboard.
 * Atualizado para cumprir os requisitos de manipulação de cookies do @supabase/ssr.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Inicialização do cliente Supabase com gestão explícita de cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Proteção de Rotas baseada na Sessão
  const { data: { session } } = await supabase.auth.getSession();

  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  // Redirecionamento: Utilizador não autenticado -> Login
  if (!session && isDashboardPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirecionamento: Utilizador já autenticado -> Dashboard (evita re-login)
  if (session && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

// Configuração de correspondência de rotas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};