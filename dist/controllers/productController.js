import mongoose from 'mongoose';
import Product from '../models/Product';
import OptionGroup from '../models/OptionGroup';
import Deal from '../models/Deals';
import { upload } from '../helper/cloudinary';
/* ===================== UPDATE PRODUCT ===================== */
/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }
        const oldProduct = await Product.findById(id);
        if (!oldProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // ✅ Handle updated image (Cloudinary)
        if (req.file) {
            updateData.image = req.file.path; // Cloudinary URL
        }
        // ✅ Normalize optionGroups
        if (Array.isArray(updateData.optionGroups)) {
            updateData.optionGroups = updateData.optionGroups.map((g) => typeof g === 'object' && g._id ? g._id : g);
        }
        if (Array.isArray(updateData.extras)) {
            updateData.extras = updateData.extras.map((e) => typeof e === 'object' && e.name ? e.name : String(e));
        }
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        // ✅ Two-way sync
        const oldGroups = (oldProduct.optionGroups || []).map((id) => id.toString());
        const newGroups = updateData.optionGroups || [];
        // const removedGroups = oldGroups.filter((id) => !newGroups.includes(id));
        // const addedGroups = newGroups.filter((id) => !oldGroups.includes(id));
        const removedGroups = oldGroups.filter((id) => !newGroups.includes(id));
        const addedGroups = newGroups.filter((id) => !oldGroups.includes(id));
        await Promise.all([
            removedGroups.length &&
                OptionGroup.updateMany({ _id: { $in: removedGroups } }, { $pull: { linkedProducts: id } }),
            addedGroups.length &&
                OptionGroup.updateMany({ _id: { $in: addedGroups } }, { $addToSet: { linkedProducts: id } }),
        ]);
        res.json({ message: 'Updated successfully!', product: updatedProduct });
    }
    catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
/* ===================== IMAGE MIDDLEWARE ===================== */
export const uploadProductImage = upload.single('image');
/* ===================== CREATE PRODUCTS ===================== */
// export const createProductsAndHandleDeal = async (req: Request, res: Response) => {
//   try {
//     const { dealAction, dealName } = req.body;
//     // ✅ Parse products correctly
//     const products =
//       typeof req.body.products === 'string' ? JSON.parse(req.body.products) : req.body.products;
//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({ message: 'No products provided' });
//     }
//     // ✅ Safe files handling
//     const files = (req.files || []) as Express.Multer.File[];
//     const productsWithDefaults = products.map((p: any, idx: number) => {
//       let imageUrl = p.image;
//       // ✅ Cloudinary image
//       if (files[idx]?.path) {
//         imageUrl = files[idx].path;
//       }
//       return {
//         productName: p.productName || 'Unnamed Product',
//         price: Number(p.price) || 0,
//         quantity: Number(p.quantity) >= 0 ? Number(p.quantity) : 10,
//         image: imageUrl, // ✅ Cloudinary URL
//         description: p.description || '',
//         category: p.category || '',
//         extras: Array.isArray(p.extras)
//           ? p.extras.map((e: any) => (typeof e === 'object' ? e.name : String(e)))
//           : [],
//         dietaryInfo: p.dietaryInfo || {
//           is18Plus: false,
//           isSpicy: false,
//           isVegan: false,
//           isVegetarian: false,
//         },
//         variations: p.variations || [],
//         optionGroups: p.optionGroups || [],
//       };
//     });
//     const savedProducts = await Product.insertMany(productsWithDefaults);
//     // ✅ Sync option groups
//     await Promise.all(
//       savedProducts.map((product) =>
//         product.optionGroups?.length
//           ? OptionGroup.updateMany(
//               { _id: { $in: product.optionGroups } },
//               { $addToSet: { linkedProducts: product._id } }
//             )
//           : Promise.resolve()
//       )
//     );
//     // ✅ Handle deal
//     if (dealAction === 'new') {
//       await new Deal({
//         dealName: dealName?.trim() || `Deal - ${new Date().toLocaleDateString()}`,
//         productIds: savedProducts.map((p) => p._id),
//         status: 'active',
//       }).save();
//     }
//     res.status(201).json({
//       message: 'Products created successfully!',
//       savedProducts,
//     });
//   } catch (error) {
//     console.error('Create Products Error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
export const createProductsAndHandleDeal = async (req, res) => {
    try {
        const { dealAction, dealName } = req.body;
        console.log(req.body);
        const products = typeof req.body.products === 'string' ? JSON.parse(req.body.products) : req.body.products;
        const files = req.files;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'No products provided' });
        }
        const productsWithDefaults = products.map((p, idx) => {
            let imageUrl = p.image || '';
            // ✅ Attach Cloudinary URL if file exists
            // if (files && files[idx]) {
            //   imageUrl = files[idx].path;
            // }
            if (files && files.length > 0) {
                imageUrl = files.shift()?.path || imageUrl;
            }
            const formattedExtras = Array.isArray(p.extras)
                ? p.extras.map((e) => (typeof e === 'object' ? e.name : String(e)))
                : [];
            return {
                productName: p.productName || 'Unnamed Product',
                price: Number(p.price) || 0,
                quantity: Number(p.quantity) >= 0 ? Number(p.quantity) : 10,
                image: imageUrl,
                description: p.description || '',
                category: p.category || '',
                extras: formattedExtras,
                dietaryInfo: p.dietaryInfo || {
                    is18Plus: false,
                    isSpicy: false,
                    isVegan: false,
                    isVegetarian: false,
                },
                variations: p.variations || [],
                optionGroups: p.optionGroups || [],
            };
        });
        const newSavedProducts = await Product.insertMany(productsWithDefaults);
        // Sync option groups
        await Promise.all(newSavedProducts.map((product) => {
            if (product.optionGroups?.length) {
                return OptionGroup.updateMany({ _id: { $in: product.optionGroups } }, { $addToSet: { linkedProducts: product._id } });
            }
            return Promise.resolve();
        }));
        if (dealAction === 'new') {
            await new Deal({
                dealName: dealName?.trim() || `Deal - ${new Date().toLocaleDateString()}`,
                productIds: newSavedProducts.map((p) => p._id),
                status: 'active',
            }).save();
        }
        res.status(201).json({
            message: 'Products created successfully!',
            savedProducts: newSavedProducts,
        });
    }
    catch (error) {
        console.error('Create Products Error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
/* ===================== GETTERS ===================== */
export const getAllProducts = async (_req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .populate({ path: 'optionGroups', populate: { path: 'options' } });
        res.json(products);
    }
    catch {
        res.status(500).json({ message: 'Error fetching products' });
    }
};
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate({
            path: 'optionGroups',
            populate: { path: 'options' },
        });
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
