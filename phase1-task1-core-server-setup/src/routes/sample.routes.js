import express from 'express';
import * as sampleController from '../controllers/sample.controller.js';

const router = express.Router();

router.get('/welcome', sampleController.handleGetSample);

export default router;