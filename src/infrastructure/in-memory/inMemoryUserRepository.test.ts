import { userRepositoryContract } from '../../testing/userRepository.contract.ts';
import { inMemoryUserRepository } from './inMemoryUserRepository.ts';

userRepositoryContract('inMemoryUserRepository', async () => inMemoryUserRepository());
