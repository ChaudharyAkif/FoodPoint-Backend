import express from 'express';
import {
  createProductsAndHandleDeal,
  updateProduct,
  getProductById,
  getAllProducts,
} from '../controllers/productController';
import Product from '../models/Product';
import { upload } from '../helper/cloudinary';

const router = express.Router();

// Bulk creation
router.post('/bulk-create',upload.array('images'),createProductsAndHandleDeal);

// Get all products
router.get('/', getAllProducts); 
// router.get('/geting', getProducts); 

// Get a single product by ID
router.get('/:id', getProductById);

// Update product
router.put('/:id', upload.single('image'), updateProduct);

// Restock
router.patch('/:id/restock', async (req, res) => {
  try {
    const { amount } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity: amount } },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Restock failed', error });
  }
});

export default router;
