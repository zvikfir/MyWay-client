import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindUserByIdDto } from './dto/find-user-by-id.dto';
import { FindUserByEmailDto } from './dto/find-user-by-email.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findUserById(findUserByIdDto: FindUserByIdDto): Promise<User> {
    return this.usersRepository.findOne(findUserByIdDto.id);
  }

  async findUserByEmail(findUserByEmailDto: FindUserByEmailDto): Promise<User> {
    return this.usersRepository.findOne({
      where: { email: findUserByEmailDto.email },
    });
  }
}
