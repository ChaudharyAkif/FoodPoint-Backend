import Deal from '../models/Deals';
export const createDeal = async (req, res) => {
    try {
        // console.log("dealprice", req.body.dealPrice);
        // FIX: Catch 'dealPrice' from the frontend
        const { dealName, productIds, dealPrice } = req.body;
        const newDeal = new Deal({
            dealName,
            productIds,
            // Map 'dealPrice' to the 'price' field in your schema
            price: Number(dealPrice) || 0,
            status: 'active'
        });
        await newDeal.save();
        res.status(201).json({ message: 'Deal created successfully', deal: newDeal });
    }
    catch (error) {
        console.error("Deal Creation Error:", error);
        res.status(500).json({ message: 'Server error during deal creation', error });
    }
};
