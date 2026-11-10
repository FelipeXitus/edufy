import { Module } from '@nestjs/common';
import { PaymentWebhook } from './presentation/payment.webhook';
import { KyselyPurchaseRepository } from '../course/infrastructure/kysely.purchase-repository';
import { PurchaseConfirmedEventHandler } from './application/purchase-confirmed.event-handler';
import { PurchaseRepository } from '../course/domain/purchase.repository';

@Module({
  providers: [
    {
      provide: PurchaseRepository,
      useValue: KyselyPurchaseRepository,
    },
    PurchaseConfirmedEventHandler,
  ],
  controllers: [PaymentWebhook],
})
export class PaymentModule {}
