import express from 'express';
import { getAllProducts, getFeaturedProducts, createProduct, deleteProduct, getRecommendedProducts, getProductsByCategory, toggleFeaturedeProduct} from '../controllers/productController.js';
import { protectRoute, adminRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category",  getProductsByCategory);
router.get("/recommendations",  getRecommendedProducts);
router.post("/", protectRoute, adminRoute, createProduct); // Shift + Alt + Down Arrow to duplicate a line
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedeProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);


export default router;