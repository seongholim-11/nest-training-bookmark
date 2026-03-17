import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { Query } from '@nestjs/common';
import { Request } from 'express';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tags')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard) // 이 컨트롤러 전체에 적용
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto, @GetUser('id') userId: string) {
    return this.tagsService.create(createTagDto, userId);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.tagsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.tagsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @GetUser('id') userId: string,
  ) {
    return this.tagsService.update(id, updateTagDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.tagsService.remove(id, userId);
  }
}
