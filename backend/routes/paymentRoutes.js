import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { createCheckoutSession, successPayment} from '../controllers/paymentController.js';

const router = express.Router();

router.post("/create-checkout-session", protectRoute , createCheckoutSession);
router.post("/create-success", protectRoute , successPayment);

export default router;