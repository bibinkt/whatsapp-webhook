import { NextResponse } from 'next/server';

// Status endpoint to check if webhook is running
export async function GET(request) {
  return NextResponse.json({
    status: 'active',
    webhook_endpoints: {
      whatsapp: '/api/webhook/whatsapp',
      status: '/api/webhook/status',
      test: '/api/webhook/test'
    },
    configuration: {
      verify_token_set: !!process.env.WHATSAPP_VERIFY_TOKEN,
      n8n_webhook_set: !!process.env.N8N_WEBHOOK_URL,
      logging_enabled: process.env.ENABLE_LOGGING === 'true'
    },
    timestamp: new Date().toISOString()
  });
}