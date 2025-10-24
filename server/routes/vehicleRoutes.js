// routes/vehicleRoutes.js
import express from 'express';
import vehicleController from '../controllers/vehicleController.js';

const router = express.Router();

router.post('/', vehicleController.addVehicle);
router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);
router.post('/link-part', vehicleController.addPartToVehicle);

export default router;
