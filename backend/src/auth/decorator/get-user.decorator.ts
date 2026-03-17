import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * [Phase 2] 커스텀 유저 데코레이터
 * Request 객체(req.user)에 담긴 유저 정보나 토큰 정보를 간편하게 꺼내 쓸 수 있게 합니다.
 * 사용 예시: @GetUser('id') userId: string, @GetUser() user: any
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // 현재 실행 컨텍스트에서 Request 객체를 가져옵니다.
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 만약 @GetUser('email')처럼 인자가 있으면 해당 필드만, 없으면 전체 객체를 반환합니다.
    return data ? user?.[data] : user;
  },
);
