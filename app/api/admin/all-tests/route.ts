// app/api/admin/all-tests/route.ts
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
        // Obtener parámetros de consulta
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        // Obtener total de tests para paginación
        const totalTestsResult = await query(
            'SELECT COUNT(*) AS total FROM test_results'
        );
        const totalTests = parseInt(totalTestsResult.rows[0].total);
        const totalPages = Math.ceil(totalTests / limit);

        // Obtener tests paginados
        const testsResult = await query(`
            SELECT id, email, test_date AT TIME ZONE 'UTC' as test_date, final_result
            FROM test_results 
            ORDER BY test_date DESC 
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        return NextResponse.json({
            tests: testsResult.rows,
            totalTests,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Error obteniendo todos los tests:', error);
        return NextResponse.json(
            { error: 'Error al obtener los tests' },
            { status: 500 }
        );
    }
}