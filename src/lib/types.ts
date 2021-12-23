export type PaynowReactProps = {
  integration_id: string;
  integration_key: string;
  result_url: string;
  return_url: string;
};

export type PaymentProps = {
  items: Item[];
  label: string;
  footerText: string;
  paymentMode: PaymentMode;
};

export type Item = {
  title: string;
  amount: number;
  quantity: number;
};

export type PaymentMode = 'mobile' | 'default';
