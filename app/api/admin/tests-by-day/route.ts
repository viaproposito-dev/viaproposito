// app/api/admin/tests-by-day/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    // Verificar JWT token
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const jwtSecret = process.env.JWT_SECRET || 'via-proposito-jwt-secret-key';

    try {
        jwt.verify(token, jwtSecret);
    } catch (error) {
        return NextResponse.json(
            { error: 'Token inválido o expirado' },
            { status: 401 }
        );
    }

    try {
        // Obtener tests por día (últimos 30 días)
        const testsByDayResult = await query(`
            SELECT 
                DATE(test_date) AS date, 
                COUNT(*) AS count 
            FROM test_results 
            WHERE test_date > NOW() - INTERVAL '30 days' 
            GROUP BY DATE(test_date) 
            ORDER BY date DESC
        `);

        return NextResponse.json({
            testsByDay: testsByDayResult.rows
        });
    } catch (error) {
        console.error('Error obteniendo tests por día:', error);
        return NextResponse.json(
            { error: 'Error al obtener datos de actividad' },
            { status: 500 }
        );
    }
}