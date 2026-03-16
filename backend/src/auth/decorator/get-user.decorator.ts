import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 데이터인자가 있으면 (예: @GetUser('id')) 해당 필드만 반환하고, 없으면 유저 객체 전체를 반환합니다.
    return data ? user?.[data] : user;
  },
);
