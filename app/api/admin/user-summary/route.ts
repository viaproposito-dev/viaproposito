// app/api/admin/user-summary/route.ts
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
        // Obtener email de los parámetros
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email requerido' },
                { status: 400 }
            );
        }

        // Verificar si el usuario existe
        const userExistsResult = await query(
            'SELECT COUNT(*) AS count FROM test_results WHERE email = $1',
            [email]
        );

        if (parseInt(userExistsResult.rows[0].count) === 0) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Obtener resumen del usuario con información demográfica del test más reciente
        const userStatsResult = await query(`
            SELECT 
                COUNT(*) AS total_tests,
                MIN(test_date) AS first_test,
                MAX(test_date) AS last_test
            FROM test_results 
            WHERE email = $1
        `, [email]);

        // Obtener información demográfica más reciente
        const userDemographicsResult = await query(`
            SELECT 
                birth_year,
                gender,
                occupation,
                marital_status,
                test_date
            FROM test_results 
            WHERE email = $1 
            ORDER BY test_date DESC 
            LIMIT 1
        `, [email]);

        // Obtener todos los tests del usuario con sus puntajes
        const userTestsResult = await query(`
            SELECT 
                tr.id,
                tr.birth_year,
                tr.gender,
                tr.occupation,
                tr.marital_status,
                tr.test_date AT TIME ZONE 'UTC' as test_date,
                tr.final_result,
                cs.category_name,
                cs.score
            FROM test_results tr
            LEFT JOIN category_scores cs ON tr.id = cs.test_result_id
            WHERE tr.email = $1
            ORDER BY tr.test_date DESC
        `, [email]);

        // Estructurar los datos por test
        const testsMap = new Map();

        userTestsResult.rows.forEach(row => {
            if (!testsMap.has(row.id)) {
                testsMap.set(row.id, {
                    id: row.id,
                    birth_year: row.birth_year,
                    gender: row.gender,
                    occupation: row.occupation,
                    marital_status: row.marital_status,
                    test_date: row.test_date,
                    final_result: row.final_result,
                    categoryScores: {
                        desenganchados: 0,
                        soñadores: 0,
                        aficionados: 0,
                        comprometidos: 0
                    }
                });
            }

            if (row.category_name && row.score !== null) {
                testsMap.get(row.id).categoryScores[row.category_name] = row.score;
            }
        });

        const tests = Array.from(testsMap.values());
        const userStats = userStatsResult.rows[0];
        const demographics = userDemographicsResult.rows[0];

        return NextResponse.json({
            email,
            totalTests: parseInt(userStats.total_tests),
            firstTest: userStats.first_test,
            lastTest: userStats.last_test,
            demographics: demographics ? {
                birth_year: demographics.birth_year,
                gender: demographics.gender,
                occupation: demographics.occupation,
                marital_status: demographics.marital_status,
                last_updated: demographics.test_date
            } : null,
            tests
        });
    } catch (error) {
        console.error('Error obteniendo resumen del usuario:', error);
        return NextResponse.json(
            { error: 'Error al obtener el resumen del usuario' },
            { status: 500 }
        );
    }
}