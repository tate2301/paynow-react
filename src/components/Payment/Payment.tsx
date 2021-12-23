import React, { useContext, useEffect, useState } from 'react';
import { PaynowContext } from '../../PaynowContext';
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { PaymentProps } from '../../lib/types';

export default function PaymentModal({
  items,
  label,
  footerText,
  paymentMode,
  isOpen,
  onClose,
}: PaymentProps) {
  const { paynow } = useContext(PaynowContext);
  const [myItems] = useState(items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get total of items in cart
  const totalAmount = myItems.reduce((acc, item) => {
    return acc + item.amount * item.quantity;
  }, 0);

  const isMobilePayment = paymentMode === 'mobile';

  useEffect(() => {}, [items, label, footerText, paymentMode]);
  /*
  const subtract = (index: number) => {
    if (myItems[index].quantity > 1) {
      myItems[index].quantity -= 1;
      setMyItems(myItems);
    }
  };

  const add = (index: number) => {
    myItems[index].quantity += 1;
    setMyItems(myItems);
  };
*/

  const submitMobilePayment = (e: any) => {
    e.preventDefault();
    const phone = e.target.phone.value;
    const method = e.target.method.value;
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    const payment = paynow?.createPayment(label);
    items.map(item => payment?.add(item.title, item.amount, item.quantity));
    paynow
      ?.sendMobile(payment!, e.target.phone.value, method)
      .then(data => {
        setLoading(false);
        console.log(data);
      })
      .catch(err => setError(err));
  };

  const submitWebPayment = (e: any) => {
    e.preventDefault();
    setLoading(true);
    const payment = paynow?.createPayment(label);
    items.map(item => payment?.add(item.title, item.amount, item.quantity));

    paynow
      ?.send(payment!)
      .then(data => {
        window.location.href = data!!.redirectUrl as string;
      })
      .catch(err => setError(err ?? 'A network error occured'));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{label}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mt={2} mb={8}>
            <Image
              mb={4}
              src="https://developers.paynow.co.zw/docs/assets/Paynow%20Badge-vector-hires%20DARK.svg"
              alt="Paynow"
              objectFit={'fill'}
            />
            <Divider my={2} />

            <Box my={4} maxH={200} overflowY={'auto'}>
              {myItems.map(item => (
                <Flex
                  alignItems={'center'}
                  key={item.title}
                  experimental_spaceX={4}
                >
                  <Box w={14} h={'auto'}>
                    <Image
                      rounded={'sm'}
                      src={item.image}
                      alt={item.title}
                      fallbackSrc="https://pixselo.com/wp-content/uploads/2018/03/dummy-placeholder-image-400x400.jpg"
                    />
                  </Box>
                  <Box flex={1}>
                    <Heading mb={1} fontSize={'md'}>
                      {item.title}
                    </Heading>
                    <Flex alignItems={'center'} experimental_spaceX={2}>
                      <Text>Quantity: {item.quantity}</Text>
                    </Flex>
                  </Box>
                </Flex>
              ))}
            </Box>
            {isMobilePayment ? (
              <Box py={2} border={'1px'} borderColor={'ActiveBorder'}>
                <Text>
                  This option uses EcoCash or OneMoney wallet to pay for this
                  transaction
                </Text>
                <form onSubmit={submitMobilePayment}>
                  <FormControl py={2}>
                    <FormLabel>What's your mobile number</FormLabel>
                    <Input
                      type="number"
                      maxLength={10}
                      minLength={10}
                      autoComplete="off"
                      name="phone"
                      variant={'filled'}
                      required
                    />
                    {error && (
                      <FormHelperText color={'red.500'}>{error}</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl py={2}>
                    <Button
                      isFullWidth
                      colorScheme="blue"
                      mr={3}
                      type="submit"
                      isLoading={loading}
                    >{`Pay RTGS$ ${totalAmount}`}</Button>
                  </FormControl>
                  <FormControl py={2}>
                    <Button onClick={onClose} isFullWidth variant="outline">
                      Cancel
                    </Button>
                  </FormControl>
                </form>
              </Box>
            ) : (
              <Box experimental_spaceY={4}>
                {error && <Text color="red.500">{error}</Text>}
                <Button
                  isFullWidth
                  colorScheme="blue"
                  mr={3}
                  isLoading={loading}
                  onClick={submitWebPayment}
                >
                  {'Checkout'}
                </Button>
                <Button onClick={onClose} isFullWidth variant="outline">
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
