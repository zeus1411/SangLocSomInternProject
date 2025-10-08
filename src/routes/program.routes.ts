import { Router } from 'express';
import { ProgramController } from '../controllers/program.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new ProgramController();

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/:id/forms', (req, res) => controller.getWithForms(req, res));
router.post('/', authMiddleware, (req, res) => controller.create(req, res));
router.put('/:id', authMiddleware, (req, res) => controller.update(req, res));
router.delete('/:id', authMiddleware, (req, res) => controller.delete(req, res));

export default router;