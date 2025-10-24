// routes/supplierRoutes.js
import express from 'express';
import supplierController from '../controllers/supplierController.js';

const router = express.Router();

router.post('/', supplierController.addSupplier);
router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

export default router;
