import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * [Phase 2] Access Token 검증 전략
 * Passport-JWT를 사용하여 HTTP 요청 헤더의 Bearer 토큰을 자동으로 검증합니다.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // Authorization: Bearer <token> 포맷에서 토큰을 추출합니다.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 토큰의 서명을 검증할 시크릿 키를 설정합니다.
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * 토큰 서명 및 만료 시간 검증이 성공하면 호출됩니다.
   * 반환된 객체는 Request 객체의 'user' 필드에 자동으로 할당됩니다. (req.user)
   */
  validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}