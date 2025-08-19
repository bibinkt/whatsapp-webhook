import { NextResponse } from 'next/server';
import axios from 'axios';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://bibinkt.app.n8n.cloud/webhook/c28c1061-bb85-4111-9e06-7166f5bf13f2';

// Test endpoint to simulate WhatsApp messages
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Create a mock WhatsApp message
    const mockMessage = {
      object: 'whatsapp_business_account',
      entry: [{
        id: 'ENTRY_ID',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '16562170785',
              phone_number_id: 'PHONE_NUMBER_ID'
            },
            contacts: [{
              profile: {
                name: body.name || 'Test User'
              },
              wa_id: body.phone || '918089123456'
            }],
            messages: [{
              from: body.phone || '918089123456',
              id: 'wamid.' + Date.now(),
              timestamp: Math.floor(Date.now() / 1000).toString(),
              text: {
                body: body.message || 'Test message'
              },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    };
    
    // Forward to n8n
    const n8nResponse = await axios.post(N8N_WEBHOOK_URL, {
      source: 'whatsapp',
      type: 'message',
      message: {
        from: body.phone || '918089123456',
        text: body.message || 'Test message',
        profileName: body.name || 'Test User'
      },
      requiresProcessing: true,
      isTest: true,
      raw: mockMessage
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test message sent to n8n',
      n8n_response: n8nResponse.status,
      test_data: {
        phone: body.phone || '918089123456',
        message: body.message || 'Test message',
        name: body.name || 'Test User'
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET method to show test instructions
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/webhook/test',
    method: 'POST',
    description: 'Test endpoint to simulate WhatsApp messages',
    usage: {
      url: '/api/webhook/test',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        phone: '918089123456',
        message: 'Malabar Egg Curry',
        name: 'John Doe'
      }
    },
    curl_example: `curl -X POST http://localhost:3000/api/webhook/test \\
      -H "Content-Type: application/json" \\
      -d '{"phone":"918089123456","message":"Malabar Egg Curry","name":"John Doe"}'`
  });
}