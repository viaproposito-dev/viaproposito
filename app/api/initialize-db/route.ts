import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ success: true, message: 'Base de datos conectada correctamente' });
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        return NextResponse.json(
            { error: 'No se pudo conectar a la base de datos' },
            { status: 500 }
        );
    }
}
