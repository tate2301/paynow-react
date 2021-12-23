# Paynow React SDK

> Not officially supported by Paynow.

> This repo was bootstrapped using TSDX

> Direct issues to https://github.com/tate2301/paynow-react/issues or on twitter [@kamfeskaya](https://twitter.com/KamfesKaya)

# Getting started

Before you can start making requests to Paynow's API, you need to get an integration ID and integration Key from Paynow. Sign in to Paynow and get integration details. [Here's](https://developers.paynow.co.zw/docs/integration_generation.html) a detailed guide on how to go about this process.

## Installation

Install the library using NPM or yarn

```bash
   yarn install paynow-react
   // or
   npm install paynow-react
```

## Set up Provider

For Paynow React to work correctly, you need to set up the PaynowWrapper at the root of your application.

Go to the root of your application and do this:

```jsx
import * as React from 'react';

// 1. import `PaynowReactWrapper` component
import { PaynowReactWrapper } from 'paynow-react';

function App({ Component }) {
  // 2. Use at the root of your app
  const paynow_config = {
    integration_id: 'your-integration-id',
    integration_key: 'your-integration-key',
    result_url: 'default-result-url',
    return_url: 'default-return-url',
  };
  return (
    <PaynowReactWrapper {...paynow_config}>
      <Component />
    </PaynowReactWrapper>
  );
}
```

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
