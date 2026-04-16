import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryScope } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      scope: createCategoryDto.scope || CategoryScope.GLOBAL,
      ownerUserId: createCategoryDto.scope === CategoryScope.PRIVATE ? userId : null,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.categoriesRepository.save(category);
    this.logger.log(`Category created: ${saved.name}`);
    return saved;
  }

  async findAllForUser(userId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: [
        { scope: CategoryScope.GLOBAL },
        { scope: CategoryScope.PRIVATE, ownerUserId: userId },
      ],
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    category.updatedBy = userId;
    return this.categoriesRepository.save(category);
  }

  async softDelete(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.softRemove(category);
  }
}
