import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';

const router = Router();
const controller = new CategoryController();

router.get('/', (req, res, next) => controller.getAllCategories(req, res, next));

export default router;
