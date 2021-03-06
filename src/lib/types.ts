import { ReactNode } from 'react';

export type PaynowReactProps = {
  integration_id: string;
  integration_key: string;
  result_url: string;
  return_url: string;
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
