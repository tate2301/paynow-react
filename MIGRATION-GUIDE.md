# Security-First Migration Guide

## ⚠️ BREAKING CHANGE: Integration Key Security

**Version 2.0.0+** of paynow-react has been updated to address a critical security issue: **the `integration_key` should never be exposed to client-side code**.

## Why This Change?

Previously, paynow-react required you to pass your `integration_key` directly to the React component:

```jsx
// ❌ INSECURE - Old approach (DO NOT USE)
const paynow_config = {
  integration_id: 'your-integration-id',
  integration_key: 'your-integration-key', // Exposed to client!
  result_url: 'default-result-url',
  return_url: 'default-return-url',
};
```

This meant your secret integration key was:
- Bundled into your JavaScript code
- Visible to anyone who inspects your website
- Compromised if someone had access to your bundle

## New Secure Architecture

The new version uses a **server-side proxy pattern**:

1. Your React app communicates with **your backend server**
2. Your backend server (securely) communicates with Paynow
3. Your `integration_key` stays safe on the server

```
[React App] <---> [Your Server] <---> [Paynow API]
                   (has integration_key)
```

## Migration Steps

### Step 1: Set Up Your Server

Create a backend API that handles Paynow operations. We provide a complete example in `server-example.js`.

**Quick Start (Express.js):**

```bash
npm install express paynow
```

Create `server.js`:

```javascript
const express = require('express');
const { Paynow } = require('paynow');

const app = express();
app.use(express.json());

// Initialize Paynow with your credentials
const paynow = new Paynow(
  process.env.PAYNOW_INTEGRATION_ID,
  process.env.PAYNOW_INTEGRATION_KEY
);

// Initialize payment endpoint
app.post('/api/paynow/init', async (req, res) => {
  const { reference, items, resultUrl, returnUrl } = req.body;
  
  paynow.resultUrl = resultUrl;
  paynow.returnUrl = returnUrl;
  
  const payment = paynow.createPayment(reference);
  items.forEach(item => {
    payment.add(item.title, item.amount * item.quantity);
  });
  
  const response = await paynow.send(payment);
  
  res.json({
    success: response.success,
    redirectUrl: response.redirectUrl,
    pollUrl: response.pollUrl,
    error: response.error
  });
});

// Mobile payment endpoint
app.post('/api/paynow/init-mobile', async (req, res) => {
  const { reference, items, phone, email, method, resultUrl, returnUrl } = req.body;
  
  paynow.resultUrl = resultUrl;
  paynow.returnUrl = returnUrl;
  
  const payment = paynow.createPayment(reference, email);
  items.forEach(item => {
    payment.add(item.title, item.amount * item.quantity);
  });
  
  const response = await paynow.sendMobile(payment, phone, method);
  
  res.json({
    success: response.success,
    pollUrl: response.pollUrl,
    error: response.error
  });
});

// Poll status endpoint
app.post('/api/paynow/poll', async (req, res) => {
  const { pollUrl } = req.body;
  const status = await paynow.pollTransaction(pollUrl);
  
  res.json({
    status: status.status,
    amount: status.amount,
    reference: status.reference
  });
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

See `server-example.js` for a complete, production-ready implementation.

### Step 2: Update Your React App

Update your `PaynowReactWrapper` configuration:

```jsx
// ✅ SECURE - New approach
const paynow_config = {
  integration_id: 'your-integration-id',
  apiEndpoint: 'http://localhost:3001/api/paynow', // Your server endpoint
  result_url: 'https://yourdomain.com/payment/result',
  return_url: 'https://yourdomain.com/payment/return',
};

function App({ Component }) {
  return (
    <PaynowReactWrapper {...paynow_config}>
      <Component />
    </PaynowReactWrapper>
  );
}
```

### Step 3: Use PaynowPayment Component (No Changes!)

The `PaynowPayment` component API remains the same:

```jsx
import { PaynowPayment } from 'paynow-react';
import React, { useState } from 'react';

const items = [
  {
    title: 'Product Name',
    amount: 10,
    quantity: 1,
  },
];

const Checkout = () => {
  const [isOpen, setIsOpen] = React.useState(true);

  const onCloseHandler = (data) => {
    console.log(data);
    setIsOpen(false);
  };

  return (
    <PaynowPayment
      items={items}
      label="Express checkout"
      paymentMode="mobile"
      isOpen={isOpen}
      onClose={onCloseHandler}
    />
  );
};
```

## Server API Endpoints

Your server must implement these three endpoints:

### POST /api/paynow/init
Initialize a web payment (user will be redirected to Paynow)

**Request:**
```json
{
  "reference": "INV001",
  "items": [{"title": "Product", "amount": 10, "quantity": 1}],
  "resultUrl": "https://yourdomain.com/result",
  "returnUrl": "https://yourdomain.com/return",
  "integrationId": "your-integration-id"
}
```

**Response:**
```json
{
  "success": true,
  "redirectUrl": "https://paynow.co.zw/...",
  "pollUrl": "https://paynow.co.zw/..."
}
```

### POST /api/paynow/init-mobile
Initialize a mobile payment (EcoCash, OneMoney, etc.)

**Request:**
```json
{
  "reference": "INV001",
  "items": [{"title": "Product", "amount": 10, "quantity": 1}],
  "phone": "0771234567",
  "email": "user@example.com",
  "method": "ecocash",
  "resultUrl": "https://yourdomain.com/result",
  "returnUrl": "https://yourdomain.com/return",
  "integrationId": "your-integration-id"
}
```

**Response:**
```json
{
  "success": true,
  "pollUrl": "https://paynow.co.zw/..."
}
```

### POST /api/paynow/poll
Check payment status

**Request:**
```json
{
  "pollUrl": "https://paynow.co.zw/..."
}
```

**Response:**
```json
{
  "status": "paid",
  "amount": "10.00",
  "reference": "INV001"
}
```

## Deployment Considerations

### Environment Variables
Store your credentials securely:

```bash
PAYNOW_INTEGRATION_ID=your-integration-id
PAYNOW_INTEGRATION_KEY=your-integration-key
```

### CORS Configuration
Configure CORS on your server to only allow your frontend domain:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://yourdomain.com');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  next();
});
```

### Security Best Practices

1. **Validate Integration ID**: Always verify the `integrationId` in requests matches your credentials
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Request Validation**: Validate all incoming data
4. **HTTPS Only**: Use HTTPS in production
5. **Error Handling**: Don't expose internal errors to clients

## Framework-Specific Examples

### Next.js API Routes

Create `pages/api/paynow/init.js`:

```javascript
import { Paynow } from 'paynow';

const paynow = new Paynow(
  process.env.PAYNOW_INTEGRATION_ID,
  process.env.PAYNOW_INTEGRATION_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference, items, resultUrl, returnUrl } = req.body;
  
  paynow.resultUrl = resultUrl;
  paynow.returnUrl = returnUrl;
  
  const payment = paynow.createPayment(reference);
  items.forEach(item => {
    payment.add(item.title, item.amount * item.quantity);
  });
  
  const response = await paynow.send(payment);
  
  return res.json({
    success: response.success,
    redirectUrl: response.redirectUrl,
    pollUrl: response.pollUrl,
    error: response.error
  });
}
```

Then set `apiEndpoint: '/api/paynow'` in your config.

### Cloudflare Workers / Vercel Edge Functions

Similar pattern - create serverless functions that proxy to Paynow API.

## FAQ

**Q: Can I still use the old approach with integration_key in the client?**  
A: No, this is a security vulnerability. Version 2.0.0+ removes this capability.

**Q: Do I need to change my payment component code?**  
A: No, only the configuration changes. The PaynowPayment component API is unchanged.

**Q: What if I don't have a backend server?**  
A: You need a backend to use Paynow securely. Consider serverless options like Next.js API routes, Vercel functions, or Netlify functions.

**Q: Will this affect my existing transactions?**  
A: No, existing transactions are not affected. This only changes how new transactions are initiated.

## Need Help?

- See `server-example.js` for a complete server implementation
- Check the examples folder for framework-specific demos
- Open an issue on GitHub for questions
