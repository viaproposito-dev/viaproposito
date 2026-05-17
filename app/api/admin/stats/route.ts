import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    const jwtSecret = process.env.JWT_SECRET || 'via-proposito-jwt-secret-key';

    try {
        jwt.verify(token, jwtSecret);
    } catch (error) {
        console.error('Error verificando el token:', error);
        return NextResponse.json(
            { error: 'Token inválido o expirado' },
            { status: 401 }
        );
    }

    try {
        const [totalTests, recentTests] = await prisma.$transaction([
            prisma.test_results.count(),
            prisma.test_results.findMany({
                take: 10,
                orderBy: { test_date: 'desc' },
                select: { id: true, email: true, test_date: true, final_result: true }
            })
        ]);

        const categoryDistribution = await prisma.$queryRaw<Array<{ category: string; count: number }>>`
            SELECT final_result AS category, COUNT(*)::int AS count
            FROM test_results
            GROUP BY final_result
            ORDER BY count DESC
        `;

        const testsByDay = await prisma.$queryRaw<Array<{ date: Date; count: number }>>`
            SELECT DATE(test_date) AS date, COUNT(*)::int AS count
            FROM test_results
            WHERE test_date > NOW() - INTERVAL '30 days'
            GROUP BY DATE(test_date)
            ORDER BY date
        `;

        return NextResponse.json({
            totalTests,
            categoryDistribution,
            testsByDay,
            recentTests
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        );
    }
}
