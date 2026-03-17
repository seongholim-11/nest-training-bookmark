import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register.dto';
import { LoginAuthDto } from './dto/login.dto';
import { GetUser } from './decorator/get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RtGuard } from './guards/rt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * [Phase 2] 회원가입 엔드포인트
   * 클라이언트로부터 받은 유저 정보를 AuthService에 전달하여 새로운 사용자를 생성합니다.
   */
  @Post('register')
  register(@Body() dto: RegisterAuthDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginAuthDto) {
    return this.authService.login(dto);
  }

  /**
   * [Phase 2] 로그아웃 엔드포인트
   * 현재 로그인된 사용자의 리프레시 토큰을 무효화합니다.
   * Access Token 검증(@UseGuards(JwtAuthGuard))이 필요합니다.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  /**
   * [Phase 2] 토큰 재발급 엔드포인트
   * 유효한 리프레시 토큰을 통해 새로운 토큰 쌍(AT, RT)을 발급받습니다.
   * Refresh Token 전용 가드(@UseGuards(RtGuard))를 사용합니다.
   */
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @GetUser('sub') userId: string,
    @GetUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
