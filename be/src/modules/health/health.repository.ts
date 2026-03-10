export class HealthRepository {
  async getStatus() {
    return { status: "ok" };
  }
}

export const healthRepository = new HealthRepository();
