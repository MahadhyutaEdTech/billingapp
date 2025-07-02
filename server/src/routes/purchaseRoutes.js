import express from 'express';
import * as purchaseController from '../controllers/purchaseController.js';

const router = express.Router();

// Create a new purchase
router.post('/purchases', purchaseController.createPurchase);

// Get all purchases
router.get('/purchases', purchaseController.getAllPurchases);

// Get a single purchase by id
router.get('/purchases/:id', purchaseController.getPurchaseById);

// Update a purchase
router.put('/purchases/:id', purchaseController.updatePurchase);

// Delete a purchase
router.delete('/purchases/:id', purchaseController.deletePurchase);

export default router;
