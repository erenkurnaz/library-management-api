import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../database/user';

export const CurrentUser = createParamDecorator(
  (data: keyof User, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user: User = request.user;
    if (!user) return undefined;

    return data ? user[data] : user;
  },
);
