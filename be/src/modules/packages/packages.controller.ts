import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import { packagesService } from "./packages.service.js";

export class PackagesController {
  async create(req: Request, res: Response) {
    const data = await packagesService.create(req.body);
    return sendSuccess(res, data, 201);
  }

  async list(_req: Request, res: Response) {
    const data = await packagesService.list();
    return sendSuccess(res, data);
  }

  async purchase(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { packageId } = req.params as { packageId: string };
    const { duration_id } = req.body as { duration_id: string };
    const data = await packagesService.purchase(userId, packageId, duration_id);
    return sendSuccess(res, data, 201);
  }

  /** List all active packages for the current user (can have multiple). */
  async myActive(req: Request, res: Response) {
    const userId = req.user!.userId;
    const data = await packagesService.myActivePackages(userId);
    return sendSuccess(res, data);
  }
}

export const packagesController = new PackagesController();
