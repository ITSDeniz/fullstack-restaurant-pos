import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createOrderSchema,
  updateOrderItemSchema,
} from '../schemas/validation.schemas';

const router = Router();
const controller = new OrderController();

router.get('/active/table/:tableId', (req, res, next) =>
  controller.getActiveOrderByTable(req, res, next)
);
router.get('/:id', (req, res, next) => controller.getOrderById(req, res, next));
router.post(
  '/',
  validateRequest(createOrderSchema),
  (req, res, next) => controller.createOrAppendOrder(req, res, next)
);
router.patch(
  '/:orderId/items/:itemId',
  validateRequest(updateOrderItemSchema),
  (req, res, next) => controller.updateItemQuantity(req, res, next)
);
router.post('/:id/checkout', (req, res, next) =>
  controller.checkoutOrder(req, res, next)
);
router.post('/:id/cancel', (req, res, next) =>
  controller.cancelOrder(req, res, next)
);

export default router;
