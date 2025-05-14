// scripts/test-connection.js
const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    // Crear un pool de conexiones
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
    });

    try {
        // Intentar conectar y ejecutar una consulta simple
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Conexión a la base de datos exitosa!');
        console.log('   Hora del servidor:', result.rows[0].now);

        // Verificar tablas existentes
        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        if (tables.rows.length > 0) {
            console.log('\n✅ Tablas existentes en la base de datos:');
            tables.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        } else {
            console.log('\n❌ No se encontraron tablas en la base de datos.');
            console.log('   Ejecuta el script init-db.js para crear las tablas necesarias.');
        }
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);

        if (error.message.includes('ssl')) {
            console.log('\n💡 Tip: Si estás usando Neon Postgres, asegúrate de que tu URL incluya ?sslmode=require');
        }

        if (error.message.includes('authentication')) {
            console.log('\n💡 Tip: Verifica que las credenciales en tu DATABASE_URL sean correctas');
        }
    } finally {
        // Cerrar el pool
        await pool.end();
    }
}

// Ejecutar la función
testConnection();