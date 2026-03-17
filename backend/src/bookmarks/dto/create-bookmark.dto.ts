import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';

export class CreateBookmarkDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  faviconUrl?: string;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];
}