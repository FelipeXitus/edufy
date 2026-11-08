import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { TicketEntity } from '@src/app/ticket/domain/ticket.entity';
import {
  TicketRepository,
  ITicketRepository,
} from '@src/app/ticket/domain/ticket.repository';
import { TicketReadDto } from '@src/app/ticket/presentation/dto/ticket.read-dto';
import { UserEntity } from '@src/app/user/domain/user.entity';
import {
  UserRepository,
  IUserRepository,
} from '@src/app/user/domain/user.repository';
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { EmailAddress } from '@src/libs/email/email-address';
import { EmailService } from '@src/libs/email/email.service';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';

@Controller('support/agent')
export class AgentController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly emailService: EmailService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('tickets/:id/resolve')
  async resolve(
    @Param('id', parseUUIDWithMessage('Invalid ticket ID format'))
    id: string,
    @CurrentUser() user: UserEntity,
  ) {
    if (user.role !== 'support_agent') {
      throw new ForbiddenException(
        'You do not have permission to resolve this ticket',
      );
    }
    const ticket = await this.ticketRepository.findOneById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    if (ticket.status !== 'open') {
      throw new BadRequestException(
        `Ticket with ID ${id} is not open and cannot be resolved`,
      );
    }
    ticket.status = 'closed';
    ticket.resolvedBy = user.id;
    await this.ticketRepository.save(ticket);
    const creator = await this.userRepository.findOneById(ticket.createdBy);
    if (!creator) {
      throw new NotFoundException(`Creator of ticket with ID ${id} not found`);
    }
    await this.sendTicketResolvedEmail(creator, ticket);
    return new TicketReadDto(ticket);
  }

  private async sendTicketResolvedEmail(to: UserEntity, ticket: TicketEntity) {
    const emailAddress = new EmailAddress(to.email);
    await this.emailService.send({
      to: emailAddress,
      subject: `Ticket Resolvido: ${ticket.title}`,
      body: `O ticket "${ticket.title}" foi resolvido com sucesso por ${ticket.resolvedBy}.`,
    });
  }
}
