import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UUID } from 'node:crypto';
import {
  EnrollmentRepository,
  IEnrollmentRepository,
} from '../domain/enrollment.repository';
import { EnrollmentEntity } from '../domain/enrollment.entity';

export interface PurchaseProcessedEvent {
  purchaseId: UUID;
  courseId: UUID;
  studentId: UUID;
}

@Injectable()
export class PurchaseProcessedEventHandler {
  constructor(
    @Inject(EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  @OnEvent('payment.purchase.processed')
  async handlePurchaseProcessed(event: PurchaseProcessedEvent): Promise<void> {
    const enrollment = EnrollmentEntity.create({
      courseId: event.courseId,
      studentId: event.studentId,
    });

    await this.enrollmentRepository.save(enrollment);
  }
}
