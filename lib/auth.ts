// lib/auth.ts
import { NextRequest } from 'next/server';

// Middleware para proteger rutas administrativas
export function isAuthenticated(request: NextRequest) {
    // Verificar la autenticación (usando un API key simple para este ejemplo)
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = process.env.ADMIN_API_KEY;

    return apiKey === validApiKey;
}