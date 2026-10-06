import { Station } from '../../domain/station.ts';
import { bikeMovementRepositoryContract } from '../../testing/bikeMovementRepository.contract.ts';
import { inMemoryBikeMovementRepository } from './inMemoryBikeMovementRepository.ts';

bikeMovementRepositoryContract('inMemoryBikeMovementRepository', async () => inMemoryBikeMovementRepository([Station.of({ id: 'gare', docks: 1, bikes: ['b1'] })]));
