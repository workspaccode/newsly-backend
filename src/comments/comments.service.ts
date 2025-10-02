import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Article } from '../entities/article.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async create(articleId: string, createCommentDto: CreateCommentDto, user: User) {
    // Check if article exists
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // If it's a reply, check if parent comment exists
    if (createCommentDto.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentId, articleId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      articleId,
      userId: user.id,
    });

    return await this.commentRepository.save(comment);
  }

  async findByArticle(articleId: string, page: number = 1, limit: number = 20) {
    // Get top-level comments (no parent)
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { 
        articleId, 
        parentId: IsNull(), // Only top-level comments
        isActive: true 
      },
      relations: ['user', 'replies', 'replies.user'],
      select: {
        user: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
        replies: {
          id: true,
          content: true,
          likeCount: true,
          createdAt: true,
          user: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      comments,
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

  async findOne(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'article'],
      select: {
        user: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
        article: {
          id: true,
          title: true,
          slug: true,
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: User) {
    const comment = await this.findOne(id);

    // Check permissions
    if (comment.userId !== user.id && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('You can only update your own comments');
    }

    Object.assign(comment, updateCommentDto);
    return await this.commentRepository.save(comment);
  }

  async remove(id: string, user: User) {
    const comment = await this.findOne(id);

    // Check permissions
    if (comment.userId !== user.id && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Soft delete by setting isActive to false
    comment.isActive = false;
    await this.commentRepository.save(comment);
  }

  async getUserComments(userId: string, page: number = 1, limit: number = 20) {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { userId, isActive: true },
      relations: ['article'],
      select: {
        article: {
          id: true,
          title: true,
          slug: true,
        },
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      comments,
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
}
