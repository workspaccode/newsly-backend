import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Article, ArticleStatus } from '../entities/article.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async create(createArticleDto: CreateArticleDto, author: User): Promise<Article> {
    const { slug } = createArticleDto;

    // Check if article with same slug exists
    const existingArticle = await this.articleRepository.findOne({
      where: { slug },
    });

    if (existingArticle) {
      throw new ConflictException('Article with this slug already exists');
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = createArticleDto.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const article = this.articleRepository.create({
      ...createArticleDto,
      authorId: author.id,
      readingTime,
      publishedAt: createArticleDto.status === ArticleStatus.PUBLISHED ? new Date() : undefined,
    });

    const savedArticle = await this.articleRepository.save(article);
    return savedArticle;
  }

  async findAll(queryDto: QueryArticlesDto) {
    const { 
      page = 1, 
      limit = 20, 
      categoryId, 
      search, 
      sort = 'published_at', 
      order = 'DESC', 
      status, 
      authorId 
    } = queryDto;
    
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.category', 'category')
      .select([
        'article.id',
        'article.title',
        'article.slug',
        'article.excerpt',
        'article.coverImage',
        'article.status',
        'article.publishedAt',
        'article.readingTime',
        'article.views',
        'article.likeCount',
        'article.tags',
        'article.createdAt',
        'article.updatedAt',
        'author.id',
        'author.name',
        'author.username',
        'author.avatar',
        'category.id',
        'category.name',
        'category.slug',
      ]);

    // Apply filters
    if (status) {
      queryBuilder.andWhere('article.status = :status', { status });
    } else {
      // Default to published articles for public access
      queryBuilder.andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED });
    }

    if (categoryId) {
      queryBuilder.andWhere('article.categoryId = :categoryId', { categoryId });
    }

    if (authorId) {
      queryBuilder.andWhere('article.authorId = :authorId', { authorId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(article.title ILIKE :search OR article.content ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    const sortField = sort === 'published_at' ? 'article.publishedAt' : `article.${sort}`;
    queryBuilder.orderBy(sortField, order);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [articles, total] = await queryBuilder.getManyAndCount();

    return {
      articles,
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

  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'category'],
      select: {
        author: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
        },
        category: {
          id: true,
          name: true,
          slug: true,
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Increment views
    await this.articleRepository.increment({ id }, 'views', 1);
    article.views += 1;

    return article;
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { slug, status: ArticleStatus.PUBLISHED },
      relations: ['author', 'category'],
      select: {
        author: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
        },
        category: {
          id: true,
          name: true,
          slug: true,
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Increment views
    await this.articleRepository.increment({ id: article.id }, 'views', 1);
    article.views += 1;

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, user: User): Promise<Article> {
    const article = await this.findOne(id);

    // Check permissions
    if (article.authorId !== user.id && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('You can only update your own articles');
    }

    // Check if updating slug conflicts with existing articles
    if (updateArticleDto.slug && updateArticleDto.slug !== article.slug) {
      const existingArticle = await this.articleRepository.findOne({
        where: { slug: updateArticleDto.slug },
      });

      if (existingArticle && existingArticle.id !== id) {
        throw new ConflictException('Article with this slug already exists');
      }
    }

    // Update reading time if content changed
    if (updateArticleDto.content) {
      const wordCount = updateArticleDto.content.split(/\s+/).length;
      updateArticleDto['readingTime'] = Math.ceil(wordCount / 200);
    }

    // Update published date if status changed to published
    if (updateArticleDto.status === ArticleStatus.PUBLISHED && article.status !== ArticleStatus.PUBLISHED) {
      updateArticleDto['publishedAt'] = new Date();
    }

    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  async remove(id: string, user: User): Promise<void> {
    const article = await this.findOne(id);

    // Check permissions
    if (article.authorId !== user.id && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('You can only delete your own articles');
    }

    await this.articleRepository.remove(article);
  }

  async getTrending(limit: number = 10) {
    const articles = await this.articleRepository.find({
      where: { status: ArticleStatus.PUBLISHED },
      relations: ['author', 'category'],
      select: {
        author: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
        category: {
          id: true,
          name: true,
          slug: true,
        },
      },
      order: { views: 'DESC', likeCount: 'DESC' },
      take: limit,
    });

    return articles;
  }
}
