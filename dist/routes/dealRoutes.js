import express from 'express';
import Deal from '../models/Deals';
import Product from '../models/Product';
const router = express.Router();
router.post('/', async (req, res) => {
    console.log('price', req.body.price);
    try {
        const { dealName, productIds, price } = req.body;
        // Verify stock availability before proceeding
        const productsToCheck = await Product.find({ _id: { $in: productIds } });
        for (const product of productsToCheck) {
            console.log("product", product.quantity);
            if (product.quantity <= 0) {
                return res.status(400).json({ message: `${product.productName} is out of stock!` });
            }
        }
        // Create the new deal document
        const newDeal = new Deal({
            dealName,
            productIds,
            price: Number(price) || 0,
            status: 'active',
        });
        await newDeal.save();
        // DEDUCT QUANTITY: Reduce stock of each item by 1
        await Product.updateMany({ _id: { $in: productIds } }, { $inc: { quantity: -1 } });
        const populatedDeal = await Deal.findById(newDeal._id).populate('productIds');
        res.status(201).json(populatedDeal);
    }
    catch (error) {
        console.error('Deal Creation Error:', error);
        res.status(500).json({ message: 'Failed to create deal', error });
    }
});
// 2. GET ROUTE
router.get('/', async (req, res) => {
    try {
        const deals = await Deal.find().sort({ createdAt: -1 }).populate('productIds');
        res.json(deals);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching deals', error });
    }
});
// 3. DELETE ROUTE
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDeal = await Deal.findByIdAndDelete(id);
        if (!deletedDeal)
            return res.status(404).json({ message: 'Deal not found' });
        res.status(200).json({ message: 'Deal deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error during deletion', error });
    }
});
// 4. STATUS PATCH ROUTE
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedDeal = await Deal.findByIdAndUpdate(id, { status }, { new: true }).populate('productIds');
        res.json(updatedDeal);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update status' });
    }
});
export default router;
