import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBookmarkDto, userId: string) {
    return this.prisma.bookmark.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  findOne(id: string, userId: string) {
    return this.prisma.bookmark.findUnique({
      where: {
        id,
        userId,
      },
    });
  }

  update(id: string, dto: UpdateBookmarkDto, userId: string) {
    return this.prisma.bookmark.update({
      where: {
        id,
        userId,
      },
      data: dto,
    });
  }

  remove(id: string, userId: string) {
    return this.prisma.bookmark.delete({
      where: {
        id,
        userId,
      },
    });
  }

async updateFavorite(id: string, userId: string) {
  // 1. 현재 값 조회
  const bookmark = await this.prisma.bookmark.findUnique({
    where: { id },
  });

  if (!bookmark) throw new NotFoundException('북마크를 찾을 수 없습니다');

  // 2. 현재 값을 반전해서 업데이트
  return this.prisma.bookmark.update({
    where: { id, userId },
    data: {
      isFavorite: !bookmark.isFavorite,
    },
  });
}
}
