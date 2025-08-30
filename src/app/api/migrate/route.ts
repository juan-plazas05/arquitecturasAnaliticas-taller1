import { NextRequest, NextResponse } from 'next/server';
import { migrateData } from '../../../../backend/main';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const host = url.searchParams.get('host');
  const port = url.searchParams.get('port');
  const user = url.searchParams.get('user');
  const password = url.searchParams.get('password');
  const database = url.searchParams.get('database');

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Redefinir console.log para enviar logs por SSE
      const originalLog = console.log;
      console.log = (msg, ...args) => {
        let line = typeof msg === 'string' ? msg : JSON.stringify(msg);
        if (args.length) line += ' ' + args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
        controller.enqueue(encoder.encode(`data: ${line}\n\n`));
        originalLog(msg, ...args);
      };
      try {
        await migrateData(host, port, user, password, database);
        controller.enqueue(encoder.encode(`event: end\ndata: done\n\n`));
      } catch (err: any) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${err?.message || 'error'}\n\n`));
      } finally {
        console.log = originalLog;
        controller.close();
      }
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
/*
export async function POST(req: NextRequest) {
  const body = await req.json();
  let logs: any = [];
  // Redefinir console.log temporalmente para capturar los logs
  const originalLog = console.log;
  console.log = (msg, ...args) => {
    logs.push(typeof msg === 'string' ? msg : JSON.stringify(msg));
    if (args.length) logs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
    originalLog(msg, ...args);
  };
  try {
    await migrateData(body.host, body.port, body.user, body.password, body.database);
  } finally {
    console.log = originalLog;
  }
  return NextResponse.json({ success: true, logs });
}
  */