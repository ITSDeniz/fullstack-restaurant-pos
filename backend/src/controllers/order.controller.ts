import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';

const orderService = new OrderService();

export class OrderController {
  async getActiveOrderByTable(req: Request, res: Response, next: NextFunction) {
    try {
      const tableId = req.params.tableId as string;
      const order = await orderService.getActiveOrderByTable(tableId);
      res.json({
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const order = await orderService.getOrderById(id);
      res.json({
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrAppendOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableId, items } = req.body;
      const order = await orderService.createOrAppendOrder(tableId, items);
      res.status(201).json({
        success: true,
        data: order,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateItemQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId as string;
      const itemId = req.params.itemId as string;
      const { quantity } = req.body;
      const updatedOrder = await orderService.updateOrderItemQuantity(
        orderId,
        itemId,
        quantity
      );
      res.json({
        success: true,
        data: updatedOrder,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async checkoutOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await orderService.checkoutOrder(id);
      res.json({
        success: true,
        message: 'Order checked out and paid successfully. Table is now available.',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await orderService.cancelOrder(id);
      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
