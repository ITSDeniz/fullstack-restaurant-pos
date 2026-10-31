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

  async createTable(req: Request, res: Response, next: NextFunction) {
    try {
      const tableNumber = req.body?.tableNumber ? Number(req.body.tableNumber) : undefined;
      const newTable = await tableService.createTable(tableNumber);
      res.status(201).json({
        success: true,
        message: `Table #${newTable.tableNumber} created successfully`,
        data: newTable,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTable(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const deleted = await tableService.deleteTable(id);
      res.json({
        success: true,
        message: `Table #${deleted.tableNumber} deleted successfully`,
        data: deleted,
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
