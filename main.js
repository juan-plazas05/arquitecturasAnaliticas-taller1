require('dotenv').config();
const mysql = require('mysql2/promise');
const { 
  queriesCreateTables,
  queryAviones,
  queryAerolineas,
  queryUsuarios,
  queryAeropuertos,
  queryTiempo,
  queryVuelos,
  insertQueryAviones,
  insertQueryAerolineas,
  insertQueryUsuarios,
  insertQueryAeropuertos,
  insertQueryTiempo,
  insertQueryVuelos
} = require('./sql');

const createTables = async () => {
  connectionDestino = await mysql.createConnection({
    host: process.env.DB_DESTINO_HOST,
    user: process.env.DB_DESTINO_USER,
    password: process.env.DB_DESTINO_PASSWORD,
    database: process.env.DB_DESTINO_DATABASE
  });
  try {
    for (const query of queriesCreateTables) {
      await connectionDestino.execute(query);
    }
  } catch (error) {
    console.error('❌ Error durante la creacion de tablas:', error);
  } finally {
    // Cerrar las conexiones
    if (connectionDestino) await connectionDestino.end();
  }
}

async function migrateData() {
  await createTables();

  let connectionOrigen;
  let connectionDestino;

  try {
    // Conexión a la base de datos de origen (dborigen)
    connectionOrigen = await mysql.createConnection({
      host: process.env.DB_ORIGEN_HOST,
      user: process.env.DB_ORIGEN_USER,
      password: process.env.DB_ORIGEN_PASSWORD,
      database: process.env.DB_ORIGEN_DATABASE
    });
    console.log('✅ Conectado a la base de datos de origen.');

    // Obtenemos los datos de AVIONES
    const [rowsAviones] = await connectionOrigen.execute(queryAviones);
    console.log(`🔎 Encontrados ${rowsAviones.length} registros en AVIONES.`);

    // Obtenemos los datos de AEROLINEAS
    const [rowsAerolineas] = await connectionOrigen.execute(queryAerolineas);
    console.log(`🔎 Encontrados ${rowsAerolineas.length} registros en AEROLINEAS.`);

    // Obtenemos los datos de USUARIOS
    const [rowsUsuarios] = await connectionOrigen.execute(queryUsuarios);
    console.log(`🔎 Encontrados ${rowsUsuarios.length} registros en USUARIOS.`);

    // Obtenemos los datos de AEROPUERTOS

    const [rowsAeropuertos] = await connectionOrigen.execute(queryAeropuertos);
    console.log(`🔎 Encontrados ${rowsAeropuertos.length} registros en AEROPUERTOS.`);

    // Obtenemos los datos de FECHA
    const [rowsTiempo] = await connectionOrigen.execute(queryTiempo);
    console.log(`🔎 Encontrados ${rowsTiempo.length} registros en Tiempo.`);

    // Obtenemos los datos de FECHA
    const [rowsVuelos] = await connectionOrigen.execute(queryVuelos);
    console.log(`🔎 Encontrados ${rowsVuelos.length} registros en Vuelos.`);

    // Conexión a la base de datos de destino (dbdestino)
    connectionDestino = await mysql.createConnection({
      host: process.env.DB_DESTINO_HOST,
      user: process.env.DB_DESTINO_USER,
      password: process.env.DB_DESTINO_PASSWORD,
      database: process.env.DB_DESTINO_DATABASE
    });
    console.log('✅ Conectado a la base de datos de destino.');

    // Limpiar las tablas de destino
    await connectionDestino.execute(`DELETE FROM Fact_vuelos`);
    await connectionDestino.execute(`DELETE FROM Dim_aviones`);
    await connectionDestino.execute(`DELETE FROM Dim_aerolineas`);
    await connectionDestino.execute(`DELETE FROM Dim_usuarios`);
    await connectionDestino.execute(`DELETE FROM Dim_aeropuertos`);
    await connectionDestino.execute(`DELETE FROM Dim_tiempo`);

    for (const row of rowsAviones) {
      console.log(`🔄 Insertando AVIÓN: ${JSON.stringify(row)}`);
      const values = [row.id_avion, row.nombre_avion, row.modelo];
      await connectionDestino.execute(insertQueryAviones, values);
    }

    for (const row of rowsAerolineas) {
      console.log(`🔄 Insertando AEROLINEA: ${JSON.stringify(row)}`);
      const values = [row.id_aerolinea, row.nombre_aerolinea];
      await connectionDestino.execute(insertQueryAerolineas, values);
    }

    for (const row of rowsUsuarios) {
      console.log(`🔄 Insertando USUARIO: ${JSON.stringify(row)}`);
      const values = [row.id_usuario, row.nombre_completo];
      await connectionDestino.execute(insertQueryUsuarios, values);
    }

    for (const row of rowsAeropuertos) {
      console.log(`🔄 Insertando AEROPUERTO: ${JSON.stringify(row)}`);
      const values = [row.id_aeropuerto, row.nombre_aeropuerto, row.ciudad];
      await connectionDestino.execute(insertQueryAeropuertos, values);
    }

    for (const row of rowsTiempo) {
      console.log(`🔄 Insertando FECHA: ${JSON.stringify(row)}`);
      const date = new Date(row.fecha);
      const anio = date.getFullYear();
      const mes = date.getMonth() + 1;
      const dia = date.getDate();
      const hora = date.getHours();
      const semestre = mes <= 6 ? 1 : 2;
      const trimestre = Math.ceil(mes / 3);
      const bimestre = Math.ceil(mes / 2);
      const values = [row.id_itinerario, row.fecha, anio, mes, dia, hora, semestre, trimestre, bimestre];
      await connectionDestino.execute(insertQueryTiempo, values);
    }

    for (const row of rowsVuelos) {
      console.log(`🔄 Insertando VUELO: ${JSON.stringify(row)}`);
      const values = [row.id_aerolinea, row.id_fecha, row.id_aeropuerto_origen, row.id_aeropuerto_destino, row.id_usuario, row.costo];
      await connectionDestino.execute(insertQueryVuelos, values);
    }

    console.log('✅ Migración de datos completada exitosamente.');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    // Cerrar las conexiones
    if (connectionOrigen) await connectionOrigen.end();
    if (connectionDestino) await connectionDestino.end();
    console.log('🔌 Conexiones a la base de datos cerradas.');
  }
}

// Ejecutar la función principal
migrateData();