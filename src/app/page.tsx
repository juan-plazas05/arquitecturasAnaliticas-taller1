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

function DataTable({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500">No hay data para esta tabla</div>;
  }
  const headers = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-2 py-1 border-b text-xs font-semibold text-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, idx: number) => (
            <tr key={idx} className="hover:bg-gray-50">
              {headers.map((h) => (
                <td key={h} className="px-2 py-1 border-b text-xs text-gray-600">{row[h]}</td>
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
  const [origenTable, setOrigenTable] = useState("");
  const [destinoTable, setDestinoTable] = useState("");
  const [origenData, setOrigenData] = useState([]);
  const [destinoData, setDestinoData] = useState([]);

  // Llama a la API backend que expone migrateData de main.js
  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields)
    });
    setLoading(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-blue-700">Migrando datos...</p>
          </div>
        </div>
      )}
      <form onSubmit={handleConfirm} className="w-full max-w-md bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-4 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-2 text-sm">
          <strong>Advertencia:</strong> La base de datos destino debe ser <span className="font-bold">PostgreSQL</span>.
        </div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Datos de la DB Destino</h2>
        <input name="host" placeholder="Host" value={fields.host} onChange={e => setFields(f => ({ ...f, host: e.target.value }))} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring" />
        <input name="port" placeholder="Puerto" value={fields.port} onChange={e => setFields(f => ({ ...f, port: e.target.value }))} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring" />
        <input name="user" placeholder="Usuario" value={fields.user} onChange={e => setFields(f => ({ ...f, user: e.target.value }))} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring" />
        <input name="password" type="password" placeholder="Contraseña" value={fields.password} onChange={e => setFields(f => ({ ...f, password: e.target.value }))} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring" />
        <input name="database" placeholder="Base de datos" value={fields.database} onChange={e => setFields(f => ({ ...f, database: e.target.value }))} className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring" />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">Confirmar</button>
      </form>
      <div className="w-full max-w-6xl flex gap-8">
        <div className="flex-1 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-2 text-gray-700">DB Origen</h3>
          <select value={origenTable} onChange={handleOrigenChange} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring">
            {origenOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <DataTable data={origenData} />
        </div>
        <div className="flex-1 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold mb-2 text-gray-700">DB Destino</h3>
          <select value={destinoTable} onChange={handleDestinoChange} className="w-full mb-2 px-3 py-2 border rounded focus:outline-none focus:ring">
            {destinoOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <DataTable data={destinoData} />
        </div>
      </div>
    </div>
  );
}
