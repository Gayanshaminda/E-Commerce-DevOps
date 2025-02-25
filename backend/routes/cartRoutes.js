import express from 'express';
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from '../controllers/cartController.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);

export default router;