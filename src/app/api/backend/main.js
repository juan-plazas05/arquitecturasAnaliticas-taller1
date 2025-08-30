import 'dotenv/config';
import { Client } from 'pg';
import {
  queriesTruncateTables,
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
} from './sql';

export const truncateTables = async (connectionDestino, hostDestino, portDestino, userDestino, passwordDestino, databaseDestino) => {
  let connectionDb = connectionDestino;
  try {
    if (!connectionDb) {
      connectionDb = new Client({
        host: hostDestino,
        port: portDestino,
        user: userDestino,
        password: passwordDestino,
        database: databaseDestino
      });
      await connectionDb.connect();
    }
    for (const query of queriesTruncateTables) {
      await connectionDb.query(query);
    }
  } catch (error) {
    console.error('❌ Error durante la creacion de tablas:', error);
  }
}

const createTables = async (connectionDestino) => {
  try {
    for (const query of queriesCreateTables) {
      await connectionDestino.query(query);
    }
  } catch (error) {
    console.error('❌ Error durante la creacion de tablas:', error);
  }
}

export const migrateData = async (hostDestino, portDestino, userDestino, passwordDestino, databaseDestino) => {
  let connectionOrigen;
  let connectionDestino;

  try {
    if (!hostDestino || !portDestino || !userDestino || !passwordDestino || !databaseDestino) {
      console.error(`❌ Configuración de conexión no completa para la tabla: ${nombreTabla}`);
      throw new Error('Configuración de conexión destino no completa');
    }

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

    // Conexión a la base de datos de destino (dbdestino)
    const configDestino = {
      host: hostDestino,
      port: portDestino,
      user: userDestino,
      password: passwordDestino,
      database: databaseDestino
    };
    connectionDestino = new Client(configDestino);
    await connectionDestino.connect();
    console.log('✅ Conectado a la base de datos de destino.');

    await truncateTables(connectionDestino);
    await createTables(connectionDestino);

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
    throw new Error('❌ Error durante la migración:', error);
  } finally {
    if (connectionOrigen) await connectionOrigen.end();
    if (connectionDestino) await connectionDestino.end();
    console.log('🔌 Conexiones a la base de datos cerradas.');
  }
}

export const getData = async (nombreTabla, conexion, hostDestino, portDestino, userDestino, passwordDestino, databaseDestino) => {
  let connectionDb;

  console.log(`🔍 Obteniendo datos de la tabla: ${nombreTabla} desde la conexión: ${conexion}`);

  try {
    if (!conexion || !nombreTabla) {
      console.error(`❌ Conexión no especificada para la tabla: ${nombreTabla}`);
      throw new Error('Conexión o nombre de tabla no especificados');
    }

    if (conexion != "origen" && (!hostDestino || !portDestino || !userDestino || !passwordDestino || !databaseDestino)) {
      console.error(`❌ Configuración de conexión no completa para la tabla: ${nombreTabla}`);
      throw new Error('Configuración de conexión destino no completa');
    }

    const configDb = {
      host: conexion === "origen" ? process.env.DB_ORIGEN_HOST : hostDestino,
      user: conexion === "origen" ? process.env.DB_ORIGEN_USER : userDestino,
      port: conexion === "origen" ? process.env.DB_ORIGEN_PORT : portDestino,
      password: conexion === "origen" ? process.env.DB_ORIGEN_PASSWORD : passwordDestino,
      database: conexion === "origen" ? process.env.DB_ORIGEN_DATABASE : databaseDestino
    };

    connectionDb = new Client(configDb);
    await connectionDb.connect();

    const { rows } = await connectionDb.query(`SELECT * FROM ${nombreTabla}`);
    return rows;
  } catch (error) {
    console.error(`❌ Error obteniendo data de la tabla: ${nombreTabla}`, error);
  } finally {
    // Cerrar las conexiones
    if (connectionDb) await connectionDb.end();
  }
};