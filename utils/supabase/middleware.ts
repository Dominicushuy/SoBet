// utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  // Lấy đường dẫn từ URL
  const { pathname } = request.nextUrl;

  // Kiểm tra xem route có được bảo vệ không
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute =
    pathname.startsWith('/bet') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/verification') ||
    isAdminRoute;

  // Kiểm tra xem route có phải là route đăng nhập
  const isLoginRoute = pathname.startsWith('/login');

  // Nếu người dùng đã đăng nhập và đang cố truy cập trang đăng nhập, chuyển hướng về trang chủ
  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Nếu route được bảo vệ và người dùng chưa xác thực, chuyển hướng đến đăng nhập
  if (isAuthRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Xử lý route admin - nếu người dùng không phải admin, chuyển hướng
  if (isAdminRoute && user) {
    // Lấy thông tin người dùng để kiểm tra vai trò
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      // Không phải admin, chuyển hướng về trang chủ
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
