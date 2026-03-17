import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookmarkDto {
  @ApiProperty({ example: 'https://nestjs.com', description: '북마크 URL' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'NestJS Framework', description: '북마크 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '서버 개발을 위한 프레임워크', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://nestjs.com/favicon.ico', required: false })
  @IsString()
  @IsOptional()
  faviconUrl?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @ApiProperty({ type: [String], example: ['tag-uuid-1', 'tag-uuid-2'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];
}