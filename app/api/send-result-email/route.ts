import { NextRequest, NextResponse } from 'next/server';
import { sendResultEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { email, resultId } = await request.json();

        if (!email || !resultId) {
            return NextResponse.json(
                { error: 'Se requiere email y resultId' },
                { status: 400 }
            );
        }

        const testResult = await prisma.test_results.findFirst({
            where: { id: resultId, email },
            include: { category_scores: true }
        });

        if (!testResult) {
            return NextResponse.json(
                { error: 'No se encontró el resultado para este correo' },
                { status: 404 }
            );
        }

        const winningCategory = {
            category: testResult.final_result,
            score: testResult.category_scores.find(cs => cs.category_name === testResult.final_result)?.score || 0,
            order: ['desorientado', 'rebelde', 'explorador', 'constructor', 'guia'].indexOf(testResult.final_result) + 1
        };

        const userData = {
            birthYear: testResult.birth_year ?? 0,
            gender: testResult.gender ?? '',
            occupation: testResult.occupation ?? '',
            maritalStatus: testResult.marital_status ?? '',
            testDate: testResult.test_date.toISOString()
        };

        const emailResult = await sendResultEmail(email, winningCategory, userData);

        if (!emailResult.success) {
            throw new Error('Error al enviar el correo electrónico');
        }

        return NextResponse.json({ success: true, message: 'Correo electrónico enviado correctamente' });
    } catch (error) {
        console.error('Error en API send-result-email:', error);
        return NextResponse.json(
            { error: 'Error al enviar el correo electrónico' },
            { status: 500 }
        );
    }
}
