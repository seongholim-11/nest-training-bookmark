import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * [Phase 2] Refresh Token 검증 전략
 * 유효기간이 긴 리프레시 토큰의 서명을 검증하고, DB 대조를 위해 원본 토큰을 추출합니다.
 */
@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      // true로 설정하면 validate 함수의 첫 번째 인자로 Request 객체가 전달됩니다.
      passReqToCallback: true,
    });
  }

  /**
   * RT 검증 시에는 페이로드뿐만 아니라 클라이언트가 보낸 'Raw Token'이 필요합니다.
   * 그래야 DB에 저장된 해시값과 bcrypt.compare를 할 수 있기 때문입니다.
   */
  validate(req: Request, payload: { sub: string; email: string }) {
    const authHeader = req.get('authorization');
    if (!authHeader) return null;

    // 헤더에서 'Bearer ' 뒤의 토큰 문자열만 추출합니다.
    const refreshToken = authHeader.replace('Bearer', '').trim();

    // 반환된 객체는 req.user에 할당됩니다. 이후 @GetUser()로 꺼내 쓸 수 있습니다.
    return {
      ...payload,
      refreshToken,
    };
  }
}
