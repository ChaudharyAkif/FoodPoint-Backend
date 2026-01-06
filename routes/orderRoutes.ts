import express from 'express';
import { createOrder, getAllOrders, getOrderById } from '../controllers/orderController';

const router = express.Router();

// This matches the POST call in your frontend DealGallery.tsx
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);

export default router;