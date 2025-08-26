// app/api/test-results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, initializeDatabase } from '@/lib/db';

// Asegurarnos de que las tablas existan
let dbInitialized = false;

export async function POST(request: NextRequest) {
    try {
        // Inicializar la base de datos si aún no se ha hecho
        if (!dbInitialized) {
            await initializeDatabase();
            dbInitialized = true;
        }

        // Obtener los datos del request
        const data = await request.json();
        const { email, birthYear, gender, occupation, maritalStatus, answers, categoryScores, result } = data;

        // Validar datos obligatorios
        if (!email || !birthYear || !gender || !occupation || !maritalStatus || !answers || !categoryScores || !result) {
            return NextResponse.json(
                { error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        // Iniciar una transacción
        await query('BEGIN');

        try {
            // 1. Insertar el resultado principal con los nuevos campos demográficos
            const testResult = await query(
                'INSERT INTO test_results (email, birth_year, gender, occupation, marital_status, final_result) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [email, birthYear, gender, occupation, maritalStatus, result]
            );

            const testResultId = testResult.rows[0].id;

            // 2. Insertar las respuestas individuales
            for (const [questionId, value] of Object.entries(answers)) {
                await query(
                    'INSERT INTO answers (test_result_id, question_id, answer_value) VALUES ($1, $2, $3)',
                    [testResultId, parseInt(questionId), value]
                );
            }

            // 3. Insertar los puntajes por categoría
            for (const [category, score] of Object.entries(categoryScores)) {
                await query(
                    'INSERT INTO category_scores (test_result_id, category_name, score) VALUES ($1, $2, $3)',
                    [testResultId, category, score]
                );
            }

            // Confirmar la transacción
            await query('COMMIT');

            return NextResponse.json({
                success: true,
                id: testResultId
            });
        } catch (error) {
            // Revertir la transacción en caso de error
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error al guardar resultados:', error);

        return NextResponse.json(
            { error: 'Error interno al guardar los resultados' },
            { status: 500 }
        );
    }
}

// Obtener todos los resultados (para panel administrativo)
export async function GET() {
    try {
        const results = await query(`
            SELECT 
                tr.id, 
                tr.email, 
                tr.birth_year,
                tr.gender,
                tr.occupation,
                tr.marital_status,
                tr.test_date, 
                tr.final_result,
                (SELECT json_object_agg(cs.category_name, cs.score) 
                 FROM category_scores cs 
                 WHERE cs.test_result_id = tr.id) as category_scores
            FROM test_results tr
            ORDER BY tr.test_date DESC
        `);

        return NextResponse.json(results.rows);
    } catch (error) {
        console.error('Error al obtener resultados:', error);

        return NextResponse.json(
            { error: 'Error interno al obtener los resultados' },
            { status: 500 }
        );
    }
}