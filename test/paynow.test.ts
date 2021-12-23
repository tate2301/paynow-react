/**
 * @jest-environment jsdom
 */
import Payment from '../src/lib/classes/payment';
import Paynow from '../src/lib/paynow';
require('dotenv').config();

const paynow = new Paynow(
  'integrationId',
  'integrationKey',
  'resultUrl',
  'returnUrl'
);

describe('Paynow Core', () => {
  it('Should init paynow object', () => {
    expect(paynow).toBeDefined();
  });

  it('Should instantiate payment', () => {
    const payment = new Payment('reference', 'authEmail');

    expect(payment).toBeInstanceOf(Payment);
  });

  it('Should be able to add items to cart', () => {
    const payment = new Payment('reference', 'authEmail');
    let initialCartLength = payment.items.length();
    payment.add('Test Item', 10, 1);
    let cartLength = payment.items.length();
    expect(initialCartLength).toBeLessThan(cartLength);
  });

  it('Should be able to get total of cart', () => {
    const payment = new Payment('reference', 'authEmail');
    payment.add('Test Item', 10, 1);
    let total = payment.total();
    expect(total).toBe(10);
  });

  it('Should be able to get summary of cart', () => {
    const payment = new Payment('reference', 'authEmail');
    payment.add('Test Item', 10, 1);
    let summary = payment.info();
    expect(summary).toBe('Test Item, ');
  });

  it('Should be able to generate hash', () => {
    const payment = new Payment('reference', 'authEmail');
    payment.add('Test Item', 10, 1);
    let hash = paynow.generateHash({ key: 'key', value: 'value' }, 'key');
    expect(hash).toBeDefined();
  });

  it('Should be able to build payment', () => {
    const payment = new Payment('reference', 'authEmail');
    payment.add('Test Item', 10, 1);
    let data = paynow.build(payment);
    expect(data).toBeDefined();
  });

  it('Should be able to build mobile payment', () => {
    const payment = new Payment('reference', 'authEmail');
    payment.add('Test Item', 10, 1);
    let data = paynow.buildMobile(payment, '0712345678', 'ecocash');
    expect(data).toBeDefined();
  });

  it('Should be able to url encode', () => {
    const payment = new Payment('reference', 'authEmail');
    payment.add('Test Item', 10, 1);
    let data = paynow.urlEncode('test');
    expect(data).toBe('test');
  });
});

describe('Paynow Normal Integration', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const PAYNOW_INTEGRATION_ID = process.env.PAYNOW_INTEGRATION_ID;
  const PAYNOW_INTEGRATION_KEY = process.env.PAYNOW_INTEGRATION_KEY;

  it('Should receive enviroment variables', () => {
    expect(PAYNOW_INTEGRATION_ID).toBeDefined();
    expect(PAYNOW_INTEGRATION_KEY).toBeDefined();
  });

  let paynow: Paynow;

  it('Should instantiate paynow', () => {
    paynow = new Paynow(
      PAYNOW_INTEGRATION_ID!,
      PAYNOW_INTEGRATION_KEY!,
      'http://localhost:3000/gateways/paynow/update',
      'http://localhost:3000/'
    );
    expect(paynow).toBeInstanceOf(Paynow);
  });

  it('Should create a payment', () => {
    let payment = paynow.createPayment('Invoice 1');
    expect(payment).toBeInstanceOf(Payment);
  });

  it('Should add item to cart', () => {
    let payment = paynow.createPayment('Invoice 1');
    payment.add('Bananas', 10.1, 1);
    expect(payment.items.length()).toBe(1);
  });

  it('Should send payment to paynow', async () => {
    let payment = paynow.createPayment('Invoice 1');
    payment.add('Bananas', 10.1, 1);
    let data = await paynow.send(payment);
    await expect(data).toBeDefined();
  });
});

describe('Paynow Mobile Integration', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const PAYNOW_INTEGRATION_ID = process.env.PAYNOW_INTEGRATION_ID;
  const PAYNOW_INTEGRATION_KEY = process.env.PAYNOW_INTEGRATION_KEY;

  it('Should receive enviroment variables', () => {
    expect(PAYNOW_INTEGRATION_ID).toBeDefined();
    expect(PAYNOW_INTEGRATION_KEY).toBeDefined();
  });

  let paynow: Paynow;
  let payment: Payment;

  it('Should instantiate paynow', () => {
    paynow = new Paynow(
      PAYNOW_INTEGRATION_ID!,
      PAYNOW_INTEGRATION_KEY!,
      'http://localhost:3000/gateways/paynow/update',
      'http://localhost:3000/'
    );
    expect(paynow).toBeInstanceOf(Paynow);
  });

  it('Should create a mobile payment', () => {
    payment = paynow.createPayment('Invoice 1', 'tatendachris@gmail.com');
    expect(payment).toBeInstanceOf(Payment);
  });

  it('Should add item to cart', () => {
    payment.add('Bananas', 10.1, 1);
    expect(payment.items.length()).toBe(1);
  });

  it('Should send mobile payment to paynow', async () => {
    let data = await paynow.sendMobile(payment, '0771111111', 'ecocash');
    await expect(data).toBeDefined();
  });
});
