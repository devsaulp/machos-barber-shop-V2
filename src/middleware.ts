import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Protege /admin: sin sesión → login; con sesión en /admin/login → panel.
export async function middleware(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return respuesta; // sin variables de entorno no hay panel

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies: { name: string; value: string; options: CookieOptions }[]) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ruta = request.nextUrl.pathname;
  if (!user && ruta.startsWith('/admin') && ruta !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (user && ruta === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  return respuesta;
}

export const config = { matcher: ['/admin/:path*'] };
