[![npm version](https://img.shields.io/npm/v/paynow-react.svg?style=flat-square)](https://www.npmjs.com/package/paynow-react)
[![npm downloads](https://img.shields.io/npm/dt/paynow-react.svg?style=flat-square)](https://www.npmjs.com/package/paynow-react)

# Paynow React SDK

> Not officially supported by Paynow.

## 🔒 Security Notice

**Version 2.0.0+** implements a secure architecture that keeps your `integration_key` safe on the server side. Your integration key should **never** be exposed to client-side code.

If you're upgrading from v1.x, please read the [Migration Guide](./MIGRATION-GUIDE.md).

# Getting started

Before you can start making requests to Paynow's API, you need to get an integration ID and integration Key from Paynow. Sign in to Paynow and get integration details. [Here's](https://developers.paynow.co.zw/docs/integration_generation.html) a detailed guide on how to go about this process.

## Installation

Install the library using NPM or yarn

```bash
   yarn add paynow-react
   // or
   npm install paynow-react
```

## Prerequisites

⚠️ **Important**: This library requires a backend server to function securely. You cannot use Paynow React without a server-side component.

Your server will:
- Store your `integration_key` securely
- Handle Paynow API calls
- Generate cryptographic hashes

See [server-example.js](./server-example.js) for a complete implementation.

## Quick Start

### 1. Set up your server

Create a backend API with the following endpoints:
- `POST /api/paynow/init` - Initialize web payments
- `POST /api/paynow/init-mobile` - Initialize mobile payments
- `POST /api/paynow/poll` - Check payment status

See [server-example.js](./server-example.js) for a complete Express.js implementation, or check the [Migration Guide](./MIGRATION-GUIDE.md) for Next.js, Vercel, and other frameworks.

### 2. Set up Provider in your React app

For Paynow React to work correctly, you need to set up the PaynowWrapper at the root of your application.

Go to the root of your application and do this:

```jsx
import * as React from 'react';

// 1. import `PaynowReactWrapper` component
import { PaynowReactWrapper } from 'paynow-react';

function App({ Component }) {
  // 2. Configure with your server endpoint
  const paynow_config = {
    integration_id: 'your-integration-id',
    apiEndpoint: 'http://localhost:3001/api/paynow', // Your backend API
    result_url: 'https://yourdomain.com/payment/result',
    return_url: 'https://yourdomain.com/payment/return',
  };
  
  return (
    <PaynowReactWrapper {...paynow_config}>
      <Component />
    </PaynowReactWrapper>
  );
}
```

**Note**: The `integration_key` is now stored securely on your server, not passed to the React component.

## Types

Follows most of the type definitions given in Paynow-NodeJS-SDK and extends a few

### Item

The `image` url will be used to display an image in the list of items

```ts
type Item = {
  title: string;
  amount: number;
  quantity: number;
  image?: string;
};
```

### PaynowPaymentProps

The `<PaynowPayment />` component accepts the following props

```ts
type PaymentProps = {
  items: [Item];
  label: string;
  paymentMode: PaymentMode;
  isOpen: boolean;
  onClose: () => void;
};
```

## PaynowPayment

`<PaynowPayment/>` renders a modal that has the UI for the paynow payment.

```jsx
import { PaynowPayment } from 'paynow-react';
import React, { useState } from 'react';

const items = [
  {
    title: 'Annual Bleek Subscription',
    amount: 10,
    quantity: 1,
    image:
      'https://d1wqzb5bdbcre6.cloudfront.net/c25a949b6f1ffabee9af1a5696d7f152325bdce2d1b926456d42994c3d91ad78/68747470733a2f2f66696c65732e7374726970652e636f6d2f6c696e6b732f666c5f746573745f67625631776635726a4c64725a635858647032346d643649',
  },
  {
    title: 'Annual Clinch Subscription',
    amount: 200.1,
    quantity: 1,
  },
];

const Checkout = () => {
  // payment modal state
  const [isOpen, setIsOpen] = React.useState(true);

  // toggle modal state. Useful for mobile payments
  const onCloseHandler = data => {
    // Do something with the data and the close the modal
    console.log(data);
    setIsOpen(false);
  };

  return (
    <div>
      <PaynowPayment
        items={items}
        label="Express checkout"
        paymentMode="mobile"
        isOpen={isOpen}
        onClose={onCloseHandler}
      />
    </div>
  );
};
```

## Contribution

Please see our [contribution guidelines](https://github.com/tate2301/paynow-react/blob/main/CONTRIBUTING.md) to learn how you can contribute to this paynow-react.

## Architecture & Security

This library uses a **secure server-side proxy pattern** to protect your `integration_key`:

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│             │         │              │         │             │
│  React App  │────────▶│  Your Server │────────▶│  Paynow API │
│  (Client)   │         │  (Backend)   │         │             │
│             │         │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
                        Has integration_key
                        Generates hashes
                        Validates responses
```

**Why this matters:**
- Your `integration_key` is never exposed to the client
- All cryptographic operations happen server-side
- Your key cannot be extracted from your JavaScript bundle
- Complies with security best practices

For implementation details, see the [Migration Guide](./MIGRATION-GUIDE.md).
