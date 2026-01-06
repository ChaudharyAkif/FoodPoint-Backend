import { Request, Response } from 'express';
import Option from '../models/Option';
import Product from '../models/Product';

export const getAllOptions = async (req: Request, res: Response) => {
  try {
    const options = await Option.find().populate('linkedProducts', 'productName').lean();
    const formatted = options.map((opt: any) => ({
      ...opt,
      linkedProductNames: opt.linkedProducts 
        ? opt.linkedProducts.filter((p: any) => p !== null).map((p: any) => p.productName) 
        : []
    }));
    res.json(formatted); 
  } catch (error) {
    res.status(500).json({ message: 'Error fetching options', error });
  }
};

export const createOption = async (req: Request, res: Response) => {
  try {
    const { name, price, linkedProducts } = req.body;
    const newOption = new Option({
      name,
      price: Number(price) || 0,
      linkedProducts: linkedProducts || []
    });
    const savedOption = await newOption.save();

    if (linkedProducts && linkedProducts.length > 0) {
      await Product.updateMany(
        { _id: { $in: linkedProducts } },
        { $addToSet: { extras: name } }
      );
    }
    res.status(201).json(savedOption);
  } catch (error) {
    res.status(400).json({ message: 'Error creating option', error });
  }
};

export const updateOption = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, linkedProducts } = req.body;

    const oldOption = await Option.findById(id);
    if (!oldOption) return res.status(404).json({ message: 'Option not found' });

    const oldLinkedProducts = (oldOption.linkedProducts || []).map(p => p.toString());

    const updatedOption = await Option.findByIdAndUpdate(
        id, 
        { name, price: Number(price) || 0, linkedProducts: linkedProducts || [] }, 
        { new: true }
    ).populate('linkedProducts', 'productName').lean();

    // FIXED: Guard against null result
    if (!updatedOption) return res.status(404).json({ message: 'Option update failed' });

    const removedFrom = oldLinkedProducts.filter(pId => !linkedProducts.includes(pId));
    if (removedFrom.length > 0) {
      await Product.updateMany({ _id: { $in: removedFrom } }, { $pull: { extras: oldOption.name } });
    }

    if (linkedProducts.length > 0) {
      await Product.updateMany({ _id: { $in: linkedProducts } }, { $addToSet: { extras: name } });
    }

    const formatted = {
      ...updatedOption,
      linkedProductNames: updatedOption.linkedProducts?.map((p: any) => p.productName) || []
    };
    res.json(formatted);
  } catch (error) {
    console.error("Update Option Error:", error);
    res.status(500).json({ message: 'Update failed', error });
  }
};

export const deleteOption = async (req: Request, res: Response) => {
  try {
    const option = await Option.findById(req.params.id);
    if (option) {
      await Product.updateMany({ extras: option.name }, { $pull: { extras: option.name } });
      await Option.findByIdAndDelete(req.params.id);
    }
    res.json({ message: 'Option deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error });
  }
};