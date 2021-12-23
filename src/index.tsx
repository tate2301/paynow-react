import { ChakraProvider } from '@chakra-ui/react';
import * as React from 'react';
import PaymentModal from './components/Payment/Payment';
import { PaymentProps, PaynowReactProps } from './lib/types';
import { PaynowContext, PaynowContextProvider } from './PaynowContext';

export default function PaynowReactWrapper(props: PaynowReactProps) {
  return (
    <PaynowContextProvider>
      <PaynowWrapperConsumer {...props}>{props.children}</PaynowWrapperConsumer>
    </PaynowContextProvider>
  );
}

const PaynowWrapperConsumer = (props: PaynowReactProps) => {
  const { setData } = React.useContext(PaynowContext);
  React.useEffect(() => {
    const { integration_id, integration_key, result_url, return_url } = props;
    setData({
      integration_id,
      integration_key,
      result_url,
      return_url,
    });
  }, []);
  return <>{props.children}</>;
};

export const PaynowPayment = (props: PaymentProps) => (
  <ChakraProvider>
    <PaymentModal {...props} />
  </ChakraProvider>
);
