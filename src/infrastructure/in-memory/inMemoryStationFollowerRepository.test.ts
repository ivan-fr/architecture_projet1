import { stationFollowerRepositoryContract } from '../../testing/stationFollowerRepository.contract.ts';
import { inMemoryStationFollowerRepository } from './inMemoryStationFollowerRepository.ts';

stationFollowerRepositoryContract('inMemoryStationFollowerRepository', async () => inMemoryStationFollowerRepository());
