import { NextRequest, NextResponse } from 'next/server';
import { getData } from '../backend/main';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get('table');
  const host = searchParams.get('host');
  const port = searchParams.get('port');
  const user = searchParams.get('user');
  const password = searchParams.get('password');
  const database = searchParams.get('database');
  const conexion = searchParams.get('conexion');
  try {
    const data = await getData(table, conexion, host, port, user, password, database);
    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 });
  }
}