import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PaynowReactWrapper, { PaynowPayment } from '../dist/index';
import { Item } from '../dist/lib/types';

const items: Item[] = [
  {
    title: 'Annual Bleek Subscription',
    amount: 10,
    quantity: 1,
    image:
      'https://d1wqzb5bdbcre6.cloudfront.net/c25a949b6f1ffabee9af1a5696d7f152325bdce2d1b926456d42994c3d91ad78/68747470733a2f2f66696c65732e7374726970652e636f6d2f6c696e6b732f666c5f746573745f67625631776635726a4c64725a635858647032346d643649',
  },
  {
    title: 'Annual Snack Subscription',
    amount: 200.1,
    quantity: 1,
    image: '',
  },
];

const config = {
  integration_id: '11160',
  integration_key: '2d0a5f25-8598-4f93-9d78-422a3b0b825b',
  result_url: 'http://localhost:3000',
  return_url: 'http://localhost:3000',
};

const App = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const onClose = data => {
    setIsOpen(false);
    console.log(data);
  };
  return (
    <div>
      <PaynowReactWrapper {...config}>
        <PaynowPayment
          items={items}
          label="Express checkout"
          paymentMode="mobile"
          isOpen={isOpen}
          onClose={onClose}
        />
      </PaynowReactWrapper>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
