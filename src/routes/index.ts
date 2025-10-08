import { Router } from 'express';
import authRoutes from './auth.routes';
import orgunitRoutes from './orgunit.routes';
import periodRoutes from './period.routes';
import programRoutes from './program.routes';
import formRoutes from './form.routes';
import datasetRoutes from './dataset.routes';
import dataelementRoutes from './dataelement.routes';
import formmemberRoutes from './formmember.routes';
import datasetmemberRoutes from './datasetmember.routes';
import forminstanceRoutes from './forminstance.routes';
import forminstancevalueRoutes from './forminstancevalue.route';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/orgunits', orgunitRoutes);
router.use('/periods', periodRoutes);
router.use('/programs', programRoutes);
router.use('/forms', formRoutes);
router.use('/datasets', datasetRoutes);
router.use('/dataelements', dataelementRoutes);
router.use('/formmembers', formmemberRoutes);
router.use('/datasetmembers', datasetmemberRoutes);
router.use('/forminstances', forminstanceRoutes);
router.use('/forminstancevalues', forminstancevalueRoutes);

export default router;