export {default} from 'next-auth/middleware'
export const config = {
  matcher: ["/dashboard/:path*", "/configuracion/:path*", "/boletos/:path*", "/clientes/:path*", "/configuracion/:path*", "/estadisticas/:path*", "/proveedores/:path*", "/rutas/:path*","/reportes/:path*"]
}
