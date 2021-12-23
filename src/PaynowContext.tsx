import React, { ReactNode, useEffect, useState } from 'react';
import { createContext } from 'react';
import Paynow from './lib/paynow';

type PaynowContextType = {
  paynow: Paynow | null;
  setData: (data: any) => void;
};

export const PaynowContext = createContext<PaynowContextType>({
  paynow: null,
  setData: () => {},
});

export const PaynowContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [data, setData] = useState<{
    integration_id: string;
    integration_key: string;
    result_url: string;
    return_url: string;
  }>({
    integration_id: '',
    integration_key: '',
    result_url: '',
    return_url: '',
  });
  let [paynow, setPaynow] = useState<Paynow | null>(null);
  const updateValues = (data: any) => {
    setData(data);
  };

  useEffect(() => {
    const { integration_id, integration_key, result_url, return_url } = data;
    if (integration_id && integration_key && result_url && return_url) {
      setPaynow(
        new Paynow(integration_id, integration_key, result_url, return_url)
      );
    }
  }, [data]);

  return (
    <PaynowContext.Provider value={{ paynow, setData: updateValues }}>
      {children}
    </PaynowContext.Provider>
  );
};
export {};
