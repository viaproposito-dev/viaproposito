// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Redirigir solicitudes a la raíz antigua a la nueva ruta /test
    if (request.nextUrl.pathname === '/') {
        // Si el usuario está accediendo a la landing page directamente,
        // no hacemos nada y dejamos que la navegación siga su curso normal
        return NextResponse.next();
    }

    // Si es una ruta API o una ruta de test, permitir el acceso normal
    if (request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname.startsWith('/test')) {
        return NextResponse.next();
    }

    // Proteger la ruta de inicialización de la base de datos
    if (request.nextUrl.pathname === '/api/initialize-db' ||
        request.nextUrl.pathname === '/api/admin/stats') {
        const apiKey = request.headers.get('x-api-key');

        // En producción, establecerías una API key segura en tus variables de entorno
        const validApiKey = process.env.ADMIN_API_KEY;

        // Verifica la API key
        if (apiKey !== validApiKey) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }
    }

    // Para la ruta administrativa, asegurarse de que el usuario está autenticado
    if (request.nextUrl.pathname.startsWith('/admin') &&
        !request.nextUrl.pathname.includes('/admin/login')) {
        // La autenticación en el lado del cliente se maneja con session storage
        // Este middleware solo se asegura de que las rutas API estén protegidas
    }

    return NextResponse.next();
}

// Configurar en qué rutas se aplica el middleware
export const config = {
    matcher: [
        '/api/initialize-db',
        '/api/admin/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};