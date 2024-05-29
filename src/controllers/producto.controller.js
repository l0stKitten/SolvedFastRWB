import Producto from "../models/producto.model.js";

export const createProducto = async (req, res) => {
    const {
      nombre_producto,
      marca,
      categoria,
    } = req.body;
  
    const producto = new Producto({
        nombre_producto,
        marca,
        categoria,
    });
  
    try {
      await producto.save();
      res.status(201).json(producto);
    } catch (err) {
      res.status(500).json({ error: "Hubo un error al guardar el producto: " + err.message });
    }
  };
  
  export const updateProducto = async (req, res) => {
    const {
      _id,
      nombre_producto,
      marca,
      categoria,
    } = req.body;
  
    try {
      const producto = await Producto.findByIdAndUpdate(_id, {
        nombre_producto,
        marca,
        categoria,
      }, { new: true });
  
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
  
      res.status(200).json(producto);
    } catch (err) {
      res.status(500).json({ error: "Hubo un error al actualizar el producto: " + err.message });
    }
  };
  
  export const deleteProducto = async (req, res) => {
    const { id_producto } = req.params;
  
    try {
      const productoEliminado = await Producto.findOneAndDelete({ _id: id_producto });
  
      if (!productoEliminado) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
  
      return res.status(200).json({ message: "Producto eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      return res.status(500).json({ error: "Error al eliminar el producto" });
    }
  };
  
  export const getProducto = async (req, res) => {
    const { id_producto } = req.params;
    
    try {
      const producto = await Producto.findById(id_producto);
  
      if (!producto) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
  
      res.status(200).json(producto);
    } catch (err) {
      res.status(500).json({ error: "Hubo un error al obtener el producto: " + err.message });
    }
  };
  
  export const getAllProductos = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = 50;
  
    try {
      const count = await Producto.countDocuments();
      const productos = await Producto.find()
        .sort({ createdAt: -1 })
        .populate({ path: "nombre_producto", select: "nombre_producto" })
        .skip((page - 1) * perPage)
        .limit(perPage);
  
      res.status(200).json({
        productos,
        currentPage: page,
        totalPages: Math.ceil(count / perPage),
      });
    } catch (err) {
      res.status(500).json({ error: "Hubo un error al obtener los productos: " + err.message });
    }
  };