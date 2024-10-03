export {default} from 'next-auth/middleware'
export const config = {
  matcher: ["/dashboard/:path*", "/configuracion/:path*", "/boletos/:path*"]
}
