import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { IsUserEmailAlreadyExist } from './validator/is-user-email-already-exist.validator';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../core/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';

export class UserRepositoryFake {
  public create(): void {}
  public async save(): Promise<void> {}
  public async remove(): Promise<void> {}
  public async findOne(): Promise<void> {}
}

let userService: UserService;
let userRepository: Repository<User>;

beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UserService,
      {
        provide: getRepositoryToken(User),
        useClass: UserRepositoryFake,
      },
      IsUserEmailAlreadyExist,
    ],
  }).compile();

  userService = module.get<UserService>(UserService);
  userRepository = module.get(getRepositoryToken(User));
});

describe('create a user', () => {
  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should not create user if phone number exists', async () => {
    const registrationDto = {
      email: 'adebayo.adesegun@mail.com',
      password: 'password',
      phoneNumber: '08136018029',
      acceptTos: true,
      firstName: 'Adebayo',
      lastName: 'Adesegun',
      countryCode: 'NG',
    } as RegisterDto;

    const userRespositoryFindOneSpy = jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValue({
        id: 1,
        email: 'adebayo.adesegun@mail.com',
        password: 'password',
        phoneNumber: '08136018029',
        firstName: 'Adesegun',
        lastName: 'Adebayo',
      } as User);

    const [success, message] = await userService.create(registrationDto);
    expect(success).toBe(false);
    expect(message).toBe('Phone number already exist.');
    userRespositoryFindOneSpy.mockReset();
  });

  it('should create a user', async () => {
    const registrationDto = {
      email: 'adebayo.adesegun@mail.com',
      password: 'password',
      phoneNumber: '08136018029',
      acceptTos: true,
      firstName: 'Adebayo',
      lastName: 'Adesegun',
      countryCode: 'NG',
    } as RegisterDto;

    const userRespositoryFindOneSpy = jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValue(null);

    const [success, message, user] = await userService.create(registrationDto);
    expect(success).toBe(true);
    expect(message).toBe('User created successfully.');
    expect(user).toEqual(registrationDto);
    userRespositoryFindOneSpy.mockReset();
  });
});
