import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAuthDto {
  @ApiProperty({ example: 'user@example.com', description: '사용자 이메일' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호 (최소 6자)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '홍길동', description: '닉네임' })
  @IsString()
  @IsNotEmpty()
  nickname: string;
}
