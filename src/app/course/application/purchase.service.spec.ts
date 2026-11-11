import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '@src/app/user/domain/user.entity';
import { randomUUID } from 'node:crypto';

import { CourseEntity } from '../domain/course.entity';
import { PurchaseHistoryQuery } from '../domain/purchase-history.query';
import { PurchaseRepository } from '../domain/purchase.repository';
import { InMemoryPurchaseRepository } from '../infrastructure/in-memory.purchase-repository';
import { PaymentGateway } from './payment.gateway';
import { PaymentGatewaySpy } from './payment.gateway.spy';
import { PurchaseService } from './purchase.service';

describe('PurchaseService', () => {
  let testingModule: TestingModule;
  let service: PurchaseService;
  let paymentGateway: PaymentGatewaySpy;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        PurchaseService,
        {
          provide: PurchaseRepository,
          useClass: InMemoryPurchaseRepository,
        },
        {
          provide: PurchaseHistoryQuery,
          useExisting: PurchaseRepository,
        },
        {
          provide: PaymentGateway,
          useClass: PaymentGatewaySpy,
        },
      ],
    }).compile();

    service = testingModule.get(PurchaseService);
    paymentGateway = testingModule.get<PaymentGatewaySpy>(PaymentGateway);
  });

  describe('processPurchase', () => {
    test('creates a payment intent in the payment gateway', async () => {
      // Arrange
      const student = UserEntity.create({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'password123',
        role: 'student',
      });

      const instructor = UserEntity.create({
        name: 'Jane',
        email: 'jane@doe.com',
        password: 'password123',
        role: 'instructor',
      });

      const course = CourseEntity.create({
        title: 'Test Course',
        description: 'This is a test course',
        price: 100,
        id: randomUUID(),
        instructorId: instructor.id,
      });

      // Act
      await service.processPurchase({
        course,
        user: student,
      });

      // Assert
      paymentGateway
        .shouldHaveCreatedNumberOfPayments(1)
        .withAmount(100)
        .withCurrency('BRL');
    });
  });
});
