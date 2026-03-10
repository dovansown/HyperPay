import { healthRepository } from "./health.repository.js";

export class HealthService {
  check() {
    return healthRepository.getStatus();
  }
}

export const healthService = new HealthService();
