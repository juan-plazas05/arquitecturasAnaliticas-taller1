import { NextRequest, NextResponse } from 'next/server';
import { truncateTables } from '../../../../backend/main';

export async function POST(req: NextRequest) {
  const body = await req.json();
  await truncateTables(null, body.host, body.port, body.user, body.password, body.database);
  return NextResponse.json({ success: true });
}