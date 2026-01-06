import express from 'express';
import { getAllGroups, createGroup, deleteGroup } from '../controllers/optionGroupController';
const router = express.Router();
router.get('/', getAllGroups);
router.post('/', createGroup); // Matches CreateGroupModal.tsx:31
router.delete('/:id', deleteGroup);
export default router;
