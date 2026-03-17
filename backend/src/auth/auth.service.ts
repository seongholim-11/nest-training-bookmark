import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterAuthDto } from './dto/register.dto';
import { LoginAuthDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * [Phase 2] 회원가입 로직
   * 비밀번호를 Bcrypt로 해싱하여 안전하게 저장합니다.
   */
  async register(dto: RegisterAuthDto) {
    console.log(dto);

    const hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        nickname: dto.nickname,
      },
    });
  }

  /**
   * [Phase 2] 로그인 처리
   * 1. 사용자 존재 여부 및 비밀번호 대조
   * 2. Access 및 Refresh Token 발급
   * 3. Refresh Token 해시를 DB에 저장하여 세션 관리
   */
  async login(dto: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 두 종류의 토큰(AT, RT)을 생성합니다.
    const tokens = await this.getTokens(user.id, user.email);
    // 보안을 위해 리프레시 토큰의 해시값만 DB에 저장합니다.
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  /**
   * [Phase 2] 로그아웃 처리
   * DB의 hashedRt를 null로 만들어 해당 리프레시 토큰을 무효화합니다.
   */
  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null, // 이미 null이 아닌 경우에만 갱신 (서버 부하 감소)
        },
      },
      data: {
        hashedRt: null,
      },
    });
  }

  /**
   * [Phase 2] 리프레시 토큰을 이용한 토큰 재발급
   * @param userId RT 페이로드에서 추출한 유저 ID
   * @param rt 클라이언트가 전달한 실제 리프레시 토큰 문자열
   */
  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    // 유저가 없거나 이미 로그아웃된(hashedRt가 null인) 경우 거부
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    // 전달된 RT와 DB에 저장된 해시값이 일치하는지 대조
    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    // 검증 성공 시 새로운 토큰 세트 발급 (Token Rotation)
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  /**
   * [Phase 2] 리프레시 토큰 해시 저장 로직
   * DB에 저장할 때는 항상 해싱(bcrypt)을 수행하여 토큰 유출 시 피해를 방지합니다.
   */
  async updateRefreshTokenHash(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  /**
   * [Phase 2] Access Token 및 Refresh Token 통합 발급 함수
   */
  async getTokens(userId: string, email: string) {
    const [at, rt] = await Promise.all([
      // Access Token: 짧은 유무기간(15분), 매 요청 인증용
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
          expiresIn: this.configService.getOrThrow<StringValue>('JWT_EXPIRES_IN'),
        },
      ),
      // Refresh Token: 긴 유효기간(7일), 액세스 토큰 재발급용
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.getOrThrow<StringValue>(
            'JWT_REFRESH_EXPIRATION_TIME',
          ),
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

}
