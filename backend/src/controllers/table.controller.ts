import { Request, Response, NextFunction } from 'express';
import { TableService } from '../services/table.service';

const tableService = new TableService();

export class TableController {
  async getAllTables(_req: Request, res: Response, next: NextFunction) {
    try {
      const tables = await tableService.getAllTables();
      res.json({
        success: true,
        data: tables,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getTableById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const table = await tableService.getTableById(id);
      res.json({
        success: true,
        data: table,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const updated = await tableService.updateTableStatus(
        id,
        req.body.status
      );
      res.json({
        success: true,
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
