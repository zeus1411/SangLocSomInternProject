const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { formController } = require('../controllers/all_crud_controllers');

router.get('/', formController.getAll);
router.get('/:id', formController.getById);
router.post('/', authMiddleware, formController.create);
router.put('/:id', authMiddleware, formController.update);
router.delete('/:id', authMiddleware, formController.remove);

module.exports = router;