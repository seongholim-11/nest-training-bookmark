import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBookmarkDto) {
    return this.prisma.bookmark.create({
      data: {
        ...dto,
        userId: 'admin',
      },
    });
  }

  findAll() {
    return this.prisma.bookmark.findMany();
  }

  findOne(id: string) {
    return this.prisma.bookmark.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, dto: UpdateBookmarkDto) {
    return this.prisma.bookmark.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.bookmark.delete({
      where: {
        id,
      },
    });
  }

async updateFavorite(id: string) {
  // 1. 현재 값 조회
  const bookmark = await this.prisma.bookmark.findUnique({
    where: { id },
  });

  if (!bookmark) throw new NotFoundException('북마크를 찾을 수 없습니다');

  // 2. 현재 값을 반전해서 업데이트
  return this.prisma.bookmark.update({
    where: { id },
    data: {
      isFavorite: !bookmark.isFavorite,
    },
  });
}
}
