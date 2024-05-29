import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the base persona schema
const personaSchema = new Schema({
    documento_identidad: { type: String },
    tipo_documento: { type: Number },
    nombres: { type: String, required: true },
    apellido_paterno: { type: String, required: true },
    apellido_materno: { type: String, required: true },
    num_telefono: [
        {
            type: String 
        },
    ],
    fecha_creacion: {
        type: Date,
        default: Date.now,
    },
}, {
    discriminatorKey: 'tipoPersona',  // Add a discriminator key
    collection: 'personas'  // Ensure both models are saved in the same collection
});

export default mongoose.model("Persona", personaSchema);