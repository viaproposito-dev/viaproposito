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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        const [totalTests, tests] = await prisma.$transaction([
            prisma.test_results.count(),
            prisma.test_results.findMany({
                skip: offset,
                take: limit,
                orderBy: { test_date: 'desc' },
                select: {
                    id: true,
                    email: true,
                    birth_year: true,
                    gender: true,
                    occupation: true,
                    marital_status: true,
                    test_date: true,
                    final_result: true,
                }
            })
        ]);

        return NextResponse.json({
            tests,
            totalTests,
            totalPages: Math.ceil(totalTests / limit),
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
