export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/revenues/:path*',
    '/expenses/:path*',
    '/cash-flow/:path*',
    '/accounts/:path*',
    '/reports/:path*',
    '/categories/:path*',
    '/settings/:path*',
  ],
}
