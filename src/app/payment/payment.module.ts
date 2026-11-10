import { Module } from '@nestjs/common';
import { PaymentWebhook } from './presentation/payment.webhook';
import { CourseModule } from '../course/course.module';
import { KyselyPurchaseRepository } from '../course/infrastructure/kysely.purchase-repository';
import { PurchaseConfirmedEventHandler } from './application/purchased-confirmed.event-handler';

@Module({
  imports: [CourseModule],
  providers: [
    {
      provide: 'PurchaseRepository',
      useValue: KyselyPurchaseRepository,
    },
    PurchaseConfirmedEventHandler,
  ],
  controllers: [PaymentWebhook],
})
export class PaymentModule {}
