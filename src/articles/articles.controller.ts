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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../entities/user.entity';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new article' })
  @ApiBody({ type: CreateArticleDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Article created successfully',
    schema: {
      example: {
        success: true,
        message: 'Article created successfully',
        data: {
          id: 'uuid',
          title: 'Sample Article',
          slug: 'sample-article',
          content: 'Article content...',
          status: 'draft',
          authorId: 'uuid',
          createdAt: '2025-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Editor role required' })
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @GetUser() user: User,
  ) {
    const article = await this.articlesService.create(createArticleDto, user);
    return {
      success: true,
      message: 'Article created successfully',
      data: article,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all published articles with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title and content' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field', example: 'published_at' })
  @ApiQuery({ name: 'order', required: false, description: 'Sort order', example: 'DESC' })
  @ApiResponse({ 
    status: 200, 
    description: 'Articles retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          articles: [
            {
              id: 'uuid',
              title: 'Sample Article',
              slug: 'sample-article',
              excerpt: 'Article excerpt...',
              coverImage: 'https://example.com/image.jpg',
              status: 'published',
              publishedAt: '2025-01-01T00:00:00.000Z',
              readingTime: 5,
              views: 100,
              likeCount: 10,
              tags: ['tech', 'news'],
              author: {
                id: 'uuid',
                name: 'John Doe',
                username: 'johndoe',
                avatar: null
              },
              category: {
                id: 'uuid',
                name: 'Technology',
                slug: 'technology'
              }
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
  async findAll(@Query() queryDto: QueryArticlesDto) {
    const result = await this.articlesService.findAll(queryDto);
    return {
      success: true,
      data: result,
    };
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending articles' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of articles to return', example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Trending articles retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          articles: [
            {
              id: 'uuid',
              title: 'Trending Article',
              slug: 'trending-article',
              excerpt: 'Article excerpt...',
              views: 1000,
              likeCount: 50,
              author: {
                id: 'uuid',
                name: 'John Doe',
                username: 'johndoe'
              }
            }
          ]
        }
      }
    }
  })
  async getTrending(@Query('limit') limit?: number) {
    const articles = await this.articlesService.getTrending(limit);
    return {
      success: true,
      data: { articles },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const article = await this.articlesService.findOne(id);
    return {
      success: true,
      data: article,
    };
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const article = await this.articlesService.findBySlug(slug);
    return {
      success: true,
      data: article,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @GetUser() user: User,
  ) {
    const article = await this.articlesService.update(id, updateArticleDto, user);
    return {
      success: true,
      message: 'Article updated successfully',
      data: article,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.articlesService.remove(id, user);
    return {
      success: true,
      message: 'Article deleted successfully',
    };
  }
}
