import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TagScope } from '../entities/tag.entity';

export class CreateTagDto {
  @ApiProperty({ example: 'groceries' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: TagScope, default: TagScope.GLOBAL })
  @IsOptional()
  @IsEnum(TagScope)
  scope?: TagScope;
}
