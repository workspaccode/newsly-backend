import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This is a great article! Thanks for sharing.',
    description: 'Comment content',
    minLength: 1
  })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({
    example: 'uuid-of-parent-comment',
    description: 'Parent comment ID for replies (optional)',
    required: false
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
