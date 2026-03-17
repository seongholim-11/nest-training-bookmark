import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto, userId: string) {
    const existingTag = await this.prisma.tag.findFirst({
      where: {
        name: createTagDto.name,
        userId: userId,
      },
    });
    if (existingTag) {
      throw new BadRequestException('이미 존재하는 태그입니다.');
    }

    return this.prisma.tag.create({
      data: {
        name: createTagDto.name,
        color: createTagDto.color,
        userId: userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.tag.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!tag) throw new NotFoundException('태그를 찾을 수 없습니다');

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto, userId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!tag) throw new NotFoundException('태그를 찾을 수 없습니다');

    return this.prisma.tag.update({
      where: {
        id: id,
        userId: userId,
      },
      data: {
        name: updateTagDto.name,
        color: updateTagDto.color,
      },
    });
  }

  async remove(id: string, userId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!tag) throw new NotFoundException('태그를 찾을 수 없습니다');

    return this.prisma.tag.delete({
      where: {
        id: id,
        userId: userId,
      },
    });
  }
}
