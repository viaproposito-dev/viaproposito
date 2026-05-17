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
        const [totalTests, uniqueEmails] = await prisma.$transaction([
            prisma.test_results.count(),
            prisma.test_results.findMany({ distinct: ['email'], select: { email: true } })
        ]);
        const totalUsers = uniqueEmails.length;

        const categoryDistribution = await prisma.$queryRaw<Array<{ category: string; count: number }>>`
            SELECT final_result AS category, COUNT(*)::int AS count
            FROM test_results
            GROUP BY final_result
            ORDER BY count DESC
        `;

        const genderDistribution = await prisma.$queryRaw<Array<{ gender: string; count: number }>>`
            SELECT
                CASE
                    WHEN gender = 'masculino' THEN 'Masculino'
                    WHEN gender = 'femenino' THEN 'Femenino'
                    WHEN gender = 'otro' THEN 'Otro'
                    ELSE 'No especificado'
                END as gender,
                COUNT(*)::int as count
            FROM test_results
            WHERE gender IS NOT NULL
            GROUP BY gender
            ORDER BY count DESC
        `;

        const ageDistribution = await prisma.$queryRaw<Array<{ age_group: string; count: number }>>`
            SELECT age_group, COUNT(*)::int as count
            FROM (
                SELECT
                    CASE
                        WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year < 13 THEN 'Menor de 13 años'
                        WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year BETWEEN 13 AND 17 THEN '13-17 años'
                        WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year BETWEEN 18 AND 25 THEN '18-25 años'
                        WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year BETWEEN 26 AND 35 THEN '26-35 años'
                        WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year BETWEEN 36 AND 45 THEN '36-45 años'
                        WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year BETWEEN 46 AND 55 THEN '46-55 años'
                        WHEN EXTRACT(YEAR FROM CURRENT_DATE) - birth_year > 55 THEN '56+ años'
                        ELSE 'No especificado'
                    END as age_group
                FROM test_results
                WHERE birth_year IS NOT NULL
            ) as age_data
            GROUP BY age_group
            ORDER BY
                CASE age_group
                    WHEN 'Menor de 13 años' THEN 1
                    WHEN '13-17 años' THEN 2
                    WHEN '18-25 años' THEN 3
                    WHEN '26-35 años' THEN 4
                    WHEN '36-45 años' THEN 5
                    WHEN '46-55 años' THEN 6
                    WHEN '56+ años' THEN 7
                    ELSE 8
                END
        `;

        const occupationDistribution = await prisma.$queryRaw<Array<{ occupation: string; count: number }>>`
            SELECT
                CASE
                    WHEN occupation = 'estudiante' THEN 'Estudiante'
                    WHEN occupation = 'medico' THEN 'Médico'
                    WHEN occupation = 'ingeniero' THEN 'Ingeniero'
                    WHEN occupation = 'abogado' THEN 'Abogado'
                    WHEN occupation = 'maestro' THEN 'Maestro/Profesor'
                    WHEN occupation = 'enfermero' THEN 'Enfermero'
                    WHEN occupation = 'contador' THEN 'Contador'
                    WHEN occupation = 'arquitecto' THEN 'Arquitecto'
                    WHEN occupation = 'psicologo' THEN 'Psicólogo'
                    WHEN occupation = 'vendedor' THEN 'Vendedor'
                    WHEN occupation = 'empresario' THEN 'Empresario'
                    WHEN occupation = 'empleado_publico' THEN 'Empleado Público'
                    WHEN occupation = 'trabajador_social' THEN 'Trabajador Social'
                    WHEN occupation = 'artista' THEN 'Artista'
                    WHEN occupation = 'chef' THEN 'Chef/Cocinero'
                    WHEN occupation = 'policia' THEN 'Policía'
                    WHEN occupation = 'bombero' THEN 'Bombero'
                    WHEN occupation = 'tecnico' THEN 'Técnico'
                    WHEN occupation = 'comerciante' THEN 'Comerciante'
                    WHEN occupation = 'empleado_domestico' THEN 'Empleado Doméstico'
                    WHEN occupation = 'jubilado' THEN 'Jubilado'
                    WHEN occupation = 'desempleado' THEN 'Desempleado'
                    WHEN occupation = 'otro' THEN 'Otro'
                    ELSE 'No especificado'
                END as occupation,
                COUNT(*)::int as count
            FROM test_results
            WHERE occupation IS NOT NULL
            GROUP BY occupation
            ORDER BY count DESC
            LIMIT 10
        `;

        const maritalStatusDistribution = await prisma.$queryRaw<Array<{ marital_status: string; count: number }>>`
            SELECT
                CASE
                    WHEN marital_status = 'soltero' THEN 'Soltero/a'
                    WHEN marital_status = 'casado' THEN 'Casado/a'
                    WHEN marital_status = 'union_libre' THEN 'Unión Libre'
                    WHEN marital_status = 'divorciado' THEN 'Divorciado/a'
                    WHEN marital_status = 'viudo' THEN 'Viudo/a'
                    WHEN marital_status = 'separado' THEN 'Separado/a'
                    ELSE 'No especificado'
                END as marital_status,
                COUNT(*)::int as count
            FROM test_results
            WHERE marital_status IS NOT NULL
            GROUP BY marital_status
            ORDER BY count DESC
        `;

        return NextResponse.json({
            totalTests,
            totalUsers,
            categoryDistribution,
            demographics: {
                gender: genderDistribution,
                ageGroups: ageDistribution,
                occupations: occupationDistribution,
                maritalStatus: maritalStatusDistribution
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas básicas:', error);
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        );
    }
}
