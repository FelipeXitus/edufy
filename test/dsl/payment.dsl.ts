import { PurchaseConfirmedEvent } from '@src/app/payment/domain/purchase-confirmed.event';
import { AbstractDSL } from './abstract.dsl';

export class PaymentDSL extends AbstractDSL {
  confirmPurchase(purchaseConfirmedEvent: PurchaseConfirmedEvent) {
    return this.req()
      .post(`/payments/webhook`)
      .set(this.headers)
      .send(purchaseConfirmedEvent);
  }
}
