import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('likes')
@Controller('likes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('articles/:articleId')
  @ApiOperation({ summary: 'Like an article' })
  @ApiParam({ name: 'articleId', description: 'Article ID to like' })
  @ApiResponse({ 
    status: 201, 
    description: 'Article liked successfully',
    schema: {
      example: {
        success: true,
        message: 'Article liked successfully'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 409, description: 'Article already liked' })
  async likeArticle(
    @Param('articleId') articleId: string,
    @GetUser() user: User,
  ) {
    const result = await this.likesService.likeArticle(articleId, user.id);
    return {
      success: true,
      ...result,
    };
  }

  @Delete('articles/:articleId')
  @ApiOperation({ summary: 'Unlike an article' })
  @ApiParam({ name: 'articleId', description: 'Article ID to unlike' })
  @ApiResponse({ 
    status: 200, 
    description: 'Article unliked successfully',
    schema: {
      example: {
        success: true,
        message: 'Article unliked successfully'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Like not found' })
  async unlikeArticle(
    @Param('articleId') articleId: string,
    @GetUser() user: User,
  ) {
    const result = await this.likesService.unlikeArticle(articleId, user.id);
    return {
      success: true,
      ...result,
    };
  }

  @Get('my-likes')
  @ApiOperation({ summary: 'Get user liked articles' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiResponse({ 
    status: 200, 
    description: 'User liked articles retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          likes: [
            {
              id: 'uuid',
              title: 'Liked Article',
              slug: 'liked-article',
              excerpt: 'Article excerpt...',
              coverImage: 'https://example.com/image.jpg',
              publishedAt: '2025-01-01T00:00:00.000Z',
              readingTime: 5,
              views: 100,
              likeCount: 10
            }
          ],
          pagination: {
            current_page: 1,
            total_pages: 5,
            total_items: 100,
            items_per_page: 20,
            has_next: true,
            has_prev: false
          }
        }
      }
    }
  })
  async getUserLikes(
    @GetUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.likesService.getUserLikes(user.id, page, limit);
    return {
      success: true,
      data: result,
    };
  }

  @Get('articles/:articleId/check')
  @ApiOperation({ summary: 'Check if user liked an article' })
  @ApiParam({ name: 'articleId', description: 'Article ID to check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Like status retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          isLiked: true
        }
      }
    }
  })
  async checkIfUserLikedArticle(
    @Param('articleId') articleId: string,
    @GetUser() user: User,
  ) {
    const isLiked = await this.likesService.checkIfUserLikedArticle(articleId, user.id);
    return {
      success: true,
      data: { isLiked },
    };
  }
}
