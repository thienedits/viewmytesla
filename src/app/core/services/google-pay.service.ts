import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
declare let google: any;

export interface ScriptModel {
    name: string;
    src: string;
    loaded: boolean;
}

/**
 *
 *
 * @export
 * @class GooglePayService
 */
@Injectable()
export class GooglePayService {
    /**
     *Define the version of the Google Pay API referenced when creating your
     * configuration
     *
     * @see {@link https://developers.google.com/pay/api/web/reference/object#PaymentDataRequest|apiVersion in PaymentDataRequest}
     *
     * @memberof GooglePayService
     */
    baseRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
    };

    /**
     *Card networks supported by your site and your gateway
     *
     * @see {@link https://developers.google.com/pay/api/web/reference/object#CardParameters|CardParameters}
     *
     * @memberof GooglePayService
     */
    allowedCardNetworks = ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'];

    allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];

    tokenizationSpecification = {
        type: 'PAYMENT_GATEWAY',
        parameters: {
            'gateway': 'example',
            'gatewayMerchantId': 'exampleGatewayMerchantId',
        }
    };

    baseCardPaymentMethod = {
        type: 'CARD',
        parameters: {
            allowedAuthMethods: this.allowedCardAuthMethods,
            allowedCardNetworks: this.allowedCardNetworks,
        }
    };

    cardPaymentMethod = Object.assign({}, this.baseCardPaymentMethod, {
        tokenizationSpecification: this.tokenizationSpecification,
    });

    paymentsClient = null;
    private _totalPrice = '5.00';

    constructor(
        @Inject(DOCUMENT) private document: any,
    ) {}

    /**
     * Configure your site's support for payment methods supported by the Google Pay
     * API.
     *
     * Each member of allowedPaymentMethods should contain only the required fields,
     * allowing reuse of this base request when determining a viewer's ability
     * to pay and later requesting a supported payment method
     *
     * @returns {object} Google Pay API version, payment methods supported by the site
     */
    getGoogleIsReadyToPayRequest() {
        return Object.assign(
            {}, this.baseRequest, {allowedPaymentMethods: [this.baseCardPaymentMethod]});
    }

    /**
     * Configure support for the Google Pay API
     *
     * @see {@link https://developers.google.com/pay/api/web/reference/object#PaymentDataRequest|PaymentDataRequest}
     * @returns {object} PaymentDataRequest fields
     */
    getGooglePaymentDataRequest() {
        const paymentDataRequest: any = Object.assign({}, this.baseRequest);
        paymentDataRequest.allowedPaymentMethods = [this.cardPaymentMethod];
        paymentDataRequest.transactionInfo = this.getGoogleTransactionInfo();
        paymentDataRequest.merchantInfo = {
            // @todo a merchant ID is available for a production environment after approval by
            // Google
            // See {@link
            // https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist|Integration
            // checklist}
            // merchantId: '01234567890123456789',
            merchantName: 'Example Merchant'
        };
        return paymentDataRequest;
    }

    /**
     * Return an active PaymentsClient or initialize
     *
     * @see {@link https://developers.google.com/pay/api/web/reference/client#PaymentsClient|PaymentsClient constructor}
     * @returns {google.payments.api.PaymentsClient} Google Pay API client
     */
    getGooglePaymentsClient() {
        if (this.paymentsClient === null) {
            this.paymentsClient = new google.payments.api.PaymentsClient({environment: 'TEST'});
        }
        return this.paymentsClient;
    }

    /**
     * Initialize Google PaymentsClient after Google-hosted JavaScript has loaded
     *
     * Display a Google Pay payment button after confirmation of the viewer's
     * ability to pay.
     */
    onGooglePayLoaded() {
        const paymentsClient = this.getGooglePaymentsClient();
        paymentsClient.isReadyToPay(this.getGoogleIsReadyToPayRequest())
            .then((response) => {
                if (response.result) {
                    this.createGooglePayButton();
                    // @todo prefetch payment data to improve performance after confirming site
                    // functionality prefetchGooglePaymentData();
                }
            })
            .catch((err) => {
                // show error in developer console for debugging
                console.error(err);
            });
    }

    /**
     * Add a Google Pay purchase button alongside an existing checkout button
     *
     * @see {@link https://developers.google.com/pay/api/web/reference/object#ButtonOptions|Button options}
     * @see {@link https://developers.google.com/pay/api/web/guides/brand-guidelines|Google Pay brand guidelines}
     */
    createGooglePayButton() {
        const that = this;
        const buttonClicked = this.onGooglePaymentButtonClicked;
        const paymentsClient = this.getGooglePaymentsClient();
        const button = paymentsClient.createButton({
            onClick: this.onGooglePaymentButtonClicked,
            buttonColor: 'white',
            buttonType: 'short',
        });
        return button;
    }

    /**
     * Provide Google Pay API with a payment amount, currency, and amount status
     *
     * @see {@link https://developers.google.com/pay/api/web/reference/object#TransactionInfo|TransactionInfo}
     * @returns {object} transaction info, suitable for use as transactionInfo property of PaymentDataRequest
     */
    getGoogleTransactionInfo() {
        return {
            currencyCode: 'USD',
            totalPriceStatus: 'FINAL',
            // set to cart total
            totalPrice: this.totalPrice,
        };
    }

    get totalPrice() {
        return this._totalPrice;
    }

    set totalPrice(price) {
        this._totalPrice = price;
    }

    /**
     * Prefetch payment data to improve performance
     *
     * @see {@link https://developers.google.com/pay/api/web/reference/client#prefetchPaymentData|prefetchPaymentData()}
     */
    prefetchGooglePaymentData() {
        const paymentDataRequest = this.getGooglePaymentDataRequest();
        // transactionInfo must be set but does not affect cache
        paymentDataRequest.transactionInfo = {
            totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
            currencyCode: 'USD'
        };
        const paymentsClient = this.getGooglePaymentsClient();
        paymentsClient.prefetchPaymentData(paymentDataRequest);
    }

    /**
     * Show Google Pay payment sheet when Google Pay payment button is clicked
     */
    onGooglePaymentButtonClicked =
        () => {
            const paymentDataRequest = this.getGooglePaymentDataRequest();
            paymentDataRequest.transactionInfo = this.getGoogleTransactionInfo();

            const paymentsClient = this.getGooglePaymentsClient();
            paymentsClient.loadPaymentData(paymentDataRequest)
                .then((paymentData) => {
                    console.log(paymentDataRequest);
                    // handle the response
                    this.processPayment(paymentData);
                })
                .catch((err) => {
                    // show error in developer console for debugging
                    console.error(err);
                });
        }

    /**
     * Process payment data returned by the Google Pay API
     *
     * @param {object} paymentData response from Google Pay API after user approves payment
     * @see {@link https://developers.google.com/pay/api/web/reference/object#PaymentData|PaymentData object reference}
     */
    processPayment(paymentData) {
        // show returned data in developer console for debugging
        console.log(paymentData);
        // @todo pass payment token to your gateway to process payment
        const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
    }
}
