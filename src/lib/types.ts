import { ReactNode } from 'react';

export type PaynowReactProps = {
  integration_id: string;
  result_url: string;
  return_url: string;
  /**
   * Server-side API endpoint for payment initialization.
   * This endpoint should handle Paynow API calls with your integration_key securely on the server.
   * 
   * For web payments: POST /api/paynow/init
   * Expected request body: { reference: string, items: Item[], resultUrl: string, returnUrl: string }
   * Expected response: { success: boolean, redirectUrl?: string, pollUrl?: string, error?: string }
   * 
   * For mobile payments: POST /api/paynow/init-mobile  
   * Expected request body: { reference: string, items: Item[], phone: string, email: string, resultUrl: string, returnUrl: string }
   * Expected response: { success: boolean, pollUrl?: string, error?: string }
   * 
   * For polling status: POST /api/paynow/poll
   * Expected request body: { pollUrl: string }
   * Expected response: { status: string, amount?: string, reference?: string }
   */
  apiEndpoint: string;
  children: ReactNode;
};

export type PaymentProps = {
  items: [Item];
  label: string;
  paymentMode: PaymentMode;
  isOpen: boolean;
  onClose: (data: any) => void;
};

export type Item = {
  title: string;
  amount: number;
  quantity: number;
  image?: string;
};

export type PaymentMode = 'mobile' | 'default';

// Server API request/response types
export type InitPaymentRequest = {
  reference: string;
  items: Item[];
  resultUrl: string;
  returnUrl: string;
  integrationId: string;
};

export type InitMobilePaymentRequest = InitPaymentRequest & {
  phone: string;
  email: string;
  method: string;
};

export type InitPaymentResponse = {
  success: boolean;
  redirectUrl?: string;
  pollUrl?: string;
  error?: string;
  status?: string;
};

export type PollPaymentRequest = {
  pollUrl: string;
};

export type PollPaymentResponse = {
  status: string;
  amount?: string;
  reference?: string;
  paynowReference?: string;
};
