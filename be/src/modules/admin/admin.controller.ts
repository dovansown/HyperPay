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
    const data = await adminService.updateUserRole(req.params.userId, req.body);
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
    const data = await adminService.updatePlan(req.params.id, req.body);
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
    const data = await adminService.updateBank(req.params.id, req.body);
    return sendSuccess(res, data);
  }

  async listPackages(req: Request, res: Response) {
    const data = await adminService.listPackages(req.query as unknown as AdminListQuery);
    return sendSuccess(res, data);
  }

  async createPackage(req: Request, res: Response) {
    const data = await adminService.createPackage(req.body);
    return sendSuccess(res, data, 201);
  }

  async updatePackage(req: Request, res: Response) {
    const data = await adminService.updatePackage(req.params.id, req.body);
    return sendSuccess(res, data);
  }

  async listDurations(_req: Request, res: Response) {
    const data = await adminService.listDurations();
    return sendSuccess(res, data);
  }

  async createDuration(req: Request, res: Response) {
    const data = await adminService.createDuration(req.body);
    return sendSuccess(res, data, 201);
  }

  async updateDuration(req: Request, res: Response) {
    const data = await adminService.updateDuration(req.params.id, req.body);
    return sendSuccess(res, data);
  }

  async deleteDuration(req: Request, res: Response) {
    const data = await adminService.deleteDuration(req.params.id);
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
    const data = await adminService.updateUserPackageStatus(req.params.id, req.body);
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

  async getSystemSettings(_req: Request, res: Response) {
    const data = await adminService.getSystemSettings();
    return sendSuccess(res, data);
  }

  async updateSystemSettings(req: Request, res: Response) {
    const data = await adminService.updateSystemSettings(req.body);
    return sendSuccess(res, data);
  }
}

export const adminController = new AdminController();
