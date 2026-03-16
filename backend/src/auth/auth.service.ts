import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register.dto';
import { LoginAuthDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
   * [Phase 2] 로그인 및 유저 인증 로직
   * 1. 이메일 존재 확인 -> 2. 비밀번호 일치 확인 -> 3. 토큰 발급
   */
  async login(dto: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // 보안을 위해 유저가 없거나 비밀번호가 틀린 경우 동일한 예외를 던집니다.
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

    // 이제 ID와 Email을 같이 보냅니다.
    return this.signToken(user.id, user.email);
  }

  /**
   * [Phase 2] JWT 토큰 발행 헬퍼 함수
   * 유저의 고유 ID(sub)와 이메일을 페이로드(Payload)에 담아 서명합니다.
   */
  async signToken(userId: string, email: string) {
    const payload = {
      sub: userId, // 표준 규격 준수
      email,
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
    };
  }
}
