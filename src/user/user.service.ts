import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../core/entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(where: FindOneOptions<User>): Promise<User | null> {
    return await this.userRepository.findOne(where);
  }

  async create(
    registerDto: RegisterDto,
  ): Promise<[boolean, string, RegisterDto | null]> {
    const {
      email,
      password,
      phoneNumber,
      acceptTos,
      firstName,
      lastName,
      countryCode,
    } = registerDto;

    const parsedPhoneNumber = parsePhoneNumber(
      phoneNumber,
      countryCode as CountryCode,
    ).number;

    const isPhoneNumberAlreadyExist = await this.userRepository.findOne({
      where: { phoneNumber: parsedPhoneNumber },
    });

    if (isPhoneNumberAlreadyExist) {
      return [false, 'Phone number already exist.', null];
    }

    const user = this.userRepository.create({
      email,
      password,
      phoneNumber: parsedPhoneNumber,
      acceptTos,
      firstName,
      lastName,
    });
    await this.userRepository.save(user);
    return [true, 'User created successfully.', registerDto];
  }
}
