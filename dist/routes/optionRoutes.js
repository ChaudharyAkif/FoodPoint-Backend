import express from 'express';
import { getAllOptions, createOption, deleteOption, updateOption } from '../controllers/optionController';
const router = express.Router();
router.get('/', getAllOptions);
router.post('/', createOption);
router.put('/:id', updateOption); // Added for two-way sync updates
router.delete('/:id', deleteOption);
export default router;
