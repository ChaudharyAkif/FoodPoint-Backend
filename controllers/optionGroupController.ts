import { Request, Response } from 'express';
import OptionGroup from '../models/OptionGroup';
import Product from '../models/Product'; //


export const getAllGroups = async (_req: Request, res: Response) => {
  try {
    const groups = await OptionGroup.find()
      .populate('options')
      .populate('linkedProducts', 'productName')
      .sort({ name: 1 })
      .lean(); //

    const formatted = groups.map((group: any) => ({
      ...group,
      linkedProductNames: group.linkedProducts && Array.isArray(group.linkedProducts)
        ? group.linkedProducts
            .filter((p: any) => p !== null)
            .map((p: any) => p.productName || 'Unknown Product') 
        : []
    }));

    res.json(formatted); 
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error });
  }
};

// Create a new group with two-way sync
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, isRequired, options, linkedProducts } = req.body;
    
    const newGroup = new OptionGroup({
      name,
      isRequired: Boolean(isRequired),
      options: options || [],
      linkedProducts: linkedProducts || []
    });
    const savedGroup = await newGroup.save();

    if (linkedProducts && linkedProducts.length > 0) {
      await Product.updateMany(
        { _id: { $in: linkedProducts } },
        { $addToSet: { optionGroups: savedGroup._id } }
      );
    }

    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(400).json({ message: 'Error creating group' });
  }
};

// Updated: Fixes the "Empty" display after update
export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, isRequired, options, linkedProducts } = req.body;

    const oldGroup = await OptionGroup.findById(id);
    if (!oldGroup) return res.status(404).json({ message: 'Group not found' });

    const oldLinkedProducts = oldGroup.linkedProducts.map(pid => pid.toString());

    // 1. Update the document
    await OptionGroup.findByIdAndUpdate(
      id,
      {
        name,
        isRequired: Boolean(isRequired),
        options: options || [],
        linkedProducts: linkedProducts || []
      }
    );

    // 2. Perform Sync
    const removedProducts = oldLinkedProducts.filter(pId => !linkedProducts.includes(pId));
    if (removedProducts.length > 0) {
      await Product.updateMany({ _id: { $in: removedProducts } }, { $pull: { optionGroups: id } });
    }
    if (linkedProducts && linkedProducts.length > 0) {
      await Product.updateMany({ _id: { $in: linkedProducts } }, { $addToSet: { optionGroups: id } });
    }

    // 3. IMPORTANT: Re-fetch populated data so UI isn't empty
    const finalGroup = await OptionGroup.findById(id)
      .populate('options')
      .populate('linkedProducts', 'productName')
      .lean();

    const formatted = {
      ...finalGroup,
      linkedProductNames: finalGroup?.linkedProducts?.map((p: any) => p.productName) || []
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error updating group', error });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Product.updateMany({ optionGroups: id }, { $pull: { optionGroups: id } });
    const result = await OptionGroup.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: 'Group not found' });
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
};