// app/api/test-results/check-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Obtener el email de los parámetros de la URL
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Correo electrónico requerido' }, { status: 400 });
        }

        // Verificar si el email ya existe en la base de datos
        const result = await query(
            'SELECT id FROM test_results WHERE email = $1',
            [email]
        );

        return NextResponse.json({
            exists: result.rowCount !== null && result.rowCount > 0
        });
    } catch (error) {
        console.error('Error al verificar email:', error);
        return NextResponse.json(
            { error: 'Error interno al verificar el correo electrónico' },
            { status: 500 }
        );
    }
}