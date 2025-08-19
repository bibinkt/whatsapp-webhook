import { NextResponse } from 'next/server';
import axios from 'axios';

// Configuration from environment variables
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'apexelement_recipe_2024';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://bibinkt.app.n8n.cloud/webhook/c28c1061-bb85-4111-9e06-7166f5bf13f2';
const ENABLE_LOGGING = process.env.ENABLE_LOGGING === 'true';

// Helper function to log if enabled
function log(...args) {
  if (ENABLE_LOGGING) {
    console.log('[WhatsApp Webhook]', ...args);
  }
}

// Handle GET request (WhatsApp Verification)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    
    log('Verification request received:', { mode, token, challenge });
    
    // Verify the webhook
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      log('✅ Webhook verified successfully');
      
      // Return the challenge to verify the webhook
      return new NextResponse(challenge, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    } else {
      log('❌ Webhook verification failed - invalid token or mode');
      
      return new NextResponse('Forbidden', {
        status: 403,
      });
    }
  } catch (error) {
    log('Error in GET handler:', error);
    
    return new NextResponse('Internal Server Error', {
      status: 500,
    });
  }
}

// Handle POST request (Incoming WhatsApp Messages)
export async function POST(request) {
  try {
    const body = await request.json();
    
    log('Received POST webhook:', JSON.stringify(body, null, 2));
    
    // Immediately respond to WhatsApp to acknowledge receipt
    // This must happen within 5 seconds
    const response = NextResponse.json(
      { status: 'EVENT_RECEIVED' },
      { status: 200 }
    );
    
    // Process the webhook asynchronously
    processWebhookAsync(body);
    
    return response;
    
  } catch (error) {
    log('Error in POST handler:', error);
    
    // Still return 200 to WhatsApp to avoid retries
    return NextResponse.json(
      { status: 'EVENT_RECEIVED' },
      { status: 200 }
    );
  }
}

// Process webhook asynchronously
async function processWebhookAsync(body) {
  try {
    // Check if this is a WhatsApp message
    if (body.object !== 'whatsapp_business_account') {
      log('Not a WhatsApp business account webhook, ignoring');
      return;
    }
    
    // Extract message data
    let extractedData = {
      source: 'whatsapp',
      timestamp: new Date().toISOString(),
      raw: body
    };
    
    // Check for incoming messages
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const change = body.entry[0].changes[0];
      const message = change.value.messages[0];
      const contact = change.value.contacts?.[0];
      const metadata = change.value.metadata;
      
      extractedData = {
        ...extractedData,
        type: 'message',
        message: {
          id: message.id,
          from: message.from,
          timestamp: message.timestamp,
          type: message.type,
          text: message.text?.body || null,
          profileName: contact?.profile?.name || null,
        },
        business: {
          phoneNumberId: metadata?.phone_number_id,
          displayPhoneNumber: metadata?.display_phone_number,
        },
        // Flag for n8n to know this needs processing
        requiresProcessing: true,
        isRecipeRequest: true // You can add logic to detect this
      };
      
      log('📩 Message received from:', message.from, '- Text:', message.text?.body);
    }
    
    // Check for status updates (delivery reports)
    else if (body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]) {
      const status = body.entry[0].changes[0].value.statuses[0];
      
      extractedData = {
        ...extractedData,
        type: 'status',
        status: {
          id: status.id,
          recipientId: status.recipient_id,
          status: status.status,
          timestamp: status.timestamp,
        },
        requiresProcessing: false
      };
      
      log('📊 Status update:', status.status, 'for message:', status.id);
    }
    
    // Forward to n8n webhook
    if (extractedData.requiresProcessing) {
      await forwardToN8N(extractedData);
    }
    
  } catch (error) {
    log('Error processing webhook:', error);
  }
}

// Forward data to n8n
async function forwardToN8N1(data) {
  try {
    log('Forwarding to n8n:', N8N_WEBHOOK_URL);
    log('Forwarding data:', data);
    
    const response = await axios.post(N8N_WEBHOOK_URL, data);
    
    log('✅ Successfully forwarded to n8n. Response:', response.status);
    
  } catch (error) {
    log('❌ Error forwarding to n8n:', error.message);
    
    // You could implement retry logic here
    // Or save to a queue for later processing
  }
}

async function forwardToN8N(data) {
  try {
    log('Forwarding to n8n with fetch:', N8N_WEBHOOK_URL);
    
    // Use fetch which is native and lighter
    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).then(response => {
      log('✅ n8n responded:', response.status);
    }).catch(err => {
      log('⚠️ n8n error (non-blocking):', err.message);
    });
    
    // Don't wait for the response
    return;
    
  } catch (error) {
    log('Error in fetch setup:', error.message);
  }
}
