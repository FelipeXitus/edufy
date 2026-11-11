import { Inject, Injectable } from '@nestjs/common';
import { UUID } from 'node:crypto';
import {
  EnrollmentRepository,
  IEnrollmentRepository,
} from '../domain/enrollment.repository';
import { EnrollmentEntity } from '../domain/enrollment.entity';
import { JobWorker } from '@src/libs/queue/job-worker';
import { Job } from 'pg-boss';
import { Processor } from '@src/libs/queue/queue.decorators';

export interface EnrollStudentJob {
  purchaseId: UUID;
  courseId: UUID;
  studentId: UUID;
}
@Processor('enroll-student')
@Injectable()
export class EnrollStudentProcessor extends JobWorker {
  constructor(
    @Inject(EnrollmentRepository)
    private readonly enrollmentRepository: IEnrollmentRepository,
  ) {
    super();
  }

  async process(job: Job<EnrollStudentJob>): Promise<any> {
    const enrollment = EnrollmentEntity.create({
      courseId: job.data.courseId,
      studentId: job.data.studentId,
    });

    await this.enrollmentRepository.save(enrollment);
  }
}
