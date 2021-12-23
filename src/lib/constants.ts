/*
 * Taken from https://github.com/paynow/Paynow-NodeJS-SDK/blob/master/src/constants.ts
 */

/*
 * Success response from Paynow
 */
export const RESPONSE_OK: string = 'ok';

/**
 * Error response from Paynow
 */
export const RESPONSE_ERROR: string = 'error';

/**
 * API endpoint for initiating normal web-based transactions
 */
export const URL_INITIATE_TRANSACTION: string =
  'https://www.paynow.co.zw/interface/initiatetransaction';

/**
 * API endpoint for initiating mobile based transactions
 */
export const URL_INITIATE_MOBILE_TRANSACTION: string =
  'https://www.paynow.co.zw/interface/remotetransaction';
