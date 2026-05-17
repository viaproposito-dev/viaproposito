import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
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
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email requerido' },
                { status: 400 }
            );
        }

        const testCount = await prisma.test_results.count({ where: { email } });

        if (testCount === 0) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const [userStats] = await prisma.$queryRaw<Array<{ total_tests: number; first_test: Date; last_test: Date }>>`
            SELECT COUNT(*)::int AS total_tests, MIN(test_date) AS first_test, MAX(test_date) AS last_test
            FROM test_results
            WHERE email = ${email}
        `;

        const demographics = await prisma.test_results.findFirst({
            where: { email },
            orderBy: { test_date: 'desc' },
            select: { birth_year: true, gender: true, occupation: true, marital_status: true, test_date: true }
        });

        const rawTests = await prisma.test_results.findMany({
            where: { email },
            orderBy: { test_date: 'desc' },
            select: {
                id: true,
                birth_year: true,
                gender: true,
                occupation: true,
                marital_status: true,
                test_date: true,
                final_result: true,
                category_scores: { select: { category_name: true, score: true } }
            }
        });

        const tests = rawTests.map(t => ({
            id: t.id,
            birth_year: t.birth_year,
            gender: t.gender,
            occupation: t.occupation,
            marital_status: t.marital_status,
            test_date: t.test_date,
            final_result: t.final_result,
            categoryScores: {
                desorientado: 0,
                rebelde: 0,
                explorador: 0,
                constructor: 0,
                guia: 0,
                ...Object.fromEntries(t.category_scores.map(cs => [cs.category_name, cs.score]))
            }
        }));

        return NextResponse.json({
            email,
            totalTests: userStats.total_tests,
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
