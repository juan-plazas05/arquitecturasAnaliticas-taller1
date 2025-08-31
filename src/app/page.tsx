"use client"
import React, { useState } from "react";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const origenOptions = [
  { value: "", label: "Seleccione una opcion" },
  { value: "aerolineas", label: "Aerolineas" },
  { value: "aeropuertos", label: "Aeropuertos" },
  { value: "aviones", label: "Aviones" },
  { value: "ciudades", label: "Ciudades" },
  { value: "itinerarios", label: "Itinerarios" },
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

type ConsultaCellProps = {
  title: string;
  data: TableRow[];
  yearKey?: string;
  columns: { key: string; label: string }[];
  chartX: string;
  chartY: string;
  yearOptions: number[];
  kpi?: (year: number, filtered: TableRow[]) => React.ReactNode;
};

function ConsultaCell({ title, data, yearKey = 'anio', columns, chartX, chartY, yearOptions, kpi }: ConsultaCellProps) {
  const [selectedYear, setSelectedYear] = useState<number>(yearOptions[0]);
  // Convertir valores numéricos string a number para gráficas
  const filtered: TableRow[] = data.filter((row) => row[yearKey!] === selectedYear);
  const sorted: TableRow[] = [...filtered].sort((a, b) => Number(b[chartY] ?? 0) - Number(a[chartY] ?? 0));
  const chartData = {
    labels: sorted.map((row) => String(row[chartX])),
    datasets: [
      {
        label: chartY,
        data: sorted.map((row) => Number(row[chartY])),
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
      },
    ],
  };
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 min-w-0 h-[630px]">
      <h4 className="text-lg font-bold mb-2 text-gray-700">{title}</h4>
      {kpi && (
        <div className="mb-2 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white text-center shadow-lg">
          {kpi(selectedYear, filtered)}
        </div>
      )}
      <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="mb-2 px-3 py-2 border rounded focus:outline-none focus:ring w-full">
        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <div className="overflow-auto max-h-80">
        <table className="w-full border border-gray-300 rounded-lg text-xs">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => <th key={col.key} className="px-2 py-1 border-b font-semibold text-gray-700 text-center">{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((col) => <td key={col.key} className="px-2 py-1 border-b text-gray-600 text-center">{row[col.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-[270px]">
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [fields, setFields] = useState({
    host: "db.lxuwtifutoqlcdkrzbpk.supabase.co",
    port: "5432",
    user: "postgres",
    password: "tallerarqui1",
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
  const [consultasLoading, setConsultasLoading] = useState(false);
  const [consultasError, setConsultasError] = useState("");
  type ConsultasDataType = {
    rowsMayorNumeroVuelos: TableRow[];
    rowsTotalDineroPrimerSemestre: TableRow[];
    rowsModeloMasVuelos: TableRow[];
    rowsTotalUsuariosPorCiudad: TableRow[];
  } | null;
  const [consultasData, setConsultasData] = useState<ConsultasDataType>(null);
  // Validar datos de la DB destino
  const validateDbFields = () => {
    return fields.host && fields.port && fields.user && fields.password && fields.database;
  };

  // Consultas
  const handleConsultas = async () => {
    setConsultasError("");
    if (!validateDbFields()) {
      setConsultasError("Por favor ingrese todos los datos de la DB destino.");
      return;
    }
    setConsultasLoading(true);
    try {
      const params = new URLSearchParams(fields).toString();
      const res = await fetch(`/api/getAnswers?${params}`);
      const data = await res.json();
      setConsultasData(data);
    } catch {
      setConsultasError("Error al consultar los datos.");
    } finally {
      setConsultasLoading(false);
    }
  };

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

  // ...existing code...
  // Años disponibles (ajusta si hay más años)
  const yearOptions = [2019, 2020];

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
  <form onSubmit={handleConfirm} className="flex-1 max-w-xl min-w-[400px] bg-white rounded-xl shadow-lg p-8 flex flex-col justify-center">
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
          <button
            type="button"
            className="w-full py-2 mt-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
            onClick={handleConsultas}
            disabled={consultasLoading}
          >
            {consultasLoading ? "Consultando..." : "Consultas"}
          </button>
          {consultasError && <div className="mt-2 text-red-600 text-sm">{consultasError}</div>}
        </form>
  <div className="flex-1 flex gap-8 justify-center items-start">
          <div className="flex-1 bg-white rounded-lg shadow p-4 flex flex-col min-w-[400px] max-w-[500px]" style={{ minWidth: 0 }}>
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
          <div className="flex-1 bg-white rounded-lg shadow p-4 flex flex-col min-w-[400px] max-w-[500px]" style={{ minWidth: 0 }}>
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
      {/* Cuadricula de consultas */}
      {consultasData && (
        <div className="w-full grid grid-cols-2 grid-rows-2 gap-6 mt-8">
          <ConsultaCell
            title="Mayor Número de Vuelos"
            data={consultasData.rowsMayorNumeroVuelos || []}
            yearKey="anio"
            columns={[{ key: "nombre_aerolinea", label: "Aerolinea" }, { key: "anio", label: "Año" }, { key: "total_vuelos", label: "Total Vuelos" }, { key: "ranking", label: "Ranking" }]}
            chartX="nombre_aerolinea"
            chartY="total_vuelos"
            yearOptions={yearOptions}
            kpi={(year, filtered) => {
              const top = filtered.find(r => r.ranking === "1");
              return top
                ? <span className="text-xl font-bold">¿Cuál aerolínea realizó el mayor número de vuelos a la ciudad de Roma en el año {year}? <br /><span className="underline">{top.nombre_aerolinea}</span> con <span className="underline">{top.total_vuelos}</span> vuelos.</span>
                : <span className="text-lg">No hay datos para el año {year}.</span>;
            }}
          />
          <ConsultaCell
            title="Total Dinero Primer Semestre"
            data={consultasData.rowsTotalDineroPrimerSemestre || []}
            yearKey="anio"
            columns={[{ key: "nombre_aerolinea", label: "Aerolinea" }, { key: "anio", label: "Año" }, { key: "total_recaudado", label: "Total Recaudado" }]}
            chartX="nombre_aerolinea"
            chartY="total_recaudado"
            yearOptions={yearOptions}
            kpi={(year, filtered) => {
              const total = filtered.reduce((acc, r) => acc + Number(r.total_recaudado), 0);
              return <span className="text-xl font-bold">Total de dinero recaudado por vuelos de todas las aerolíneas en el primer semestre del año {year}: <br /><span className="underline">${total.toLocaleString()}</span></span>;
            }}
          />
          <ConsultaCell
            title="Modelo con Más Vuelos"
            data={consultasData.rowsModeloMasVuelos || []}
            yearKey="anio"
            columns={[{ key: "modelo", label: "Modelo" }, { key: "anio", label: "Año" }, { key: "total_vuelos", label: "Total Vuelos" }]}
            chartX="modelo"
            chartY="total_vuelos"
            yearOptions={yearOptions}
            kpi={(year, filtered) => {
              const top = filtered.reduce((max, r) => Number(r.total_vuelos) > Number(max.total_vuelos) ? r : max, filtered[0] || { modelo: '', total_vuelos: 0 });
              return top && top.modelo
                ? <span className="text-xl font-bold">¿Cuál modelo de avión realizó el mayor número de vuelos en el año {year}? <br /><span className="underline">{top.modelo}</span> con <span className="underline">{top.total_vuelos}</span> vuelos.</span>
                : <span className="text-lg">No hay datos para el año {year}.</span>;
            }}
          />
          <ConsultaCell
            title="Total Usuarios por Ciudad"
            data={consultasData.rowsTotalUsuariosPorCiudad || []}
            yearKey="anio"
            columns={[{ key: "ciudad", label: "Ciudad" }, { key: "anio", label: "Año" }, { key: "total_vuelos", label: "Total Vuelos" }]}
            chartX="ciudad"
            chartY="total_vuelos"
            yearOptions={yearOptions}
            kpi={(year, filtered) => {
              const top = filtered.reduce((max, r) => Number(r.total_vuelos) > Number(max.total_vuelos) ? r : max, filtered[0] || { ciudad: '', total_vuelos: 0 });
              return top && top.ciudad
                ? <span className="text-xl font-bold">¿Cuál fue la ciudad cuyos habitantes viajaron más en el año {year}? <br /><span className="underline">{top.ciudad}</span> con <span className="underline">{top.total_vuelos}</span> vuelos.</span>
                : <span className="text-lg">No hay datos para el año {year}.</span>;
            }}
          />
        </div>
      )}
    </div>
  );
}
