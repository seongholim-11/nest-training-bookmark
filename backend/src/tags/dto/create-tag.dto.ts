import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'NestJS', description: '태그 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '#6366f1', description: '태그 색상 (HEX)', required: false })
  @IsString()
  @IsOptional()
  color?: string;
}
