// app/api/initialize-db/route.ts
import { NextResponse } from 'next/server';
import { initializeDatabase, testConnection } from '@/lib/db';

// Esta ruta es solo para uso administrativo o durante el despliegue inicial
export async function GET() {
    try {
        // Primero verifica la conexión
        const connectionTest = await testConnection();

        if (!connectionTest.connected) {
            return NextResponse.json(
                { error: 'No se pudo conectar a la base de datos', details: connectionTest.error },
                { status: 500 }
            );
        }

        // Inicializa la base de datos
        const initialized = await initializeDatabase();

        if (!initialized) {
            return NextResponse.json(
                { error: 'Error al inicializar la base de datos' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Base de datos inicializada correctamente',
            connection: connectionTest
        });
    } catch (error) {
        console.error('Error en la inicialización de la base de datos:', error);

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}