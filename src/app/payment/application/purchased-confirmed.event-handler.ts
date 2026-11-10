import { OnEvent } from '@nestjs/event-emitter';
import { WebhookEventDto } from '@src/libs/webhook/webhook-event';
import { PurchaseConfirmedEvent } from '../domain/purchase-confirmed.event';
import { Inject, NotFoundException } from '@nestjs/common';
import { EnrollmentEntity } from '@src/app/course/domain/enrollment.entity';
import {
  IPurchaseRepository,
  PurchaseRepository,
} from '@src/app/course/domain/purchase.repository';
import {
  EnrollmentRepository,
  IEnrollmentRepository,
} from '@src/app/course/domain/enrollment.repository';

export class PurchaseConfirmedEventHandler {
  constructor(
    @Inject(EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(PurchaseRepository)
    private readonly purchaseRepository: IPurchaseRepository,
  ) {}

  @OnEvent('purchase.confirmed')
  async handlePurchaseConfirmed(event: WebhookEventDto) {
    const purchaseConfirmedEvent = new PurchaseConfirmedEvent(event);
    const purchase = await this.purchaseRepository.findById(
      purchaseConfirmedEvent.data.id,
    );
    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }
    if (purchase.status === 'completed') {
      return;
    }

    purchase.status = 'completed';
    purchase.confirmedAt = new Date(purchaseConfirmedEvent.timestamp);

    await this.purchaseRepository.save(purchase);

    const enrollment = EnrollmentEntity.create({
      courseId: purchase.courseId,
      studentId: purchase.userId,
    });
    await this.enrollmentRepository.save(enrollment);
  }
}
