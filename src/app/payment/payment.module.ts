import { Module } from '@nestjs/common';
import { CourseModule } from '../course/course.module';
import { PurchaseConfirmedEventHandler } from './application/purchase-confirmed.event-handler';
import { PaymentWebhook } from './presentation/payment.webhook';
import { QueueModule } from '@src/libs/queue/queue.module';

@Module({
  imports: [CourseModule, QueueModule.registerQueue('enroll-student')],
  controllers: [PaymentWebhook],
  providers: [PurchaseConfirmedEventHandler],
})
export class PaymentModule {}
