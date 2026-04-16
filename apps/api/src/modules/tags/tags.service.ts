import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag, TagScope } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto, userId: string): Promise<Tag> {
    const tag = this.tagsRepository.create({
      ...createTagDto,
      scope: createTagDto.scope || TagScope.GLOBAL,
      ownerUserId: createTagDto.scope === TagScope.PRIVATE ? userId : null,
    });

    const saved = await this.tagsRepository.save(tag);
    this.logger.log(`Tag created: ${saved.name}`);
    return saved;
  }

  async findAllForUser(userId: string): Promise<Tag[]> {
    return this.tagsRepository.find({
      where: [
        { scope: TagScope.GLOBAL },
        { scope: TagScope.PRIVATE, ownerUserId: userId },
      ],
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    Object.assign(tag, updateTagDto);
    return this.tagsRepository.save(tag);
  }

  async softDelete(id: string): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagsRepository.softRemove(tag);
  }
}
