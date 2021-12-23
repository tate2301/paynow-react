import axios from 'axios';
import { InitResponse } from './classes/InitResponse';
import Payment from './classes/payment';
import { StatusResponse } from './classes/StatusResponse';
import {
  URL_INITIATE_MOBILE_TRANSACTION,
  URL_INITIATE_TRANSACTION,
} from './constants';

import qs from 'qs';

const paynowAxiosInstance = axios.create({
  baseURL: 'https://cors-anywhere.herokuapp.com/https://www.paynow.co.zw',
});

export default class Paynow {
  constructor(
    public integrationId: string,
    public integrationKey: string,
    public resultUrl?: string,
    public returnUrl?: string
  ) {}

  /**
   * Send a payment to paynow
   * @param payment
   */
  send(payment: Payment) {
    return this.init(payment);
  }

  /**
   * Send a mobile money payment to paynow
   * @param payment
   */
  sendMobile(payment: Payment, phone: string, method: string) {
    return this.initMobile(payment, phone, method);
  }

  /**
   * Create a new Paynow payment
   * @param {String} reference This is the unique reference of the transaction
   * @param {String} authEmail This is the email address of the person making payment. Required for mobile transactions
   * @returns {Payment}
   */
  createPayment(reference: string, authEmail?: string): Payment {
    return new Payment(reference, authEmail);
  }

  /**
   * Throw an exception with the given message
   * @param message*
   * @returns void
   */
  fail(message: string): Error {
    throw new Error(message);
  }

  /**
   * Initialize a new transaction with PayNow
   * @param payment
   * @returns {PromiseLike<InitResponse> | Promise<InitResponse>}
   */
  init(payment: Payment) {
    this.validate(payment);
    let data = this.build(payment);
    return paynowAxiosInstance
      .post(URL_INITIATE_TRANSACTION, qs.stringify(data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          mode: 'no-cors',
        },
      })
      .then(res => {
        return this.parse(res.data);
      })
      .catch(function(err) {
        console.error(err);
        throw 'An error occured while initiating the transaction';
      });
  }

  /**
   * Initialize a new mobile transaction with PayNow
   * @param {Payment} payment
   * @returns {PromiseLike<InitResponse> | Promise<InitResponse>} the response from the initiation of the transaction
   */
  initMobile(payment: Payment, phone: string, method: string) {
    this.validate(payment);

    if (!this.isValidEmail(payment.authEmail ?? ''))
      this.fail(
        'Invalid email. Please ensure that you pass a valid email address when initiating a mobile payment'
      );

    let data = this.buildMobile(payment, phone, method);

    return paynowAxiosInstance
      .post(URL_INITIATE_MOBILE_TRANSACTION, data)
      .then(res => {
        return this.parse(res.data);
      })
      .catch(function(err) {
        console.error(err);
        throw 'An error occured while initiating the transaction';
      });
  }

  /**
   * Validates whether an email address is valid or not
   *
   * @param {string} emailAddress The email address to validate
   *
   * @returns {boolean} A value indicating an email is valid or not
   */
  isValidEmail(emailAddress: string) {
    if (!emailAddress || emailAddress.length === 0) return false;

    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailAddress);
  }

  /**
   * Parses the response from Paynow
   * @param response
   * @returns {InitResponse}
   */
  parse(response: Response) {
    if (typeof response === 'undefined') {
      return null;
    }
    if (response) {
      let parsedResponseURL = this.parseQuery((response as unknown) as string);
      if (
        parsedResponseURL.status.toString() !== 'error' &&
        !this.verifyHash(parsedResponseURL)
      ) {
        throw new Error('Hashes do not match!');
      }

      return new InitResponse(parsedResponseURL);
    } else {
      throw new Error('An unknown error occurred');
    }
  }

  /**
   * Creates a SHA512 hash of the transactions
   * @param values
   * @param integrationKey
   * @returns {string}
   */
  generateHash(values: { [key: string]: string }, integrationKey: String) {
    let sha512 = require('js-sha512').sha512;
    let string: string = '';

    for (const key of Object.keys(values)) {
      if (key !== 'hash') {
        string += values[key];
      }
    }

    string += integrationKey.toLowerCase();

    return sha512(string).toUpperCase();
  }

  /**
   * Verify hashes at all interactions with server
   * @param {*} values
   */
  verifyHash(values: { [key: string]: string }) {
    if (typeof values['hash'] === 'undefined') {
      return false;
    } else {
      return values['hash'] === this.generateHash(values, this.integrationKey);
    }
  }

  /**
   * URL encodes the given string
   * @param str {String}
   * @returns {String}
   */
  urlEncode(url: string) {
    return encodeURI(url);
  }

  /**
   * URL decodes the given string
   * @param str {String}
   * @returns {String}
   */
  urlDecode(url: string) {
    return decodeURIComponent(
      (url + '')
        .replace(/%(?![\da-f]{2})/gi, function() {
          return '%25';
        })
        .replace(/\+/g, '%20')
    );
  }

  /**
   * Parse responses from Paynow
   * @param queryString
   */
  parseQuery(queryString: string) {
    let query: { [key: string]: string } = {};
    let pairs = (queryString[0] === '?'
      ? queryString.substr(1)
      : queryString
    ).split('&');
    for (let i = 0; i < pairs.length; i++) {
      let pair = pairs[i].split('=');
      query[this.urlDecode(pair[0])] = this.urlDecode(pair[1] || '');
    }

    // if(!this.verifyHash(query))
    //         throw new Error("Hash mismatch");
    return query;
  }

  /**
   * Build up a payment into the format required by Paynow
   * @param payment
   * @returns {{resulturl: String, returnurl: String, reference: String, amount: number, id: String, additionalinfo: String, authemail: String, status: String}}
   */
  build(payment: Payment) {
    let data: { [key: string]: string } = {
      resulturl: this.resultUrl ?? '',
      returnurl: this.returnUrl ?? '',
      reference: payment.reference,
      amount: payment.total().toString(),
      id: this.integrationId,
      additionalinfo: payment.info(),
      authemail:
        typeof payment.authEmail === 'undefined' ? '' : payment.authEmail,
      status: 'Message',
    };

    for (const key of Object.keys(data)) {
      if (key === 'hash') continue;

      data[key] = this.urlEncode(data[key]);
    }

    data['hash'] = this.generateHash(data, this.integrationKey);

    return data;
  }

  /**
   * Build up a mobile payment into the format required by Paynow
   * @param payment
   * @returns {{resulturl: String, returnurl: String, reference: String, amount: number, id: String, additionalinfo: String, authemail: String, status: String}}
   */
  buildMobile(
    payment: Payment,
    phone: string,
    method: string
  ): Error | { [key: string]: string } {
    let data: { [key: string]: string } = {
      resulturl: this.resultUrl ?? '',
      returnurl: this.returnUrl ?? '',
      reference: payment.reference,
      amount: payment.total().toString(),
      id: this.integrationId,
      additionalinfo: payment.info(),
      authemail: payment.authEmail ?? '',
      phone: phone,
      method: method,
      status: 'Message',
    };

    for (const key of Object.keys(data)) {
      if (key === 'hash') continue;

      data[key] = this.urlEncode(data[key]);
    }

    data['hash'] = this.generateHash(data, this.integrationKey);

    return data;
  }

  /**
   * Check the status of a transaction
   * @param url
   * @returns {PromiseLike<InitResponse> | Promise<InitResponse>}
   */
  pollTransaction(url: string) {
    return axios.post(url).then(res => {
      return this.parse(res.data);
    });
  }

  /**
   * Parses the response from Paynow
   * @param response
   * @returns {StatusResponse}
   */
  parseStatusUpdate(response: any) {
    if (response.length > 0) {
      response = this.parseQuery(response);

      if (!this.verifyHash(response)) {
        throw new Error('Hashes do not match!');
      }

      return new StatusResponse(response);
    } else {
      throw new Error('An unknown error occurred');
    }
  }

  /**
   * Validates an outgoing request before sending it to Paynow (data sanity checks)
   * @param payment
   */
  validate(payment: Payment) {
    if (payment.items.length() <= 0) {
      this.fail('You need to have at least one item in cart');
    }

    if (payment.total() <= 0) {
      this.fail('The total should be greater than zero');
    }
  }
}
