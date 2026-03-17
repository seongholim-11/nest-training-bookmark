import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * [Phase 2] Access Token용 가드
 * Passport의 'jwt' 전략을 사용하여 엔드포인트를 보호합니다.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}