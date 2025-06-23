import { createPurchase as createPurchaseModel,
         getAllPurchases as getAllPurchasesModel,
         getPurchaseById as getPurchaseByIdModel,
         updatePurchase as updatePurchaseModel,
         deletePurchase as deletePurchaseModel } from '../models/purchaseModel.js';

// Create new purchase
export const createPurchase = async (req, res) => {
    try {
        const result = await createPurchaseModel(req.body);
        res.status(201).json({ success: true, id: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all purchases
export const getAllPurchases = async (req, res) => {
    try {
        const purchases = await getAllPurchasesModel();
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single purchase by ID
export const getPurchaseById = async (req, res) => {
    try {
        const purchase = await getPurchaseByIdModel(req.params.id);
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        res.status(200).json(purchase);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update purchase
export const updatePurchase = async (req, res) => {
    try {
        await updatePurchaseModel(req.params.id, req.body);
        res.status(200).json({ message: 'Purchase updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete purchase
export const deletePurchase = async (req, res) => {
    try {
        await deletePurchaseModel(req.params.id);
        res.status(200).json({ message: 'Purchase deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
