"use client"
import React, { useState } from "react";

const origenOptions = [
  { value: "", label: "Seleccione una opcion" },
  { value: "aerolineas", label: "Aerolineas" },
  { value: "aeropuertos", label: "Aeropuertos" },
  { value: "aviones", label: "Aviones" },
  { value: "ciudades", label: "Ciudades" },
  { value: "itinerarios", label: "itinerarios" },
  { value: "modelos", label: "Modelos" },
  { value: "usuarios", label: "Usuarios" },
  { value: "vuelos", label: "Vuelos" },
];

const destinoOptions = [
  { value: "", label: "Seleccione una opcion" },
  { value: "Dim_aerolineas", label: "Aerolineas" },
  { value: "Dim_aeropuertos", label: "Aeropuertos" },
  { value: "Dim_aviones", label: "Aviones" },
  { value: "Dim_tiempo", label: "Tiempo" },
  { value: "Fact_vuelos", label: "Vuelos" },
];

type TableRow = Record<string, string | number | boolean | null>;
function DataTable({ data }: { data: TableRow[] }) {
  const containerStyle = {
    maxHeight: '400px',
    minHeight: '400px',
    width: '100%',
    minWidth: '0',
    overflowX: 'auto' as React.CSSProperties['overflowX'],
    overflowY: 'auto' as React.CSSProperties['overflowY']
  };
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={containerStyle}>
        <div className="text-center text-gray-500 text-lg">No hay data para esta tabla</div>
      </div>
    );
  }
  const headers = data && data.length > 0 ? Object.keys(data[0] as Record<string, unknown>) : [];
  return (
    <div className="w-full h-full" style={containerStyle}>
      <table className="w-full border border-gray-300 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-2 py-1 border-b text-lg font-semibold text-gray-700 text-center">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: Record<string, unknown>, idx: number) => (
            <tr key={idx} className="hover:bg-gray-50">
              {headers.map((h) => (
                <td key={h} className="px-2 py-1 border-b text-lg text-gray-600 text-center">{row[h] as string}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Page() {
  const [fields, setFields] = useState({
    host: "db.spauqplsifsswlcfnsti.supabase.co",
    port: "5432",
    user: "postgres",
    password: "TallerArqui1",
    database: "postgres"
  });
  const [loading, setLoading] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [migrationFinished, setMigrationFinished] = useState(false);
  const [migrationError, setMigrationError] = useState(false);
  const logsEndRef = React.useRef<HTMLDivElement>(null);
  const [origenTable, setOrigenTable] = useState("");
  const [destinoTable, setDestinoTable] = useState("");
  const [origenData, setOrigenData] = useState([]);
  const [destinoData, setDestinoData] = useState([]);

  // Llama a la API backend que expone migrateData de main.js
  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMigrationLogs([]);
    setMigrationFinished(false);
    const params = new URLSearchParams(fields).toString();
    const eventSource = new EventSource(`/api/migrate?${params}`);
    eventSource.onmessage = (event) => {
      setMigrationLogs(logs => [...logs, event.data]);
    };
    eventSource.addEventListener('end', () => {
      eventSource.close();
      setMigrationFinished(true);
      setMigrationError(false);
    });
    eventSource.addEventListener('error', () => {
      setMigrationLogs(logs => [...logs, 'Error en la migración']);
      eventSource.close();
      setMigrationFinished(true);
      setMigrationError(true);
    });
  };

  // Scroll automático al último log
  React.useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [migrationLogs]);

  // Cerrar el modal al hacer clic fuera
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (migrationFinished && e.target === e.currentTarget) {
      setLoading(false);
    }
  };

  // Llama a la API backend que expone getData de main.js
  const handleOrigenChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setOrigenTable(value);
    if (value) {
      const res = await fetch(`/api/getData?table=${value}&conexion=origen`);
      const data = await res.json();
      setOrigenData(data || []);
    } else {
      setOrigenData([]);
    }
  };

  const handleDestinoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDestinoTable(value);
    if (value) {
      const res = await fetch(`/api/getData?table=${value}&conexion=destino&host=${fields.host}&port=${fields.port}&user=${fields.user}&password=${fields.password}&database=${fields.database}`);
      const data = await res.json();
      setDestinoData(data || []);
    } else {
      setDestinoData([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8 relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={handleOverlayClick}>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center relative" style={{ width: '80vw', height: '80vh', maxWidth: '80vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <button className="absolute top-4 right-4 bg-red-500 text-white rounded px-3 py-1 text-sm font-semibold hover:bg-red-600 transition" onClick={() => migrationFinished && setLoading(false)} disabled={!migrationFinished} style={{ opacity: migrationFinished ? 1 : 0.5, cursor: migrationFinished ? 'pointer' : 'not-allowed' }}>
              Cerrar
            </button>
            {!migrationFinished ? (
              <>
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-blue-700 mb-4">Migrando datos...</p>
              </>
            ) : migrationError ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-red-600 mb-4">Migración falló</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-green-600 mb-4">Migración completa</p>
              </>
            )}
            <div className="bg-gray-100 rounded p-4 text-left overflow-y-auto flex-1 text-xs font-mono" style={{ whiteSpace: 'pre-wrap', maxHeight: 'calc(80vh - 120px)' }}>
              {migrationLogs.length === 0 ? (
                <span className="text-gray-400">Esperando logs...</span>
              ) : (
                <>
                  {migrationLogs.map((log, idx) => <div key={idx}>{log}</div>)}
                  <div ref={logsEndRef} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="w-full flex flex-row gap-8">
        <form onSubmit={handleConfirm} className="flex-1 max-w-xl bg-white rounded-xl shadow-lg p-8 flex flex-col justify-center">
          <div className="mb-4 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-2 text-sm">
            <strong>Advertencia:</strong> La base de datos destino debe ser <span className="font-bold">PostgreSQL</span>.<br />
            <span className="block mt-2">Los datos de inicio son de una base de datos para <span className="font-bold">fines académicos</span>, al igual que la base de datos de origen.</span>
          </div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Datos de la DB Destino</h2>
          <div className="grid grid-cols-2 gap-4">
            <input name="host" placeholder="Host" value={fields.host} onChange={e => setFields(f => ({ ...f, host: e.target.value }))} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring" />
            <input name="port" placeholder="Puerto" value={fields.port} onChange={e => setFields(f => ({ ...f, port: e.target.value }))} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring" />
            <input name="user" placeholder="Usuario" value={fields.user} onChange={e => setFields(f => ({ ...f, user: e.target.value }))} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring" />
            <input name="password" type="password" placeholder="Contraseña" value={fields.password} onChange={e => setFields(f => ({ ...f, password: e.target.value }))} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring" />
            <input name="database" placeholder="Base de datos" value={fields.database} onChange={e => setFields(f => ({ ...f, database: e.target.value }))} className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring col-span-2" />
          </div>
          <button type="submit" className="w-full py-2 mt-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">Confirmar</button>
        </form>
        <div className="flex-1 flex gap-8 justify-center items-start">
          <div className="flex-1 bg-white rounded-lg shadow p-4 flex flex-col" style={{ minWidth: 0 }}>
            <h3 className="text-lg font-bold mb-2 text-gray-700">DB Origen</h3>
            <select value={origenTable} onChange={handleOrigenChange} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring">
              {origenOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="flex-1 overflow-auto max-h-[400px] min-h-[200px]">
              <DataTable data={origenData} />
            </div>
          </div>
          <div className="flex-1 bg-white rounded-lg shadow p-4 flex flex-col" style={{ minWidth: 0 }}>
            <h3 className="text-lg font-bold mb-2 text-gray-700">DB Destino</h3>
            <select value={destinoTable} onChange={handleDestinoChange} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring">
              {destinoOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="flex-1 overflow-auto max-h-[400px] min-h-[200px]">
              <DataTable data={destinoData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
