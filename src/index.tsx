import * as React from 'react';
import { PaynowReactProps } from './lib/types';
import { PaynowContext, PaynowContextProvider } from './PaynowContext';

export default function PaynowReactWrapper(props: PaynowReactProps) {
  const { setData } = React.useContext(PaynowContext);
  React.useEffect(() => {
    const { integration_id, integration_key, result_url, return_url } = props;
    setData({
      integration_id,
      integration_key,
      result_url,
      return_url,
    });
  }, [props]);

  return (
    <PaynowContextProvider>
      <div></div>
    </PaynowContextProvider>
  );
}
