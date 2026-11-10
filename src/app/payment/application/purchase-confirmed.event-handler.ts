import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { WebhookEventDto } from '@src/libs/webhook/webhook-event';
import { PurchaseConfirmedEvent } from '../domain/purchase-confirmed.event';
import { Inject } from '@nestjs/common';
import {
  IPurchaseRepository,
  PurchaseRepository,
} from '@src/app/course/domain/purchase.repository';

export class PurchaseConfirmedEventHandler {
  constructor(
    @Inject(PurchaseRepository)
    private readonly purchaseRepository: IPurchaseRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('purchase.confirmed')
  async handlePurchaseConfirmed(event: WebhookEventDto) {
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

    await this.eventEmitter.emitAsync('payment.purchase.processed', {
      purchaseId: purchase.id,
      studentId: purchase.userId,
      courseId: purchase.courseId,
    });
  }
}
