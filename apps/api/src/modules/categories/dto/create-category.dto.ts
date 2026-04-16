import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType, CategoryScope } from '../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food' })
  @IsString()
  name: string;

  @ApiProperty({ enum: CategoryType })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiPropertyOptional({ enum: CategoryScope, default: CategoryScope.GLOBAL })
  @IsOptional()
  @IsEnum(CategoryScope)
  scope?: CategoryScope;
}
