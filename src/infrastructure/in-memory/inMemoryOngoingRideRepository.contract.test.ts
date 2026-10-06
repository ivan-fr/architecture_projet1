import { ongoingRideRepositoryContract } from '../../testing/ongoingRideRepository.contract.ts';
import { inMemoryOngoingRideRepository } from './inMemoryOngoingRideRepository.ts';

ongoingRideRepositoryContract('inMemoryOngoingRideRepository', async () => inMemoryOngoingRideRepository());
