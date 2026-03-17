import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookmarkDto, userId: string) {
    const existingBookmark = await this.prisma.bookmark.findFirst({
      where: {
        url: dto.url,
        userId: userId,
      },
    });

    if (existingBookmark) {
      throw new BadRequestException('이미 존재하는 북마크입니다.');
    }

    const { tagIds, ...bookmarkData } = dto;

    const result = await this.prisma.bookmark.create({
      data: {
        ...bookmarkData,
        userId,
      },
    });

    if (tagIds && tagIds.length > 0) {
      await this.prisma.bookmarkTag.createMany({
        data: tagIds.map((tagId) => ({
          bookmarkId: result.id,
          tagId,
        })),
      });
    }

    return result;
  }

  async findAll(
    userId: string,
    filters?: { tag?: string; query?: string; favorite?: boolean },
  ) {
    const { tag, query, favorite } = filters || {};
    const where: any = { userId };

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag,
          },
        },
      };
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (favorite !== undefined) {
      where.isFavorite = favorite;
    }

    return this.prisma.bookmark.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
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

  // BookmarksService.update 예시
  async update(id: string, dto: UpdateBookmarkDto, userId: string) {
    const { tagIds, ...bookmarkData } = dto;

    // 1. 북마크 기본 정보 업데이트
    const updated = await this.prisma.bookmark.update({
      where: { id, userId },
      data: bookmarkData,
    });

    // 2. 태그 연결 처리 (tagIds가 넘어왔을 때만)
    if (tagIds) {
      // 기존 조인 테이블의 연결 데이터 삭제
      await this.prisma.bookmarkTag.deleteMany({ where: { bookmarkId: id } });

      // 새 연결 데이터 생성
      await this.prisma.bookmarkTag.createMany({
        data: tagIds.map((tagId) => ({
          bookmarkId: id,
          tagId: tagId,
        })),
      });
    }

    return updated;
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
