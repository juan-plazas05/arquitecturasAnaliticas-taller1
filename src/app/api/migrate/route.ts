import { NextRequest, NextResponse } from 'next/server';
import { migrateData } from '../../../../backend/main';

export async function POST(req: NextRequest) {
  const body = await req.json();
  await migrateData(body.host, body.port, body.user, body.password, body.database);
  return NextResponse.json({ success: true });
}