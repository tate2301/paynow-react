/**
 * @jest-environment jsdom
 */
import { PaynowClient } from '../src/lib/paynowClient';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PaynowClient', () => {
  let client: PaynowClient;
  const apiEndpoint = 'http://localhost:3001/api/paynow';
  const integrationId = 'test-integration-id';
  const resultUrl = 'http://localhost:3000/result';
  const returnUrl = 'http://localhost:3000/return';

  beforeEach(() => {
    client = new PaynowClient(
      apiEndpoint,
      integrationId,
      resultUrl,
      returnUrl
    );
    jest.clearAllMocks();
  });

  describe('initPayment', () => {
    it('should successfully initialize a payment', async () => {
      const mockResponse = {
        data: {
          success: true,
          redirectUrl: 'https://paynow.co.zw/payment/12345',
          pollUrl: 'https://paynow.co.zw/poll/12345',
        },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const items = [
        { title: 'Test Item', amount: 10, quantity: 1 },
      ];
      const result = await client.initPayment('INV001', items);

      expect(result.success).toBe(true);
      expect(result.redirectUrl).toBeDefined();
      expect(result.pollUrl).toBeDefined();
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${apiEndpoint}/init`,
        expect.objectContaining({
          reference: 'INV001',
          items,
          integrationId,
        })
      );
    });

    it('should handle payment initialization error', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Invalid credentials',
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      const items = [
        { title: 'Test Item', amount: 10, quantity: 1 },
      ];

      await expect(client.initPayment('INV001', items)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('initMobilePayment', () => {
    it('should successfully initialize a mobile payment', async () => {
      const mockResponse = {
        data: {
          success: true,
          pollUrl: 'https://paynow.co.zw/poll/12345',
          status: 'sent',
        },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const items = [
        { title: 'Test Item', amount: 10, quantity: 1 },
      ];
      const result = await client.initMobilePayment(
        'INV001',
        items,
        '0771234567',
        'test@example.com',
        'ecocash'
      );

      expect(result.success).toBe(true);
      expect(result.pollUrl).toBeDefined();
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${apiEndpoint}/init-mobile`,
        expect.objectContaining({
          reference: 'INV001',
          items,
          phone: '0771234567',
          email: 'test@example.com',
          method: 'ecocash',
        })
      );
    });

    it('should handle mobile payment initialization error', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Invalid phone number',
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      const items = [
        { title: 'Test Item', amount: 10, quantity: 1 },
      ];

      await expect(
        client.initMobilePayment(
          'INV001',
          items,
          'invalid',
          'test@example.com',
          'ecocash'
        )
      ).rejects.toThrow('Invalid phone number');
    });
  });

  describe('pollTransaction', () => {
    it('should successfully poll transaction status', async () => {
      const mockResponse = {
        data: {
          status: 'paid',
          amount: '10.00',
          reference: 'INV001',
        },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const pollUrl = 'https://paynow.co.zw/poll/12345';
      const result = await client.pollTransaction(pollUrl);

      expect(result.status).toBe('paid');
      expect(result.amount).toBe('10.00');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${apiEndpoint}/poll`,
        expect.objectContaining({
          pollUrl,
        })
      );
    });

    it('should handle polling error', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Transaction not found',
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      const pollUrl = 'https://paynow.co.zw/poll/12345';

      await expect(client.pollTransaction(pollUrl)).rejects.toThrow(
        'Transaction not found'
      );
    });
  });
});
