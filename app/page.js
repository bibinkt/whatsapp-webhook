'use client';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [status, setStatus] = useState(null);
  const [testMessage, setTestMessage] = useState('Malabar Egg Curry');
  const [testPhone, setTestPhone] = useState('918089123456');
  const [testName, setTestName] = useState('Test User');
  const [testResult, setTestResult] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    // Fetch status
    fetch('/api/webhook/status')
      .then(res => res.json())
      .then(data => setStatus(data));

    // Get current URL for webhook
    const url = `${window.location.origin}/api/webhook/whatsapp`;
    setWebhookUrl(url);
  }, []);

  const sendTestMessage = async () => {
    try {
      const response = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: testPhone,
          message: testMessage,
          name: testName
        })
      });
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: error.message });
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ color: '#6366f1' }}>🍳 ApexElement WhatsApp Webhook</h1>
      
      <div style={{ marginTop: '2rem', background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
        <h2>📊 Status</h2>
        {status && (
          <div>
            <p>✅ Webhook Status: <strong>{status.status}</strong></p>
            <p>🔗 n8n Webhook: <strong>{status.configuration.n8n_webhook_set ? 'Configured' : 'Not Set'}</strong></p>
            <p>🔑 Verify Token: <strong>{status.configuration.verify_token_set ? 'Set' : 'Not Set'}</strong></p>
            <p>📝 Logging: <strong>{status.configuration.logging_enabled ? 'Enabled' : 'Disabled'}</strong></p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', background: '#e0e7ff', padding: '1rem', borderRadius: '8px' }}>
        <h2>🔗 Your Webhook URL for Meta/WhatsApp</h2>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', marginTop: '0.5rem' }}>
          <code style={{ fontSize: '14px', wordBreak: 'break-all' }}>{webhookUrl}</code>
        </div>
        <p style={{ fontSize: '14px', marginTop: '0.5rem', color: '#6b7280' }}>
          Use this URL in your Meta/WhatsApp Business webhook configuration
        </p>
      </div>

      <div style={{ marginTop: '2rem', background: '#fef3c7', padding: '1rem', borderRadius: '8px' }}>
        <h2>🧪 Test Webhook</h2>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Name:</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Phone Number:</label>
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem' }}>Message:</label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
            />
          </div>
          <button
            onClick={sendTestMessage}
            style={{
              background: '#6366f1',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Send Test Message to n8n
          </button>
        </div>
        
        {testResult && (
          <div style={{ marginTop: '1rem', background: 'white', padding: '0.5rem', borderRadius: '4px' }}>
            <pre style={{ fontSize: '12px' }}>{JSON.stringify(testResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
        <h2>📚 Setup Instructions</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Deploy this app to Vercel or any hosting service</li>
          <li>Copy the webhook URL shown above</li>
          <li>Go to Meta for Developers → Your App → WhatsApp → Configuration</li>
          <li>Paste the webhook URL and set verify token: <code>apexelement_recipe_2024</code></li>
          <li>Click "Verify and Save"</li>
          <li>Subscribe to webhook fields: messages, message_status</li>
        </ol>
      </div>

      <div style={{ marginTop: '2rem', background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
        <h2>🔄 Data Flow</h2>
        <p>WhatsApp → This Webhook → n8n → Recipe Generation → WhatsApp API</p>
      </div>
    </div>
  );
}