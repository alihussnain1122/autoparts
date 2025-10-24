// routes/stockRoutes.js
import express from 'express';
import stockController from '../controllers/stockController.js';

const router = express.Router();

router.get('/', stockController.getAllStock);
router.get('/:id', stockController.getStockById);
router.put('/:id', stockController.updateStock);
router.post('/restock', stockController.restockItem);

export default router;
