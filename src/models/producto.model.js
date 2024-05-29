import mongoose from "mongoose";
const Schema = mongoose.Schema;

const productoSchema = new Schema({
    nombre_producto: { type: String, required: true },
    marca: { type: String, required: true },
    categoria: { type: String, required: true },
});

export default mongoose.model("Producto", productoSchema);