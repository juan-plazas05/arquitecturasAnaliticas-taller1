require('dotenv').config();
const { Client } = require('pg');
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
  const configDestino = {
    host: process.env.DB_DESTINO_HOST,
    port: process.env.DB_DESTINO_PORT,
    user: process.env.DB_DESTINO_USER,
    password: process.env.DB_DESTINO_PASSWORD,
    database: process.env.DB_DESTINO_DATABASE
  };
  const connectionDestino = new Client(configDestino);
  await connectionDestino.connect();
  try {
    for (const query of queriesCreateTables) {
      await connectionDestino.query(query);
    }
  } catch (error) {
    console.error('❌ Error durante la creacion de tablas:', error);
  } finally {
    if (connectionDestino) await connectionDestino.end();
  }
}

async function migrateData() {
  await createTables();

  let connectionOrigen;
  let connectionDestino;

  try {
    // Conexión a la base de datos de origen (dborigen)
    const configOrigen = {
      host: process.env.DB_ORIGEN_HOST,
      port: process.env.DB_ORIGEN_PORT,
      user: process.env.DB_ORIGEN_USER,
      password: process.env.DB_ORIGEN_PASSWORD,
      database: process.env.DB_ORIGEN_DATABASE
    };
    connectionOrigen = new Client(configOrigen);
    await connectionOrigen.connect();
    console.log('✅ Conectado a la base de datos de origen.');

    // Obtenemos los datos de AVIONES
    const { rows: rowsAviones } = await connectionOrigen.query(queryAviones);
    console.log(`🔎 Encontrados ${rowsAviones.length} registros en AVIONES.`);

    // Obtenemos los datos de AEROLINEAS
    const { rows: rowsAerolineas } = await connectionOrigen.query(queryAerolineas);
    console.log(`🔎 Encontrados ${rowsAerolineas.length} registros en AEROLINEAS.`);

    // Obtenemos los datos de USUARIOS
    const { rows: rowsUsuarios } = await connectionOrigen.query(queryUsuarios);
    console.log(`🔎 Encontrados ${rowsUsuarios.length} registros en USUARIOS.`);

    // Obtenemos los datos de AEROPUERTOS
    const { rows: rowsAeropuertos } = await connectionOrigen.query(queryAeropuertos);
    console.log(`🔎 Encontrados ${rowsAeropuertos.length} registros en AEROPUERTOS.`);

    // Obtenemos los datos de FECHA
    const { rows: rowsTiempo } = await connectionOrigen.query(queryTiempo);
    console.log(`🔎 Encontrados ${rowsTiempo.length} registros en Tiempo.`);

    // Obtenemos los datos de VUELOS
    const { rows: rowsVuelos } = await connectionOrigen.query(queryVuelos);
    console.log(`🔎 Encontrados ${rowsVuelos.length} registros en Vuelos.`);

    // Conexión a la base de datos de destino (dbdestino)
  const configDestino = {
    host: process.env.DB_DESTINO_HOST,
    port: process.env.DB_DESTINO_PORT,
    user: process.env.DB_DESTINO_USER,
    password: process.env.DB_DESTINO_PASSWORD,
    database: process.env.DB_DESTINO_DATABASE
  };
  const connectionDestino = new Client(configDestino);
  await connectionDestino.connect();
    console.log('✅ Conectado a la base de datos de destino.');

    for (const row of rowsAviones) {
      console.log(`🔄 Insertando AVIÓN: ${JSON.stringify(row)}`);
      const values = [row.id_avion, row.nombre_avion, row.modelo];
      await connectionDestino.query(insertQueryAviones, values);
    }

    for (const row of rowsAerolineas) {
      console.log(`🔄 Insertando AEROLINEA: ${JSON.stringify(row)}`);
      const values = [row.id_aerolinea, row.nombre_aerolinea];
      await connectionDestino.query(insertQueryAerolineas, values);
    }

    for (const row of rowsUsuarios) {
      console.log(`🔄 Insertando USUARIO: ${JSON.stringify(row)}`);
      const values = [row.id_usuario, row.nombre_completo];
      await connectionDestino.query(insertQueryUsuarios, values);
    }

    for (const row of rowsAeropuertos) {
      console.log(`🔄 Insertando AEROPUERTO: ${JSON.stringify(row)}`);
      const values = [row.id_aeropuerto, row.nombre_aeropuerto, row.ciudad];
      await connectionDestino.query(insertQueryAeropuertos, values);
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
      await connectionDestino.query(insertQueryTiempo, values);
    }

    for (const row of rowsVuelos) {
      console.log(`🔄 Insertando VUELO: ${JSON.stringify(row)}`);
      const values = [row.id_aerolinea, row.id_fecha, row.id_aeropuerto_origen, row.id_aeropuerto_destino, row.id_usuario, row.costo];
      await connectionDestino.query(insertQueryVuelos, values);
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

const getData = async (nombreTabla, conexion) => {

  if(!conexion || !nombreTabla) {
    console.error(`❌ Conexión no especificada para la tabla: ${nombreTabla}`);
    return;
  }

  connectionDb = await mysql.createConnection({
    host: conexion === "origen" ? process.env.DB_ORIGEN_HOST : process.env.DB_DESTINO_HOST,
    user: conexion === "origen" ? process.env.DB_ORIGEN_USER : process.env.DB_DESTINO_USER,
    password: conexion === "origen" ? process.env.DB_ORIGEN_PASSWORD : process.env.DB_DESTINO_PASSWORD,
    database: conexion === "origen" ? process.env.DB_ORIGEN_DATABASE : process.env.DB_DESTINO_DATABASE
  });

  try {
    const [rows] = await connectionDb.execute(`SELECT * FROM ${nombreTabla}`);
    console.log(`🔍 Datos en la tabla ${nombreTabla} de la base de datos: ${JSON.stringify(rows)}`);
    return rows;
  } catch (error) {
    console.error(`❌ Error obteniendo data de la tabla: ${nombreTabla}`, error);
  } finally {
    // Cerrar las conexiones
    if (connectionDb) await connectionDb.end();
  }
};

// Ejecutar la función principal
migrateData();

//getData("aviones", "origen");