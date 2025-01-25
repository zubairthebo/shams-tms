import express from 'express';
import { authenticateToken } from '../auth.js';
import { saveXML } from '../xmlGenerator.js';

const router = express.Router();

router.post('/save-xml', authenticateToken, saveXML);

export default router;