import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Bookmark } from './bookmark.entity';
import { Like } from './like.entity';
import { Comment } from './comment.entity';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  readingTime: number; // in minutes

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  publishAt: Date; // Scheduled publish time

  @CreateDateColumn()

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.articles)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Category, (category) => category.articles, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.article)
  bookmarks: Bookmark[];

  @OneToMany(() => Like, (like) => like.article)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];
}
