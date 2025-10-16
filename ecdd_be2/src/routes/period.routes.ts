import { Router } from 'express';
import { PeriodController } from '../controllers/period.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new PeriodController();

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/active', (req, res) => controller.getActive(req, res));
router.get('/current', (req, res) => controller.getActive(req, res)); // Alias for /active
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', authMiddleware, (req, res) => controller.create(req, res));
router.put('/:id', authMiddleware, (req, res) => controller.update(req, res));
router.delete('/:id', authMiddleware, (req, res) => controller.delete(req, res));

export default router;