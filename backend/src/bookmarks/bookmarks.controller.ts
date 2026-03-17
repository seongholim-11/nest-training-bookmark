import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { GetUser } from '../auth/decorator/get-user.decorator';

@UseGuards(JwtAuthGuard) // 이 컨트롤러 전체에 적용
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  create(@Body() dto: CreateBookmarkDto, @GetUser('id') userId: string) {
    return this.bookmarksService.create(dto, userId);
  }

  @Get()
  findAll(
    @GetUser('id') userId: string,
    @Query('tag') tag?: string,
    @Query('q') query?: string,
    @Query('favorite') favorite?: string,
  ) {
    return this.bookmarksService.findAll(userId, {
      tag,
      query,
      favorite: favorite === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.bookmarksService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookmarkDto, @GetUser('id') userId: string) {
    return this.bookmarksService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.bookmarksService.remove(id, userId);
  }

  @Patch(':id/favorite')
  updateFavorite(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.bookmarksService.updateFavorite(id, userId);
  }
}
