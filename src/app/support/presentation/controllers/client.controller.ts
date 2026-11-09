import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  TicketRepository,
  ITicketRepository,
} from '@src/app/ticket/domain/ticket.repository';
import { CreateTicketDto } from '@src/app/support/presentation/dtos/create-ticket.dto';
import { TicketReadDto } from '@src/app/ticket/presentation/dto/ticket.read-dto';
import { ClientEntity } from '../../domain/client.entity';
import { CurrentClient } from '../current-client.decorator';

@Controller('support/client')
export class ClientController {
  constructor(
    @Inject(TicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  @Post('tickets')
  async create(
    @Body() ticket: CreateTicketDto,
    @CurrentClient() client: ClientEntity,
  ) {
    const newTicket = client.createTicket({
      title: ticket.title,
      description: ticket.description,
    });
    await this.ticketRepository.save(newTicket);
    return new TicketReadDto(newTicket);
  }
}
