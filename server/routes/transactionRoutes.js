// routes/transactionRoutes.js
import express from 'express';
import transactionController from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);
router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.put('/:id/status', transactionController.updateTransactionStatus);
router.delete('/:id', transactionController.deleteTransaction);

export default router;
