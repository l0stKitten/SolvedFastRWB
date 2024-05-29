import mongoose from "mongoose";
const Schema = mongoose.Schema;

const especialidadSchema = new Schema({
    nombre_especialidad: { type: String, required: true },
});

export default mongoose.model("Especialidad", especialidadSchema);