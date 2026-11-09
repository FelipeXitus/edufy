import {
  BadRequestException,
  Body,
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
import { CurrentUser } from '@src/app/user/presentation/current-user.decorator';
import { EmailAddress } from '@src/libs/email/email-address';
import { EmailService } from '@src/libs/email/email.service';
import { parseUUIDWithMessage } from '@src/libs/validation/parse-uuid-with-message.pipe';
import { AgentEntity } from '../../domain/agent.entity';
import { ClientEntity } from '../../domain/client.entity';
import {
  ClientRepository,
  IClientRepository,
} from '../../domain/client.repository';
import { TicketStatus } from '@src/app/ticket/domain/ticket.status';
import { ReplyTicketDto } from '../dto/reply-ticket.dto';
import { CurrentAgent } from '../current-agent.decorator';

@Controller('support/agent')
export class AgentController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
    @Inject(ClientRepository)
    private readonly clientRepository: IClientRepository,
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
    const agent = AgentEntity.fromProps(user);
    try {
      agent.resolve(ticket);
    } catch (error) {
      if (error instanceof Error && error.cause === 'INVALID_TICKET_STATUS') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    await this.ticketRepository.save(ticket);
    const client = await this.clientRepository.findOneById(ticket.createdBy);
    if (!client) {
      throw new NotFoundException(`Creator of ticket with ID ${id} not found`);
    }
    await this.sendTicketResolvedEmail(client, ticket);
    return new TicketReadDto(ticket);
  }

  private async sendTicketResolvedEmail(
    to: ClientEntity,
    ticket: TicketEntity,
  ) {
    const emailAddress = new EmailAddress(to.email);
    await this.emailService.send({
      to: emailAddress,
      subject: `Ticket Resolvido: ${ticket.title}`,
      body: `O ticket "${ticket.title}" foi resolvido com sucesso por ${ticket.resolvedBy}.`,
    });
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('tickets/:id/reply')
  async reply(
    @Param('id', parseUUIDWithMessage('Invalid ticket ID format'))
    id: string,
    @Body() replyData: ReplyTicketDto,
    @CurrentAgent() agent: AgentEntity,
  ) {
    const ticket = await this.ticketRepository.findOneById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    if (ticket.status !== TicketStatus.Open) {
      throw new BadRequestException(
        `Ticket with ID ${id} is not open and cannot be replied to`,
      );
    }
    ticket.replies.push({
      content: replyData.content,
      createdBy: agent.id,
    });
    await this.ticketRepository.save(ticket);
  }
}
