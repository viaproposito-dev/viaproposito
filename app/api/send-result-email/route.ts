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

        // Verificar que el email y el ID del resultado coincidan
        const testResult = await query(
            `SELECT tr.id, tr.email, tr.final_result
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
        const { final_result } = testResult.rows[0];
        const winningCategory = {
            category: final_result,
            score: categoryScores.rows.find(row => row.category_name === final_result)?.score || 0,
            order: ['desenganchados', 'soñadores', 'aficionados', 'comprometidos'].indexOf(final_result) + 1
        };

        // Enviar el correo
        const emailResult = await sendResultEmail(email, winningCategory);

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