import { AppError, ErrorCodes } from "../../shared/http/app-error.js";
import { durationsRepository } from "./durations.repository.js";

export class DurationsService {
  list() {
    return durationsRepository.list().then((rows) =>
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        months: r.months,
        days: r.days,
        sort_order: r.sortOrder
      }))
    );
  }
}

export const durationsService = new DurationsService();
