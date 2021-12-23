import React, { useContext, useEffect } from 'react';
import { PaynowContext } from '../../PaynowContext';
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { PaymentProps } from '../../lib/types';

export default function PaymentModal({
  items,
  label,
  footerText,
  paymentMode,
}: PaymentProps) {
  const { paynow } = useContext(PaynowContext);
  const { onOpen, onClose, isOpen } = useDisclosure();

  useEffect(() => {
    onOpen();
  }, []);

  useEffect(() => {}, [items, label, footerText, paymentMode]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Modal Title</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Welcome to paynow payments</ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button variant="ghost">Secondary Action</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
