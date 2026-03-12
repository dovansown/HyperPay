import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/http/http-response.js";
import type { AdminListQuery } from "./admin.schema.js";
import { adminService } from "./admin.service.js";

export class AdminController {
  async listUsers(req: Request, res: Response) {
    const data = await adminService.listUsers(req.query as unknown as AdminListQuery);
    return sendSuccess(res, data);
  }

  async updateUserRole(req: Request, res: Response) {
    const data = await adminService.updateUserRole(Number(req.params.userId), req.body);
    return sendSuccess(res, data);
  }

  async listPlans(req: Request, res: Response) {
    const data = await adminService.listPlans(req.query as unknown as AdminListQuery);
    return sendSuccess(res, data);
  }

  async createPlan(req: Request, res: Response) {
    const data = await adminService.createPlan(req.body);
    return sendSuccess(res, data, 201);
  }

  async updatePlan(req: Request, res: Response) {
    const data = await adminService.updatePlan(Number(req.params.id), req.body);
    return sendSuccess(res, data);
  }

  async listBanks(req: Request, res: Response) {
    const data = await adminService.listBanks(req.query as unknown as AdminListQuery);
    return sendSuccess(res, data);
  }

  async createBank(req: Request, res: Response) {
    const data = await adminService.createBank(req.body);
    return sendSuccess(res, data, 201);
  }

  async updateBank(req: Request, res: Response) {
    const data = await adminService.updateBank(Number(req.params.id), req.body);
    return sendSuccess(res, data);
  }

  async listUserPackages(req: Request, res: Response) {
    const data = await adminService.listUserPackages(req.query as unknown as AdminListQuery);
    return sendSuccess(res, data);
  }

  async assignUserPackage(req: Request, res: Response) {
    const data = await adminService.assignUserPackage(req.body);
    return sendSuccess(res, data, 201);
  }

  async updateUserPackageStatus(req: Request, res: Response) {
    const data = await adminService.updateUserPackageStatus(Number(req.params.id), req.body);
    return sendSuccess(res, data);
  }

  async listWebhooks(req: Request, res: Response) {
    const data = await adminService.listWebhooks(req.query as unknown as AdminListQuery);
    return sendSuccess(res, data);
  }

  async listTransactions(req: Request, res: Response) {
    const data = await adminService.listTransactions(req.query as unknown as AdminListQuery);
    return sendSuccess(res, data);
  }
}

export const adminController = new AdminController();
