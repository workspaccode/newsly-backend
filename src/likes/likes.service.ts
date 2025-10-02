import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from '../entities/like.entity';
import { Article } from '../entities/article.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async likeArticle(articleId: string, userId: string) {
    // Check if article exists
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if user already liked this article
    const existingLike = await this.likeRepository.findOne({
      where: { articleId, userId },
    });

    if (existingLike) {
      throw new ConflictException('Article already liked');
    }

    // Create like
    const like = this.likeRepository.create({
      articleId,
      userId,
    });

    await this.likeRepository.save(like);

    // Update article like count
    await this.articleRepository.increment({ id: articleId }, 'likeCount', 1);

    return { message: 'Article liked successfully' };
  }

  async unlikeArticle(articleId: string, userId: string) {
    const like = await this.likeRepository.findOne({
      where: { articleId, userId },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.remove(like);

    // Update article like count
    await this.articleRepository.decrement({ id: articleId }, 'likeCount', 1);

    return { message: 'Article unliked successfully' };
  }

  async getUserLikes(userId: string, page: number = 1, limit: number = 20) {
    const [likes, total] = await this.likeRepository.findAndCount({
      where: { userId },
      relations: ['article', 'article.author', 'article.category'],
      select: {
        article: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          readingTime: true,
          views: true,
          likeCount: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      likes: likes.map(like => like.article),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1,
      },
    };
  }

  async checkIfUserLikedArticle(articleId: string, userId: string): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { articleId, userId },
    });

    return !!like;
  }
}
