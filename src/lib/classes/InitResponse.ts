/**
 *
 * @property {boolean} success - indicates if initiate request was successful or not.
 * @property {boolean} hasRedirect - indicates if the response has a URL to redirect to.
 * @property {String} redirectUrl - the URL the user should be redirected to so they can make a payment.
 * @property {String} error - error message sent from Paynow (if any).
 * @property {String} pollUrl  - pollUrl sent from Paynow that can be used to check transaction status.
 * @property {String} instructions - instructions for USSD push for customers to dial incase of mobile money payments.
 * @property {String} status - status from Paynow.
 *
 * @param data - data from the Response.
 *
 */

import { RESPONSE_OK } from '../constants';

export class InitResponse {
  success: boolean;
  hasRedirect: boolean;
  redirectUrl?: String;
  error?: String;
  pollUrl?: String;
  instructions?: String;
  status: String;

  constructor(data: any) {
    this.status = data.status.toLowerCase();
    this.success = this.status === RESPONSE_OK;
    this.hasRedirect = typeof data.browserurl !== 'undefined';

    if (!this.success) {
      this.error = data.error;
    } else {
      this.pollUrl = data.pollurl;

      if (this.hasRedirect) {
        this.redirectUrl = data.browserurl;
      }

      if (typeof data.instructions !== 'undefined') {
        this.instructions = data.instructions;
      }
    }
  }
}
