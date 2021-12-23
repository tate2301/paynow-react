import React, { ReactNode } from 'react';
import { createContext } from 'react';

type PaynowContextType = {
  paynow: {};
};

let PaynowContext = createContext<PaynowContextType>({
  paynow: {},
});

export const PaynowContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <PaynowContext.Provider value={{ paynow: {} }}>
      {children}
    </PaynowContext.Provider>
  );
};
export {};
