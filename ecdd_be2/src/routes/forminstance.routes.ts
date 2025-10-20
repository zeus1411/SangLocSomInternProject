import { Router } from 'express';
import { FormInstanceController } from '../controllers/forminstance.controller';
import { optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { formSubmissionRateLimiter } from '../middlewares/ratelimit.middleware';

const router = Router();
const controller = new FormInstanceController();

// Public routes - No authentication required
router.get('/', (req, res) => controller.getAllWithFilters(req, res));
router.get('/:id/value', (req, res) => controller.getValues(req, res));
router.get('/:id', (req, res) => controller.getComplete(req, res));

router.post('/', optionalAuthMiddleware, formSubmissionRateLimiter,(req, res) => controller.createWithValues(req, res));
router.put('/:id', optionalAuthMiddleware, formSubmissionRateLimiter,(req, res) => controller.updateWithValues(req, res));
router.delete('/:id', optionalAuthMiddleware, (req, res) => controller.delete(req, res));

export default router;