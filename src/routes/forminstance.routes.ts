import { Router } from 'express';
import { FormInstanceController } from '../controllers/forminstance.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new FormInstanceController();

router.get('/', (req, res) => controller.getAllWithFilters(req, res));
router.get('/:id', (req, res) => controller.getComplete(req, res));
router.post('/', authMiddleware, (req, res) => controller.createWithValues(req, res));
router.put('/:id', authMiddleware, (req, res) => controller.updateWithValues(req, res));
router.delete('/:id', authMiddleware, (req, res) => controller.delete(req, res));

export default router;