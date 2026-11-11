import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  IPurchaseRepository,
  PurchaseRepository,
} from '@src/app/course/domain/purchase.repository';
import { WebhookEventDto } from '@src/libs/webhook/webhook-event';
import { PurchaseConfirmedEvent } from '../domain/purchase-confirmed.event';
import { Queue } from '@src/libs/queue/queue.interface';
import { InjectQueue } from '@src/libs/queue/queue.decorators';

@Injectable()
export class PurchaseConfirmedEventHandler {
  constructor(
    @Inject(PurchaseRepository)
    private readonly purchaseRepository: IPurchaseRepository,
    @InjectQueue('enroll-student')
    private readonly enrollStudentQueue: Queue,
  ) {}

  @OnEvent('purchase.confirmed')
  async handlePurchaseConfirmed(event: WebhookEventDto): Promise<void> {
    const purchaseConfirmedEvent = new PurchaseConfirmedEvent(event);

    const purchase = await this.purchaseRepository.findById(
      purchaseConfirmedEvent.data.id,
    );

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    purchase.status = 'completed';
    purchase.confirmedAt = new Date(purchaseConfirmedEvent.timestamp);

    await this.purchaseRepository.save(purchase);

    console.log('Sending enroll-student job', {
      purchaseId: purchase.id,
      studentId: purchase.userId,
      courseId: purchase.courseId,
    });
    await this.enrollStudentQueue.addJob({
      purchaseId: purchase.id,
      studentId: purchase.userId,
      courseId: purchase.courseId,
    });
  }
}
