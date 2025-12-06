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
let user: User;

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
  user = {
    id: 1,
    email: 'adebayo.adesegun@mail.com',
    password: 'password',
    phoneNumber: '08136018029',
    firstName: 'Adesegun',
    lastName: 'Adebayo',
  } as User;
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
      .mockResolvedValue(user);

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

describe('find a user', () => {
  it('should find a user', async () => {
    const userRespositoryFindOneSpy = jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValue(user);

    const findUser = await userService.findOne({ where: { id: 1 } });
    expect(findUser).toBeDefined();
    userRespositoryFindOneSpy.mockReset();
  });

  it('should return null if user does not exist', async () => {
    const userRespositoryFindOneSpy = jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValue(null);

    const findUser = await userService.findOne({ where: { id: 1 } });
    expect(findUser).toBeNull();
    userRespositoryFindOneSpy.mockReset();
  });
});

describe('updatePassword', () => {
  it('should update user password and set passwordChangedAt', async () => {
    const userId = 1;
    const newPassword = 'NewPassword123!';
    const mockUser = {
      id: userId,
      password: 'OldPassword',
      passwordChangedAt: null,
    } as User;

    const findOneSpy = jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValue(mockUser);
    const saveSpy = jest
      .spyOn(userRepository, 'save')
      .mockResolvedValue(mockUser);

    await userService.updatePassword(userId, newPassword);

    expect(findOneSpy).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(mockUser.password).toBe(newPassword);
    expect(mockUser.passwordChangedAt).toBeInstanceOf(Date);
    expect(saveSpy).toHaveBeenCalledWith(mockUser);

    findOneSpy.mockReset();
    saveSpy.mockReset();
  });

  it('should throw error if user not found', async () => {
    const userId = 999;
    const newPassword = 'NewPassword123!';

    const findOneSpy = jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValue(null);

    await expect(
      userService.updatePassword(userId, newPassword),
    ).rejects.toThrow('User not found');

    findOneSpy.mockReset();
  });
});
