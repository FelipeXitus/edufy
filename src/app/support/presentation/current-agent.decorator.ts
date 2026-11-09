import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AgentEntity } from '../domain/agent.entity';

export const CurrentAgent = createParamDecorator(
  (_data: never, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return AgentEntity.fromProps(request.user);
  },
);
