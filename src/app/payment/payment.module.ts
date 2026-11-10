import { Module } from '@nestjs/common';
import { PaymentWebhook } from './presentation/payment.webhook';
import { CourseModule } from '../course/course.module';
import { KyselyPurchaseRepository } from '../course/infrastructure/kysely.purchase-repository';

@Module({
  imports: [CourseModule],
  providers: [
    {
      provide: 'PurchaseRepository',
      useValue: KyselyPurchaseRepository,
    },
  ],
  controllers: [PaymentWebhook],
})
export class PaymentModule {}
