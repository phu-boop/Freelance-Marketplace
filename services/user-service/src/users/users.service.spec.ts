import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCompletionPercentage', () => {
    it('should calculate 100% for a complete freelancer profile', () => {
      const user = {
        roles: ['FREELANCER'],
        firstName: 'John',
        lastName: 'Doe',
        phone: '123456789',
        country: 'USA',
        title: 'Developer',
        overview: 'Bio',
        hourlyRate: 50,
        skills: ['React'],
      };
      // @ts-ignore - accessing private method for testing
      const percentage = service.calculateCompletionPercentage(user);
      expect(percentage).toBe(100);
    });

    it('should calculate 50% for a partially complete freelancer profile', () => {
      const user = {
        roles: ['FREELANCER'],
        firstName: 'John',
        lastName: 'Doe',
        phone: '123456789',
        country: 'USA',
        title: '',
        overview: '',
        hourlyRate: null,
        skills: [],
      };
      // @ts-ignore
      const percentage = service.calculateCompletionPercentage(user);
      // commonFields: 4/4 filled, freelancerFields: 0/4 filled. Total: 4/8 = 50%
      expect(percentage).toBe(50);
    });

    it('should calculate 100% for a complete client profile', () => {
      const user = {
        roles: ['CLIENT'],
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '987654321',
        country: 'UK',
        companyName: 'Tech Corp',
        industry: 'IT',
      };
      // @ts-ignore
      const percentage = service.calculateCompletionPercentage(user);
      // commonFields: 4/4, clientFields: 2/2. Total: 6/6 = 100%
      expect(percentage).toBe(100);
    });
  });
});
