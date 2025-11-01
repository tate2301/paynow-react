/**
 * Example Server-Side Implementation for Paynow React
 * 
 * This file demonstrates how to create a secure backend API that handles
 * Paynow payments without exposing your integration_key to the client.
 * 
 * IMPORTANT: This code should run on your server, NOT in the browser.
 * 
 * Installation:
 * npm install express paynow
 * 
 * Usage:
 * 1. Set your PAYNOW_INTEGRATION_ID and PAYNOW_INTEGRATION_KEY environment variables
 * 2. Run this server: node server-example.js
 * 3. Configure paynow-react to use apiEndpoint: "http://localhost:3001/api/paynow"
 */

const express = require('express');
const { Paynow } = require('paynow');

const app = express();
app.use(express.json());

// Enable CORS for your frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Update with your frontend URL
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Paynow with your credentials (from environment variables)
const paynow = new Paynow(
  process.env.PAYNOW_INTEGRATION_ID,
  process.env.PAYNOW_INTEGRATION_KEY
);

/**
 * Initialize a web payment
 * POST /api/paynow/init
 */
app.post('/api/paynow/init', async (req, res) => {
  try {
    const { reference, items, resultUrl, returnUrl, integrationId } = req.body;

    // Validate request
    if (!reference || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: reference and items are required',
      });
    }

    // Verify integration ID matches
    if (integrationId !== process.env.PAYNOW_INTEGRATION_ID) {
      return res.status(403).json({
        success: false,
        error: 'Invalid integration ID',
      });
    }

    // Set URLs
    paynow.resultUrl = resultUrl;
    paynow.returnUrl = returnUrl;

    // Create payment
    const payment = paynow.createPayment(reference);

    // Add items to payment
    items.forEach(item => {
      payment.add(item.title, item.amount, item.quantity);
    });

    // Send payment to Paynow
    const response = await paynow.send(payment);

    if (response.success) {
      return res.json({
        success: true,
        redirectUrl: response.redirectUrl,
        pollUrl: response.pollUrl,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.error || 'Payment initialization failed',
      });
    }
  } catch (error) {
    console.error('Error initializing payment:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * Initialize a mobile payment
 * POST /api/paynow/init-mobile
 */
app.post('/api/paynow/init-mobile', async (req, res) => {
  try {
    const {
      reference,
      items,
      phone,
      email,
      method,
      resultUrl,
      returnUrl,
      integrationId,
    } = req.body;

    // Validate request
    if (
      !reference ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !phone ||
      !email ||
      !method
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Invalid request: reference, items, phone, email, and method are required',
      });
    }

    // Verify integration ID matches
    if (integrationId !== process.env.PAYNOW_INTEGRATION_ID) {
      return res.status(403).json({
        success: false,
        error: 'Invalid integration ID',
      });
    }

    // Set URLs
    paynow.resultUrl = resultUrl;
    paynow.returnUrl = returnUrl;

    // Create payment with email
    const payment = paynow.createPayment(reference, email);

    // Add items to payment
    items.forEach(item => {
      payment.add(item.title, item.amount, item.quantity);
    });

    // Send mobile payment to Paynow
    const response = await paynow.sendMobile(payment, phone, method);

    if (response.success) {
      return res.json({
        success: true,
        pollUrl: response.pollUrl,
        status: response.status,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.error || 'Mobile payment initialization failed',
      });
    }
  } catch (error) {
    console.error('Error initializing mobile payment:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * Poll transaction status
 * POST /api/paynow/poll
 */
app.post('/api/paynow/poll', async (req, res) => {
  try {
    const { pollUrl } = req.body;

    if (!pollUrl) {
      return res.status(400).json({
        success: false,
        error: 'Poll URL is required',
      });
    }

    // Poll the transaction
    const status = await paynow.pollTransaction(pollUrl);

    return res.json({
      status: status.status,
      amount: status.amount,
      reference: status.reference,
      paynowReference: status.paynowreference,
    });
  } catch (error) {
    console.error('Error polling transaction:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to poll transaction',
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Paynow server running on port ${PORT}`);
  console.log(`Integration ID: ${process.env.PAYNOW_INTEGRATION_ID}`);
});
