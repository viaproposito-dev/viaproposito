// scripts/init-db.js
const { Pool } = require('pg');
require('dotenv').config();

// Crear un pool de conexiones
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necesario para algunas conexiones con SSL
    },
});

async function initializeDatabase() {
    const client = await pool.connect();

    try {
        console.log('Iniciando la creación de tablas...');

        // Iniciar una transacción
        await client.query('BEGIN');

        // Crear tabla para resultados del test
        await client.query(`
      CREATE TABLE IF NOT EXISTS test_results (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        test_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        final_result VARCHAR(50) NOT NULL
      )
    `);
        console.log('✅ Tabla test_results creada');

        // Crear tabla para respuestas individuales
        await client.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        test_result_id INTEGER NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL,
        answer_value INTEGER NOT NULL,
        UNIQUE(test_result_id, question_id)
      )
    `);
        console.log('✅ Tabla answers creada');

        // Crear tabla para puntajes por categoría
        await client.query(`
      CREATE TABLE IF NOT EXISTS category_scores (
        id SERIAL PRIMARY KEY,
        test_result_id INTEGER NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
        category_name VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        UNIQUE(test_result_id, category_name)
      )
    `);
        console.log('✅ Tabla category_scores creada');

        // Confirmar la transacción
        await client.query('COMMIT');

        console.log('✅ Base de datos inicializada correctamente');

        // Probar una consulta simple
        const result = await client.query('SELECT NOW()');
        console.log('✅ Conexión a la base de datos verificada:', result.rows[0].now);

    } catch (error) {
        // Revertir la transacción en caso de error
        await client.query('ROLLBACK');
        console.error('❌ Error al inicializar la base de datos:', error);
    } finally {
        // Liberar el cliente
        client.release();
        // Cerrar el pool
        await pool.end();
    }
}

// Ejecutar la función
initializeDatabase();