import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('articles/:articleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a comment on an article' })
  @ApiParam({ name: 'articleId', description: 'Article ID to comment on' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Comment created successfully',
    schema: {
      example: {
        success: true,
        message: 'Comment created successfully',
        data: {
          id: 'uuid',
          content: 'This is a great article!',
          articleId: 'uuid',
          userId: 'uuid',
          parentId: null,
          likeCount: 0,
          createdAt: '2025-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async create(
    @Param('articleId') articleId: string,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    const comment = await this.commentsService.create(articleId, createCommentDto, user);
    return {
      success: true,
      message: 'Comment created successfully',
      data: comment,
    };
  }

  @Get('articles/:articleId')
  @ApiOperation({ summary: 'Get comments for an article' })
  @ApiParam({ name: 'articleId', description: 'Article ID to get comments for' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiResponse({ 
    status: 200, 
    description: 'Comments retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          comments: [
            {
              id: 'uuid',
              content: 'This is a great article!',
              likeCount: 5,
              createdAt: '2025-01-01T00:00:00.000Z',
              user: {
                id: 'uuid',
                name: 'John Doe',
                username: 'johndoe',
                avatar: null
              },
              replies: [
                {
                  id: 'uuid',
                  content: 'I agree!',
                  likeCount: 2,
                  createdAt: '2025-01-01T01:00:00.000Z',
                  user: {
                    id: 'uuid',
                    name: 'Jane Smith',
                    username: 'janesmith',
                    avatar: null
                  }
                }
              ]
            }
          ],
          pagination: {
            current_page: 1,
            total_pages: 3,
            total_items: 50,
            items_per_page: 20,
            has_next: true,
            has_prev: false
          }
        }
      }
    }
  })
  async findByArticle(
    @Param('articleId') articleId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.commentsService.findByArticle(articleId, page, limit);
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Comment retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          content: 'This is a great article!',
          likeCount: 5,
          createdAt: '2025-01-01T00:00:00.000Z',
          user: {
            id: 'uuid',
            name: 'John Doe',
            username: 'johndoe',
            avatar: null
          },
          article: {
            id: 'uuid',
            title: 'Sample Article',
            slug: 'sample-article'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(@Param('id') id: string) {
    const comment = await this.commentsService.findOne(id);
    return {
      success: true,
      data: comment,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Comment updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Comment updated successfully',
        data: {
          id: 'uuid',
          content: 'Updated comment content',
          likeCount: 5,
          updatedAt: '2025-01-01T02:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own comments' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    const comment = await this.commentsService.update(id, updateCommentDto, user);
    return {
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Comment deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Comment deleted successfully'
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only delete own comments' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.commentsService.remove(id, user);
    return {
      success: true,
      message: 'Comment deleted successfully',
    };
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get comments by user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiResponse({ 
    status: 200, 
    description: 'User comments retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          comments: [
            {
              id: 'uuid',
              content: 'This is a great article!',
              likeCount: 5,
              createdAt: '2025-01-01T00:00:00.000Z',
              article: {
                id: 'uuid',
                title: 'Sample Article',
                slug: 'sample-article'
              }
            }
          ],
          pagination: {
            current_page: 1,
            total_pages: 2,
            total_items: 25,
            items_per_page: 20,
            has_next: true,
            has_prev: false
          }
        }
      }
    }
  })
  async getUserComments(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.commentsService.getUserComments(userId, page, limit);
    return {
      success: true,
      data: result,
    };
  }
}
