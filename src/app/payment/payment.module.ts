import { Module } from '@nestjs/common';
import { CourseModule } from '../course/course.module';
import { PurchaseConfirmedEventHandler } from './application/purchase-confirmed.event-handler';
import { PaymentWebhook } from './presentation/payment.webhook';

@Module({
  imports: [CourseModule],
  controllers: [PaymentWebhook],
  providers: [PurchaseConfirmedEventHandler],
})
export class PaymentModule {}
