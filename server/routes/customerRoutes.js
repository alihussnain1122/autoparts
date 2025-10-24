// routes/customerRoutes.js
import express from 'express';
import customerController from '../controllers/customerController.js';

const router = express.Router();

router.post('/', customerController.createCustomer);
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;
