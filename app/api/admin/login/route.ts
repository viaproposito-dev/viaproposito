// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        // Verificar la contraseña
        const validPassword = process.env.ADMIN_PASSWORD || '';

        if (password !== validPassword) {
            return NextResponse.json(
                { error: 'Contraseña incorrecta' },
                { status: 401 }
            );
        }

        // Crear JWT token
        const jwtSecret = process.env.JWT_SECRET || 'via-proposito-jwt-secret-key';
        const token = jwt.sign(
            {
                role: 'admin',
                // Añadir cualquier información adicional necesaria
            },
            jwtSecret,
            {
                expiresIn: '8h' // El token expira en 8 horas
            }
        );

        return NextResponse.json({
            success: true,
            token
        });
    } catch (error) {
        console.error('Error en inicio de sesión:', error);
        return NextResponse.json(
            { error: 'Error al procesar el inicio de sesión' },
            { status: 500 }
        );
    }
}