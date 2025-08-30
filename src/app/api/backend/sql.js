export const queriesCreateTables = [
  `CREATE TABLE IF NOT EXISTS Dim_Aerolineas (
      id_aerolinea     INT,
      nombre_aerolinea VARCHAR(50),
      PRIMARY KEY (id_aerolinea)
  )`,
  `CREATE TABLE IF NOT EXISTS Dim_aviones  (
        id_avion     INT NOT NULL,
        nombre_avion VARCHAR(50) NOT NULL,
        modelo       VARCHAR(50) NOT NULL,
        PRIMARY KEY (id_avion)
  )`,
  `CREATE TABLE IF NOT EXISTS Dim_usuarios (
        id_usuario      INT NOT NULL,
        nombre_completo VARCHAR(120) NOT NULL,
        PRIMARY KEY (id_usuario)
  )`,
  `CREATE TABLE IF NOT EXISTS Dim_aeropuertos (
        id_aeropuerto     INT NOT NULL, 
        nombre_aeropuerto VARCHAR(50) NOT NULL,
        ciudad            VARCHAR(50) NOT NULL,
        pais              VARCHAR(80) NULL,
        PRIMARY KEY (id_aeropuerto)
  )`,
  `CREATE TABLE IF NOT EXISTS Dim_tiempo (
          id_fecha    INT NOT NULL,
          fecha       DATE,
          anio        INT,
          mes         INT,
          dia         INT,
          hora        INT,
          semestre    INT,
          trimestre   INT,
          bimestre    INT,
          PRIMARY KEY (id_fecha)
  );`,
  `CREATE TABLE  IF NOT EXISTS Fact_Vuelos (
        id_vuelo              SERIAL ,
        id_aerolinea          INT,
        id_fecha              INT,
        id_avion              INT ,
        id_usuario            INT ,
        id_aeropuerto_origen  INT,
        id_aeropuerto_destino INT,
        costo                 INT,
        duracion              INT,
        PRIMARY KEY (id_vuelo),
        CONSTRAINT fk_fv_aerolineas   FOREIGN KEY (id_aerolinea)          REFERENCES Dim_Aerolineas (id_aerolinea),
        CONSTRAINT fk_fv_tiempo       FOREIGN KEY (id_fecha)              REFERENCES Dim_tiempo     (id_fecha),
        CONSTRAINT fk_fv_aviones      FOREIGN KEY (id_avion)              REFERENCES Dim_aviones    (id_avion),
        CONSTRAINT fk_fv_usuarios     FOREIGN KEY (id_usuario)            REFERENCES Dim_usuarios   (id_usuario),
        CONSTRAINT fk_fv_aero_origen  FOREIGN KEY (id_aeropuerto_origen)  REFERENCES Dim_aeropuertos (id_aeropuerto),
        CONSTRAINT fk_fv_aero_destino FOREIGN KEY (id_aeropuerto_destino) REFERENCES Dim_aeropuertos (id_aeropuerto)
  )`,
]

export const queriesTruncateTables = [
  `DROP TABLE IF EXISTS Fact_Vuelos`,
  `DROP TABLE IF EXISTS Dim_Aerolineas`,
  `DROP TABLE IF EXISTS Dim_aviones`,
  `DROP TABLE IF EXISTS Dim_usuarios`,
  `DROP TABLE IF EXISTS Dim_aeropuertos`,
  `DROP TABLE IF EXISTS Dim_tiempo`,
];

export const queryAviones = `
      SELECT 
        id_avion,
        A.nombre nombre_avion,
        B.nombre modelo
      From aviones A
        Left join modelos B on A.id_modelo= B.id_modelo
    `;

export const queryAerolineas = `
      SELECT 
        id_aerolinea,
        nombre nombre_aerolinea
      From aerolineas
    `;

export const queryUsuarios = `
      SELECT
        cedula as id_usuario,
        nombre || ' ' || apellido as nombre_completo
      FROM usuarios;
    `;

export const queryAeropuertos = `
      SELECT 
        id_aeropuerto,
        A.nombre as nombre_aeropuerto,
        B.nombre as ciudad
      From aeropuertos A
        Left join ciudades B on B.id_ciudad= A.id_ciudad
    `;

export const queryTiempo = `
      SELECT 
        id_itinerario,
        fecha_salida as fecha
      From itinerarios
    `;

export const queryVuelos = `
      SELECT
        B.id_aerolinea as id_aerolinea,
        C.id_itinerario as id_fecha,
        C.id_aeropuerto_origen as id_aeropuerto_origen,
        C.id_aeropuerto_destino as id_aeropuerto_destino,
        D.cedula as id_usuario,
        A.costo
      From vuelos A
        Left join aviones B on A.id_avion = B.id_avion 
        Left join itinerarios C on A.id_itinerario = C.id_itinerario 
        Left join usuarios D on A.id_usuario = D.cedula
    `;

export const insertQueryAviones = `
      INSERT INTO Dim_aviones (id_avion, nombre_avion, modelo) 
      VALUES ($1, $2, $3)
  `;

export const insertQueryAerolineas = `
      INSERT INTO Dim_aerolineas (id_aerolinea, nombre_aerolinea) 
      VALUES ($1, $2)
  `;

export const insertQueryUsuarios = `
      INSERT INTO Dim_usuarios (id_usuario, nombre_completo) 
      VALUES ($1, $2)
  `;

export const insertQueryAeropuertos = `
      INSERT INTO Dim_aeropuertos (id_aeropuerto, nombre_aeropuerto, ciudad) 
      VALUES ($1, $2, $3)
  `;

export const insertQueryTiempo = `
      INSERT INTO Dim_tiempo ( id_fecha, fecha, anio, mes, dia, hora, semestre, trimestre, bimestre)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;

export const insertQueryVuelos = `
      INSERT INTO Fact_vuelos (id_aerolinea, id_fecha, id_aeropuerto_origen, id_aeropuerto_destino, id_usuario, costo) 
      VALUES ($1, $2, $3, $4, $5, $6)
  `;