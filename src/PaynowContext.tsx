import React, { ReactNode, useState } from 'react';
import { createContext } from 'react';

type PaynowConfig = {
  integration_id: string;
  result_url: string;
  return_url: string;
  apiEndpoint: string;
};

type PaynowContextType = {
  config: PaynowConfig | null;
  setData: (data: PaynowConfig) => void;
};

export const PaynowContext = createContext<PaynowContextType>({
  config: null,
  setData: () => {},
});

export const PaynowContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [config, setConfig] = useState<PaynowConfig | null>(null);

  const updateValues = (data: PaynowConfig) => {
    setConfig(data);
  };

  return (
    <PaynowContext.Provider value={{ config, setData: updateValues }}>
      {children}
    </PaynowContext.Provider>
  );
};
export {};
