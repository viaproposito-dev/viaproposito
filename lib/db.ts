// lib/db.ts
import { Pool } from 'pg';

// Creamos un pool de conexiones para reutilizar y evitar abrir nuevas conexiones para cada consulta
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necesario para algunas conexiones con SSL
    },
});

// Función para ejecutar consultas SQL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query(text: string, params?: any[]) {
    // const start = Date.now();
    try {
        const res = await pool.query(text, params);
        // const duration = Date.now() - start;
        // console.log('Consulta ejecutada', { text, duration, rows: res.rowCount })
        return res;
    } catch (error) {
        console.error('Error en la consulta', { text, error });
        throw error;
    }
}

// Función para verificar la conexión a la base de datos
export async function testConnection() {
    try {
        const res = await query('SELECT NOW()');
        return { connected: true, timestamp: res.rows[0].now };
    } catch (error) {
        console.error('Error al conectar a la base de datos', error);
        return { connected: false, error };
    }
}

// Inicializar las tablas si no existen
export async function initializeDatabase() {
    try {
        // Crear tabla para resultados del test
        await query(`
      CREATE TABLE IF NOT EXISTS test_results (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        test_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        final_result VARCHAR(50) NOT NULL
      )
    `);

        // Crear tabla para respuestas individuales
        await query(`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        test_result_id INTEGER NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL,
        answer_value INTEGER NOT NULL,
        UNIQUE(test_result_id, question_id)
      )
    `);

        // Crear tabla para puntajes por categoría
        await query(`
      CREATE TABLE IF NOT EXISTS category_scores (
        id SERIAL PRIMARY KEY,
        test_result_id INTEGER NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
        category_name VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        UNIQUE(test_result_id, category_name)
      )
    `);

        console.log('Base de datos inicializada correctamente');
        return true;
    } catch (error) {
        console.error('Error al inicializar la base de datos', error);
        return false;
    }
}