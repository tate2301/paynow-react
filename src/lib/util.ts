export const getMobileNetworkForNumber = (phone: string): string => {
  const prefix = phone.substring(0, 3);
  if (prefix === '077') return 'ecocash';
  if (prefix === '078') return 'ecocash';
  return 'onemoney';
};
