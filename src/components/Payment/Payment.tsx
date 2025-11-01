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
import { getMobileNetworkForNumber } from '../../lib/util';
import { PaynowClient } from '../../lib/paynowClient';

export default function PaymentModal({
  items,
  label,
  paymentMode,
  isOpen,
  onClose,
}: PaymentProps) {
  const { config } = useContext(PaynowContext);
  const [myItems] = useState(items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paynowClient, setPaynowClient] = useState<PaynowClient | null>(null);

  // Initialize PaynowClient when config is available
  useEffect(() => {
    if (config) {
      const client = new PaynowClient(
        config.apiEndpoint,
        config.integration_id,
        config.result_url,
        config.return_url
      );
      setPaynowClient(client);
    }
  }, [config]);

  // Get total of items in cart
  const totalAmount = myItems.reduce((acc, item) => {
    return acc + item.amount * item.quantity;
  }, 0);

  const isMobilePayment = paymentMode === 'mobile';

  useEffect(() => {}, [items, label, paymentMode]);
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

  const submitMobilePayment = async (e: any) => {
    e.preventDefault();
    const phone = e.target.phone.value;
    const email = e.target.email.value;
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!paynowClient) {
      setError('Paynow client not initialized. Please check your configuration.');
      return;
    }

    let paidOrError = false;

    setLoading(true);
    setError('');

    try {
      const response = await paynowClient.initMobilePayment(
        label,
        items,
        phone,
        email,
        getMobileNetworkForNumber(phone)
      );

      if (!response.success || !response.pollUrl) {
        setLoading(false);
        setError(response.error || 'Failed to initialize mobile payment');
        return;
      }

      // Poll for payment status
      let pollInterval = setInterval(async () => {
        try {
          const status = await paynowClient.pollTransaction(response.pollUrl!);
          
          if (status.status === 'paid' && !paidOrError) {
            setLoading(false);
            paidOrError = true;
            closeModal({ paid: true, phone, email });
            clearInterval(pollInterval);
          } else if (status.status === 'cancelled' && !paidOrError) {
            setLoading(false);
            setError(
              'The payment has been cancelled by the user. Please try again.'
            );
            paidOrError = true;
            closeModal({ paid: false, phone, email });
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error('Error polling transaction:', err);
          setError((err as Error).message || 'Error checking payment status');
          clearInterval(pollInterval);
        }
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError((err as Error).message || 'An error occurred while processing payment');
    }
  };

  const submitWebPayment = async (e: any) => {
    e.preventDefault();

    if (!paynowClient) {
      setError('Paynow client not initialized. Please check your configuration.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await paynowClient.initPayment(label, items);

      if (!response.success || !response.redirectUrl) {
        setLoading(false);
        setError(response.error || 'Failed to initialize payment');
        return;
      }

      // Redirect to Paynow payment page
      window.location.href = response.redirectUrl;
    } catch (err) {
      setLoading(false);
      setError((err as Error).message || 'A network error occurred');
    }
  };

  const closeModal = (data?: any) => {
    if (data) {
      onClose(data);
    } else {
      onClose({
        paid: false,
        info: 'Modal closed by user',
      });
    }
  };

  return (
    <Modal size="xl" isOpen={isOpen} onClose={closeModal}>
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

            <Box maxH={200} overflowY={'auto'} experimental_spaceY={2}>
              {myItems.map(item => (
                <Flex
                  alignItems={'center'}
                  key={item.title}
                  experimental_spaceX={4}
                >
                  <Box w={14} h={'auto'}>
                    <Image
                      rounded={'xl'}
                      src={item.image}
                      alt={item.title}
                      fallbackSrc="https://via.placeholder.com/150"
                    />
                  </Box>
                  <Box flex={1}>
                    <Flex justifyContent={'space-between'} w="full">
                      <Heading mb={1} fontSize={'md'} isTruncated>
                        {item.title}
                      </Heading>
                      <Heading
                        fontWeight={'medium'}
                        fontSize={'md'}
                        flex={1}
                        pl={2}
                        textAlign={'right'}
                      >
                        {Intl.NumberFormat('en-us', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(item.amount)}
                      </Heading>
                    </Flex>
                    <Flex alignItems={'center'} experimental_spaceX={2}>
                      <Text>Quantity: {item.quantity}</Text>
                    </Flex>
                  </Box>
                </Flex>
              ))}
            </Box>
            <Divider py={2} />
            {isMobilePayment ? (
              <Box py={2} mt={4}>
                <form onSubmit={submitMobilePayment}>
                  <FormControl py={2}>
                    <FormLabel>Mobile number</FormLabel>
                    <Input
                      type="number"
                      maxLength={10}
                      minLength={10}
                      autoComplete="off"
                      name="phone"
                      variant={'flushed'}
                      placeholder="0777777777"
                      required
                    />
                    {error && (
                      <FormHelperText color={'red.500'}>{error}</FormHelperText>
                    )}
                  </FormControl>
                  <FormControl py={2}>
                    <FormLabel>Email address</FormLabel>
                    <Input
                      type="email"
                      autoComplete="off"
                      name="email"
                      placeholder="you@example.com"
                      variant={'flushed'}
                      required
                    />
                  </FormControl>
                  <Box mt={4} experimental_spaceY={2}>
                    <FormControl>
                      <Button
                        isFullWidth
                        colorScheme="blue"
                        mr={3}
                        type="submit"
                        isLoading={loading}
                      >{`Pay RTGS$ ${Intl.NumberFormat('en-us', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(totalAmount)}`}</Button>
                    </FormControl>
                    <FormControl>
                      <Button onClick={onClose} isFullWidth variant="outline">
                        Cancel
                      </Button>
                    </FormControl>
                  </Box>
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
