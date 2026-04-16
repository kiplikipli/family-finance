import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tags')
@ApiBearerAuth()
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List tags' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.tagsService.findAllForUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tag' })
  async create(
    @Body() createTagDto: CreateTagDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.tagsService.create(createTagDto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a tag' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.tagsService.softDelete(id);
    return { message: 'Tag deleted' };
  }
}
