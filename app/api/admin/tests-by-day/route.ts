import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const jwtSecret = process.env.JWT_SECRET || 'via-proposito-jwt-secret-key';

    try {
        jwt.verify(token, jwtSecret);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json(
            { error: 'Token inválido o expirado' },
            { status: 401 }
        );
    }

    try {
        const testsByDay = await prisma.$queryRaw<Array<{ date: Date; count: number }>>`
            SELECT DATE(test_date) AS date, COUNT(*)::int AS count
            FROM test_results
            WHERE test_date > NOW() - INTERVAL '30 days'
            GROUP BY DATE(test_date)
            ORDER BY date DESC
        `;

        return NextResponse.json({ testsByDay });
    } catch (error) {
        console.error('Error obteniendo tests por día:', error);
        return NextResponse.json(
            { error: 'Error al obtener datos de actividad' },
            { status: 500 }
        );
    }
}
