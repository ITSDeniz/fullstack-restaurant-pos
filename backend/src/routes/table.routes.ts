import { Router } from 'express';
import { TableController } from '../controllers/table.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { updateTableStatusSchema } from '../schemas/validation.schemas';

const router = Router();
const controller = new TableController();

router.get('/', (req, res, next) => controller.getAllTables(req, res, next));
router.get('/:id', (req, res, next) => controller.getTableById(req, res, next));
router.patch(
  '/:id/status',
  validateRequest(updateTableStatusSchema),
  (req, res, next) => controller.updateStatus(req, res, next)
);

export default router;
