// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Esta API requiere autenticación con token JWT
export async function GET(request: NextRequest) {
    // Verificar JWT token
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');

    // Secret para verificar token (debería estar en variables de entorno)
    const jwtSecret = process.env.JWT_SECRET || 'via-proposito-jwt-secret-key';

    try {
        // Verificar el token
        jwt.verify(token, jwtSecret);
    } catch (error) {
        console.error('Error verificando el token:', error);
        return NextResponse.json(
            { error: 'Token inválido o expirado' },
            { status: 401 }
        );
    }

    try {
        // Obtener estadísticas generales
        const totalTestsResult = await query(
            'SELECT COUNT(*) AS total FROM test_results'
        );

        const totalTests = totalTestsResult.rows[0].total;

        // Obtener distribución por categoría
        const categoryDistributionResult = await query(`
      SELECT final_result AS category, COUNT(*) AS count 
      FROM test_results 
      GROUP BY final_result 
      ORDER BY count DESC
    `);

        // Obtener tests por día (últimos 30 días)
        const testsByDayResult = await query(`
      SELECT 
        DATE(test_date) AS date, 
        COUNT(*) AS count 
      FROM test_results 
      WHERE test_date > NOW() - INTERVAL '30 days' 
      GROUP BY DATE(test_date) 
      ORDER BY date
    `);

        // Obtener últimos 10 tests realizados
        const recentTestsResult = await query(`
      SELECT id, email, test_date AT TIME ZONE 'UTC' as test_date, final_result
  FROM test_results 
  ORDER BY test_date DESC 
  LIMIT 10
    `);

        return NextResponse.json({
            totalTests,
            categoryDistribution: categoryDistributionResult.rows,
            testsByDay: testsByDayResult.rows,
            recentTests: recentTestsResult.rows
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        );
    }
}