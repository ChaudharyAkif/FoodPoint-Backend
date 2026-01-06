import Order from '../models/Order';
export const createOrder = async (req, res) => {
    try {
        const { items, total, address, paymentMethod } = req.body;
        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order items are required' });
        }
        if (typeof total !== 'number') {
            return res.status(400).json({ message: 'Total amount is required' });
        }
        // Generate order ID
        const generatedOrderId = `ORD-${Date.now()}`;
        const newOrder = new Order({
            orderId: generatedOrderId,
            items,
            totalAmount: total, // :white_check_mark: matches schema
            address,
            paymentMethod,
        });
        await newOrder.save();
        res.status(201).json({
            message: 'Order created successfully',
            order: newOrder,
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Failed to save order' });
    }
};
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }); // Newest first
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate({
            path: 'items.productId',
            select: 'description image'
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
