import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Authorization: Bearer 토큰에서 꺼냄
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),     // 토큰 서명 검증용 시크릿
    });
  }

  // 토큰이 유효하면 여기서 반환한 값이 req.user에 들어감
  validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}