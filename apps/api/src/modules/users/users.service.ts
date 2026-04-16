import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash,
      role: createUserDto.role || UserRole.USER,
    });

    const saved = await this.usersRepository.save(user);
    this.logger.log(`User created: ${saved.email}`);
    return saved;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
    this.logger.log(`User soft deleted: ${user.email}`);
  }

  async seedAdmin(): Promise<void> {
    const adminExists = await this.usersRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);

      const admin = this.usersRepository.create({
        name: 'Admin',
        email: 'admin@family.com',
        passwordHash,
        role: UserRole.ADMIN,
      });

      await this.usersRepository.save(admin);
      this.logger.log('Admin user seeded');
    }
  }
}
