import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService, SendEmailInput } from './email.service';
import { jest } from '@jest/globals';

describe('EmailService', () => {
  let service: EmailService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();
    service = module.get<EmailService>(EmailService);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('send', () => {
    it('should log the email recipient and subject', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'debug')
        .mockImplementation(() => {});
      const input: SendEmailInput = {
        to: 'usuario@exemplo.com',
        subject: 'Assunto de teste',
        body: 'Conteúdo do email',
      };
      await service.send(input);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Enviando email para usuario@exemplo.com com assunto: Assunto de teste',
      );
    });
  });
});
