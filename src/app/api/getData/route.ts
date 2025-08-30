import { NextRequest, NextResponse } from 'next/server';
import { getData } from '../../../../backend/main';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get('table');
  const host = searchParams.get('host');
  const port = searchParams.get('port');
  const user = searchParams.get('user');
  const password = searchParams.get('password');
  const database = searchParams.get('database');
  const conexion = searchParams.get('conexion');
  const data = await getData(table, conexion, host, port, user, password, database);
  return NextResponse.json(data);
}