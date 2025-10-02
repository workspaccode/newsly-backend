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
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../entities/user.entity';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
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
  async findAll(@Query() queryDto: QueryArticlesDto) {
    const result = await this.articlesService.findAll(queryDto);
    return {
      success: true,
      data: result,
    };
  }

  @Get('trending')
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
