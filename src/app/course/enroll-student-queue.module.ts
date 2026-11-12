import { Module } from '@nestjs/common';
import { QueueModule } from '@src/libs/queue/queue.module';

@Module({
  imports: [QueueModule.registerQueue('enroll-student')],
  exports: [QueueModule],
})
export class EnrollStudentQueueModule {}
