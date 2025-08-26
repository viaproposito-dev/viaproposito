// app/api/send-result-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendResultEmail } from '@/lib/email';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Obtener datos del cuerpo de la solicitud
        const { email, resultId } = await request.json();

        if (!email || !resultId) {
            return NextResponse.json(
                { error: 'Se requiere email y resultId' },
                { status: 400 }
            );
        }

        // Obtener todos los datos del test incluyendo información demográfica
        const testResult = await query(
            `SELECT tr.id, tr.email, tr.final_result, tr.birth_year, tr.gender, 
                    tr.occupation, tr.marital_status, tr.test_date
             FROM test_results tr
             WHERE tr.id = $1 AND tr.email = $2`,
            [resultId, email]
        );

        if (testResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'No se encontró el resultado para este correo' },
                { status: 404 }
            );
        }

        // Obtener los puntajes por categoría
        const categoryScores = await query(
            `SELECT category_name, score
             FROM category_scores
             WHERE test_result_id = $1`,
            [resultId]
        );

        // Obtener la categoría ganadora y su puntaje
        const testData = testResult.rows[0];
        const winningCategory = {
            category: testData.final_result,
            score: categoryScores.rows.find(row => row.category_name === testData.final_result)?.score || 0,
            order: ['desenganchados', 'soñadores', 'aficionados', 'comprometidos'].indexOf(testData.final_result) + 1
        };

        // Preparar los datos del usuario para el email
        const userData = {
            birthYear: testData.birth_year,
            gender: testData.gender,
            occupation: testData.occupation,
            maritalStatus: testData.marital_status,
            testDate: testData.test_date
        };

        // Enviar el correo con los datos del usuario
        const emailResult = await sendResultEmail(email, winningCategory, userData);

        if (!emailResult.success) {
            throw new Error('Error al enviar el correo electrónico');
        }

        // Si todo salió bien, devolvemos éxito
        return NextResponse.json({
            success: true,
            message: 'Correo electrónico enviado correctamente'
        });

    } catch (error) {
        console.error('Error en API send-result-email:', error);

        return NextResponse.json(
            { error: 'Error al enviar el correo electrónico' },
            { status: 500 }
        );
    }
}