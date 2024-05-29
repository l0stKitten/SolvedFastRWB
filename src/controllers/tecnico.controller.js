import Tecnico from "../models/tecnico.model.js";
import Especialidad from "../models/especialidad.model.js"
import { isValid, parseISO } from 'date-fns';

export const searchSimilarTecnico = async (req, res) => {
    const { nombres, apellido_paterno, apellido_materno } = req.body;
    console.log(nombres, apellido_materno, apellido_paterno);

    const normalize = (str) =>
        str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const normalizedNombres = normalize(nombres);
    const normalizedApellidoPaterno = normalize(apellido_paterno);
    const normalizedApellidoMaterno = normalize(apellido_materno);

    try {
        const existingTecnicos = await Tecnico.find({
            $or: [
                { nombres: { $regex: normalizedNombres, $options: "i" } },
                { apellido_paterno: { $regex: normalizedApellidoPaterno, $options: "i" } },
                { apellido_materno: { $regex: normalizedApellidoMaterno, $options: "i" } }
            ]
        }).populate('especialidad'); // Populate the especialidad field

        // Filter the results to find significant matches
        const matchingTecnicos = existingTecnicos.filter((tecnico) => {
            const normalizedExistingNombres = normalize(tecnico.nombres);
            const normalizedExistingApellidoPaterno = normalize(tecnico.apellido_paterno);
            const normalizedExistingApellidoMaterno = normalize(tecnico.apellido_materno);

            // Compare normalized names and surnames
            return (
                normalizedExistingNombres.includes(normalizedNombres) ||
                normalizedExistingApellidoPaterno.includes(normalizedApellidoPaterno) ||
                normalizedExistingApellidoMaterno.includes(normalizedApellidoMaterno)
            );
        });

        if (matchingTecnicos.length > 0) {
            return res.status(200).json({ tecnicosEncontrados: matchingTecnicos });
        } else {
            return res.status(200).json({ tecnicosEncontrados: [] });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const createTecnico = async (req, res) => {
    const {
        documento_identidad,
        tipo_documento,
        nombres,
        apellido_paterno,
        apellido_materno,
        num_telefono,
        especialidad,
    } = req.body;

    const tecnico = new Tecnico({
        documento_identidad,
        tipo_documento,
        nombres,
        apellido_paterno,
        apellido_materno,
        num_telefono,
        especialidad,
    });

    try {
        await tecnico.save();
        res.json({
            tecnico,
            currentPage: req.query.page || 1,
        });
    } catch (err) {
        res.json({ error: "Hubo un error al guardar el tecnico: " + err.message });
        return;
    }
};

export const suspenderTecnico = async (req, res) => {
    const { id } = req.params;
    const { 
        suceso,
        comentario,
        fecha_inicio,
        fecha_fin,
     } = req.body;

    try {
        const tecnico = await Tecnico.findById(id);

        if (!tecnico) {
            return res.status(404).json({ message: "Tecnico not found" });
        }

        // Validate the date format before parsing
        if (!isValid(parseISO(fecha_inicio)) || !isValid(parseISO(fecha_fin))) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        const nuevoHistorial = {
            suceso,
            comentario,
            fecha_inicio: parseISO(fecha_inicio),
            fecha_fin: parseISO(fecha_fin),
        };

        tecnico.historial_tecnico.push(nuevoHistorial);

        tecnico.estado = false;

        await tecnico.save();

        res.json({ message: "Tecnico suspendido con exito", tecnico });
    } catch (err) {
        res.status(500).json({ error: "Hubo un error al suspender el tecnico: " + err.message });
    }
};

export const quitarSuspensionTecnico = async (req, res) => {
    const { id } = req.params;
    const { 
        suceso,
        comentario,
     } = req.body;

    try {
        const tecnico = await Tecnico.findById(id);

        if (!tecnico) {
            return res.status(404).json({ message: "Tecnico not found" });
        }

        const nuevoHistorial = {
            suceso,
            comentario,
        };

        tecnico.historial_tecnico.push(nuevoHistorial);

        tecnico.estado = true;

        // Save the changes
        await tecnico.save();

        res.json({ message: "Suspensión eliminada con éxito", tecnico });
    } catch (err) {
        res.status(500).json({ error: "Hubo un error al quitar la suspención del tecnico: " + err.message });
    }
};

export const updateTecnico = async (req, res) => {
    const { id } = req.params;
    const {
        documento_identidad,
        tipo_documento,
        nombres,
        apellido_paterno,
        apellido_materno,
        num_telefono,
        especialidad,
        estado,
    } = req.body;

    try {
        await Tecnico.findByIdAndUpdate(id, {
            documento_identidad,
            tipo_documento,
            nombres,
            apellido_paterno,
            apellido_materno,
            num_telefono,
            especialidad,
            estado,
        });
        res.json({ ...req.body });
    } catch (err) {
        res.json({ error: "Hubo un error al guardar el tecnico: " + err.message });
    }
};

export const deleteTecnico = async (req, res) => {
    const { id } = req.params;

    try {
        const tecnicoEliminado = await Tecnico.findOneAndDelete({ _id: id });

        if (!tecnicoEliminado) {
            return res.status(404).json({ message: "Tecnico no encontrado" });
        }

        return res.status(200).json({ message: "Tecnico eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar el tecnico:", error);
        return res.status(500).json({ error: "Error al eliminar el tecnico" });
    }
};

export const getTecnico = async (req, res) => {
    const { id } = req.params;
    try {
        const tecnico = await Tecnico.findById(id);
        res.json(tecnico);
    } catch (err) {
        res.json({ error: "Hubo un error al obtener el tecnico: " + err.message });
        return;
    }
};

export const getAllTecnicos = async (req, res) => {
    const page = req.query.page || 1;
    const perPage = 50;

    try {
        const tecnicos = await Tecnico.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate({
                path: 'especialidad',
                select: 'nombre_especialidad', // Only select the field 'nombre_especialidad'
                model: 'Especialidad'
            })

        res.json({
            tecnicos,
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: "Hubo un error al obtener los tecnicos" });
    }
};

export const addEspecialidadToTecnico = async (req, res) => {
    try {
        const { tecnicoId, especialidadId } = req.body;
        console.log(req.body)

        // Find the tecnico by ID
        const tecnico = await Tecnico.findById(tecnicoId);
        if (!tecnico) {
            return res.status(404).json({ message: 'Tecnico not found' });
        }
        console.log("pass")
        // Check if the especialidad exists
        const especialidad = await Especialidad.findById(especialidadId);
        if (!especialidad) {
            return res.status(404).json({ message: 'Especialidad not found' });
        }
        console.log("pass")
        // Check if the especialidad ID is already in the array
        if (tecnico.especialidad.includes(especialidadId)) {
            return res.status(400).json({ message: 'Especialidad already added to the tecnico' });
        }
        console.log("pass")
        // Add the especialidad ID to the especialidad array
        tecnico.especialidad.push(especialidadId);
        console.log("pass")
        // Save the updated tecnico document
        await tecnico.save();
        console.log("pass")
        return res.status(200).json({ message: 'Especialidad added successfully', tecnico });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

export const findTecnico = async (req, res) => {
    const page = req.query.page || 1;
    const perPage = 50;
  
    try {
        const { data } = req.body;
        const skipAmount = (page - 1) * perPage;

        const tecnicosEncontrados = await Tecnico.aggregate([
            {
                $lookup: {
                    from: 'especialidads',
                    localField: 'especialidad',
                    foreignField: '_id',
                    as: 'especialidadDetails'
                }
            },
            {
                $unwind: {
                    path: '$especialidadDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $or: [
                        { documento_identidad: { $regex: data, $options: 'i' } },
                        { nombres: { $regex: data, $options: 'i' } },
                        { apellido_paterno: { $regex: data, $options: 'i' } },
                        { apellido_materno: { $regex: data, $options: 'i' } },
                        { num_telefono: { $regex: data, $options: 'i' } },
                        { 'especialidadDetails.nombre_especialidad': { $regex: data, $options: 'i' } },
                        { estado: { $regex: data, $options: 'i' } },
                        {
                            $expr: {
                                $cond: {
                                    if: { $eq: [data, "activo"] },
                                    then: { $eq: ['$estado', true] },
                                    else: {
                                        $cond: {
                                            if: { $eq: [data, "suspendido"] },
                                            then: { $eq: ['$estado', false] },
                                            else: null
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: '$_id',
                    documento_identidad: { $first: '$documento_identidad' },
                    tipo_documento: { $first: '$tipo_documento' },
                    nombres: { $first: '$nombres' },
                    apellido_paterno: { $first: '$apellido_paterno' },
                    apellido_materno: { $first: '$apellido_materno' },
                    num_telefono: { $first: '$num_telefono' },
                    tipoPersona: { $first: '$tipoPersona' },
                    especialidad: { $first: '$especialidad' },
                    estado: { $first: '$estado' },
                    historial_tecnico: { $first: '$historial_tecnico' },
                    fecha_creacion: { $first: '$fecha_creacion' },
                    __v: { $first: '$__v' }
                }
            },
            {
                $lookup: {
                    from: 'especialidads',
                    localField: 'especialidad',
                    foreignField: '_id',
                    as: 'especialidad'
                }
            },
            {
                $project: {
                    documento_identidad: 1,
                    tipo_documento: 1,
                    nombres: 1,
                    apellido_paterno: 1,
                    apellido_materno: 1,
                    num_telefono: 1,
                    tipoPersona: 1,
                    especialidad: {
                        nombre_especialidad: 1
                    },
                    estado: 1,
                    historial_tecnico: 1,
                    fecha_creacion: 1,
                    __v: 1
                }
            },
            {
                $sort: { fecha_creacion: -1 }
            },
            {
                $skip: skipAmount
            },
            {
                $limit: perPage
            }
        ]);
  
        res.json({
            tecnicos: tecnicosEncontrados,
            currentPage: page,
        });
        } catch (error) {
        res.status(500).json({ message: "Hubo un error al obtener los tecnicos" });
        }
  };

export const getAllEspecialidades = async (req, res) => {
    try {
        const especialidades = await Especialidad.find();

        res.json({
            especialidades
        });
    } catch (error) {
        res.status(500).json({ message: "Hubo un error al obtener los especialidades" });
    }
};

export const createEspecialidad = async (req, res) => {
    const {
        nombre_especialidad,
    } = req.body;

    const especialidad = new Especialidad({
        nombre_especialidad
    });

    try {
        await especialidad.save();
        res.json({
            especialidad,
        });
    } catch (err) {
        res.json({ error: "Hubo un error al guardar la especialidad: " + err.message });
        return;
    }
};