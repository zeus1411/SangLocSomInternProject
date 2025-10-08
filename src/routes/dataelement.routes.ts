import { Router } from 'express';
import { DataElementController } from '../controllers/dataelement.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new DataElementController();

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', authMiddleware, (req, res) => controller.create(req, res));
router.put('/:id', authMiddleware, (req, res) => controller.update(req, res));
router.delete('/:id', authMiddleware, (req, res) => controller.delete(req, res));

export default router;