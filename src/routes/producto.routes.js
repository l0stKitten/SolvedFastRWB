import { Router } from "express";
const router = Router();

import {
  createProducto,
  deleteProducto,
  updateProducto,
  getProducto,
  getAllProductos,
} from "../controllers/producto.controller.js";

router.get("/productos", getAllProductos);
router.post("/producto", createProducto);
router.get("/producto/:id_producto", getProducto);
router.put("/producto", updateProducto);
router.delete("/producto/:id_producto", deleteProducto);

export default router;
