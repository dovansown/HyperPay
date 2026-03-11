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
    const { packageId } = req.params as unknown as { packageId: number };
    const data = await packagesService.purchase(userId, packageId);
    return sendSuccess(res, data, 201);
  }

  async myActive(req: Request, res: Response) {
    const userId = req.user!.userId;
    const data = await packagesService.myActivePackage(userId);
    return sendSuccess(res, data);
  }
}

export const packagesController = new PackagesController();
