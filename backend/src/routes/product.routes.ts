import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../schemas/validation.schemas';

const router = Router();
const controller = new ProductController();

router.get('/', (req, res, next) => controller.getAllProducts(req, res, next));
router.get('/:id', (req, res, next) => controller.getProductById(req, res, next));
router.post(
  '/',
  validateRequest(createProductSchema),
  (req, res, next) => controller.createProduct(req, res, next)
);
router.patch(
  '/:id',
  validateRequest(updateProductSchema),
  (req, res, next) => controller.updateProduct(req, res, next)
);
router.delete('/:id', (req, res, next) => controller.softDeleteProduct(req, res, next));

export default router;
