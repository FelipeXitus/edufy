import { OnEvent } from '@nestjs/event-emitter';
import { UUID } from 'crypto';
import { EnrollmentEntity } from '../domain/enrollment.entity';
import { Inject } from '@nestjs/common';
import {
  EnrollmentRepository,
  IEnrollmentRepository,
} from '../domain/enrollment.repository';

export interface PurchaseProcessedEvent {
  purchaseId: UUID;
  courseId: UUID;
  studentId: UUID;
}

export class PurchaseProcessedEventHandler {
  constructor(
    @Inject(EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  @OnEvent('payment.purchase.processed')
  async handlePurchaseProcessed(event: PurchaseProcessedEvent) {
    const enrollment = EnrollmentEntity.create({
      courseId: event.courseId,
      studentId: event.studentId,
    });
    await this.enrollmentRepository.save(enrollment);
  }
}
