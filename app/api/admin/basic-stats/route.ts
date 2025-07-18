// app/api/admin/basic-stats/route.ts
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json(
            { error: 'Token inválido o expirado' },
            { status: 401 }
        );
    }

    try {
        // Obtener estadísticas básicas
        const totalTestsResult = await query(
            'SELECT COUNT(*) AS total FROM test_results'
        );

        const totalUsersResult = await query(
            'SELECT COUNT(DISTINCT email) AS total FROM test_results'
        );

        // Obtener distribución por categoría
        const categoryDistributionResult = await query(`
            SELECT final_result AS category, COUNT(*) AS count 
            FROM test_results 
            GROUP BY final_result 
            ORDER BY count DESC
        `);

        return NextResponse.json({
            totalTests: parseInt(totalTestsResult.rows[0].total),
            totalUsers: parseInt(totalUsersResult.rows[0].total),
            categoryDistribution: categoryDistributionResult.rows
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas básicas:', error);
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        );
    }
}