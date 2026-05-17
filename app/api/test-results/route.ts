import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { email, birthYear, gender, occupation, maritalStatus, answers, categoryScores, result } = data;

        if (!email || !birthYear || !gender || !occupation || !maritalStatus || !answers || !categoryScores || !result) {
            return NextResponse.json(
                { error: 'Datos incompletos' },
                { status: 400 }
            );
        }

        const created = await prisma.$transaction(async (tx) => {
            return tx.test_results.create({
                data: {
                    email,
                    birth_year: birthYear,
                    gender,
                    occupation,
                    marital_status: maritalStatus,
                    final_result: result,
                    answers: {
                        create: Object.entries(answers as Record<string, number>).map(([questionId, value]) => ({
                            question_id: parseInt(questionId),
                            answer_value: value,
                        }))
                    },
                    category_scores: {
                        create: Object.entries(categoryScores as Record<string, number>).map(([category_name, score]) => ({
                            category_name,
                            score,
                        }))
                    }
                }
            });
        });

        return NextResponse.json({ success: true, id: created.id });
    } catch (error) {
        console.error('Error al guardar resultados:', error);
        return NextResponse.json(
            { error: 'Error interno al guardar los resultados' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const results = await prisma.test_results.findMany({
            orderBy: { test_date: 'desc' },
            include: { category_scores: true }
        });

        return NextResponse.json(results.map(r => ({
            ...r,
            category_scores: Object.fromEntries(r.category_scores.map(cs => [cs.category_name, cs.score]))
        })));
    } catch (error) {
        console.error('Error al obtener resultados:', error);
        return NextResponse.json(
            { error: 'Error interno al obtener los resultados' },
            { status: 500 }
        );
    }
}
