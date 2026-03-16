import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register.dto';
import { LoginAuthDto } from './dto/login.dto';

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

  /**
   * [Phase 2] 로그인 엔드포인트
   * 이메일과 비밀번호를 검증하고 성공 시 JWT Access Token을 발구합니다.
   */
  @Post('login')
  login(@Body() dto: LoginAuthDto) {
    return this.authService.login(dto);
  }
}
