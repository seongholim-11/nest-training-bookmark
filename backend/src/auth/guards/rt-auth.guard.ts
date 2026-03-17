import { AuthGuard } from '@nestjs/passport';

/**
 * [Phase 2] Refresh Token용 가드
 * Passport의 'jwt-refresh' 전략을 사용하여 토큰 재발급 엔드포인트를 보호합니다.
 */
export class RtGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
