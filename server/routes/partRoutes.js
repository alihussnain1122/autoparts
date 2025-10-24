// routes/partRoutes.js
import express from 'express';
import partController from '../controllers/partController.js';

const router = express.Router();

router.post('/', partController.addPart);
router.get('/', partController.getParts);
router.get('/:id', partController.getPartById);
router.put('/:id', partController.updatePart);
router.delete('/:id', partController.deletePart);

export default router;
