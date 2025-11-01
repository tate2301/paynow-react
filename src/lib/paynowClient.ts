import axios from 'axios';
import {
  InitPaymentRequest,
  InitMobilePaymentRequest,
  InitPaymentResponse,
  PollPaymentRequest,
  PollPaymentResponse,
  Item,
} from './types';

/**
 * PaynowClient handles communication with your server-side API
 * which in turn communicates with Paynow's API securely.
 * 
 * This keeps the integration_key secure on the server side.
 */
export class PaynowClient {
  constructor(
    private apiEndpoint: string,
    private integrationId: string,
    private resultUrl: string,
    private returnUrl: string
  ) {}

  /**
   * Initialize a web payment via your server endpoint
   */
  async initPayment(
    reference: string,
    items: Item[]
  ): Promise<InitPaymentResponse> {
    try {
      const payload: InitPaymentRequest = {
        reference,
        items,
        resultUrl: this.resultUrl,
        returnUrl: this.returnUrl,
        integrationId: this.integrationId,
      };

      const response = await axios.post<InitPaymentResponse>(
        `${this.apiEndpoint}/init`,
        payload
      );

      return response.data;
    } catch (error) {
      const err = error as any;
      console.error('Error initializing payment:', err);
      throw new Error(
        err.response?.data?.error ||
          err.message ||
          'Failed to initialize payment'
      );
    }
  }

  /**
   * Initialize a mobile payment via your server endpoint
   */
  async initMobilePayment(
    reference: string,
    items: Item[],
    phone: string,
    email: string,
    method: string
  ): Promise<InitPaymentResponse> {
    try {
      const payload: InitMobilePaymentRequest = {
        reference,
        items,
        phone,
        email,
        method,
        resultUrl: this.resultUrl,
        returnUrl: this.returnUrl,
        integrationId: this.integrationId,
      };

      const response = await axios.post<InitPaymentResponse>(
        `${this.apiEndpoint}/init-mobile`,
        payload
      );

      return response.data;
    } catch (error) {
      const err = error as any;
      console.error('Error initializing mobile payment:', err);
      throw new Error(
        err.response?.data?.error ||
          err.message ||
          'Failed to initialize mobile payment'
      );
    }
  }

  /**
   * Poll transaction status via your server endpoint
   */
  async pollTransaction(pollUrl: string): Promise<PollPaymentResponse> {
    try {
      const payload: PollPaymentRequest = {
        pollUrl,
      };

      const response = await axios.post<PollPaymentResponse>(
        `${this.apiEndpoint}/poll`,
        payload
      );

      return response.data;
    } catch (error) {
      const err = error as any;
      console.error('Error polling transaction:', err);
      throw new Error(
        err.response?.data?.error ||
          err.message ||
          'Failed to poll transaction status'
      );
    }
  }
}
