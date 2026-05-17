import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const latest = await prisma.test_results.findFirst({
        where: { email },
        orderBy: { test_date: 'desc' },
        select: {
            birth_year: true,
            gender: true,
            occupation: true,
            marital_status: true,
        }
    });

    if (!latest) {
        return NextResponse.json({ found: false });
    }

    return NextResponse.json({
        found: true,
        demographics: {
            birthYear: latest.birth_year,
            gender: latest.gender,
            occupation: latest.occupation,
            maritalStatus: latest.marital_status,
        }
    });
}
