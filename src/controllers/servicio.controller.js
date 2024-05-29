import Servicio from "../models/servicio.model.js";
import Cliente from "../models/cliente.model.js";

export const reprogramarServicio = async (req, res) => {
  const { id, date } = req.body;

  try {
    const servicioUpdated = await Servicio.findByIdAndUpdate(id, {
      fecha_visita: new Date(date),
    }, { new: true });

    if (!servicioUpdated) {
      return res.status(404).json({ message: "No se ha encontrado el servicio." });
    }

    return res.status(200).json({ message: "Actualizado correctamente." });
  } catch (error) {
    return res.status(500).json({ message: "Hubo un error al reprogramar el servicio: " + error.message });
  }
};

export const createServicio = async (req, res) => {
  const {
    cliente,
    historial_reprogramaciones,
    numero_llamada,
    tienda,
    marca,
    producto,
    serie,
    fecha_visita,
    tipo_servicio,
    estado_realizado,
    turno,
    color,
    comentario,
    tecnico,
  } = req.body;

  const servicio = new Servicio({
    cliente,
    historial_reprogramaciones,
    numero_llamada,
    tienda,
    marca,
    producto,
    serie,
    fecha_visita,
    tipo_servicio,
    estado_realizado,
    turno,
    color,
    comentario,
    tecnico,
  });

  try {
    await servicio.save();
    res.status(201).json(servicio);
  } catch (err) {
    res.status(500).json({ error: "Hubo un error al guardar el servicio: " + err.message });
  }
};

export const updateServicio = async (req, res) => {
  const {
    _id,
    numero_llamada,
    tienda,
    marca,
    producto,
    serie,
    fecha_visita,
    tipo_servicio,
    estado_realizado,
    turno,
    color,
    comentario,
  } = req.body;

  try {
    const servicio = await Servicio.findByIdAndUpdate(_id, {
      numero_llamada,
      tienda,
      marca,
      producto,
      serie,
      fecha_visita,
      tipo_servicio,
      estado_realizado,
      turno,
      color,
      comentario,
    }, { new: true });

    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.status(200).json(servicio);
  } catch (err) {
    res.status(500).json({ error: "Hubo un error al actualizar el servicio: " + err.message });
  }
};

export const deleteServicio = async (req, res) => {
  const { id_servicio } = req.params;

  try {
    const servicioEliminado = await Servicio.findOneAndDelete({ _id: id_servicio });

    if (!servicioEliminado) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    return res.status(200).json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el servicio:", error);
    return res.status(500).json({ error: "Error al eliminar el servicio" });
  }
};

export const checkServicio = async (req, res) => {
  const { id } = req.params;

  try {
    const servicio = await Servicio.findById(id);

    if (!servicio) {
      return res.status(404).json({ message: "El servicio no fue encontrado" });
    }

    servicio.estado_realizado = !servicio.estado_realizado;
    await servicio.save();

    res.status(200).json({ message: "Servicio checkeado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Hubo un error al checkear el servicio: " + err.message });
  }
};

export const getServiciosCliente = async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const cliente = await Cliente.findById(id_cliente).populate("hist_servicios").exec();

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.status(200).json(cliente.hist_servicios);
  } catch (err) {
    res.status(500).json({ error: "Hubo un error al obtener los servicios: " + err.message });
  }
};

export const getServicio = async (req, res) => {
  const { id_servicio } = req.params;
  
  try {
    const servicio = await Servicio.findById(id_servicio);

    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    res.status(200).json(servicio);
  } catch (err) {
    res.status(500).json({ error: "Hubo un error al obtener el servicio: " + err.message });
  }
};

export const getAllServicios = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 50;

  try {
    const count = await Servicio.countDocuments();
    const servicios = await Servicio.find()
      .sort({ createdAt: -1 })
      .populate({ path: "cliente", select: "nombre_apellido" })
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      servicios,
      currentPage: page,
      totalPages: Math.ceil(count / perPage),
    });
  } catch (err) {
    res.status(500).json({ error: "Hubo un error al obtener los servicios: " + err.message });
  }
};

export const findServicio = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 50;
  const data = String(req.body.data || "").replace(/\s+/g, " ").trim().toUpperCase();

  const skipAmount = (page - 1) * perPage;

  try {
    const clienteIds = await Cliente.find({
      nombre_apellido: { $regex: data, $options: "i" }
    }).select('_id');

    const serviciosEncontrados = await Servicio.find({
      $or: [
        { numero_llamada: { $regex: data, $options: "i" } },
        { cliente: { $in: clienteIds } }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(perPage)
    .populate("cliente");

    const totalServicios = await Servicio.countDocuments({
      $or: [
        { numero_llamada: { $regex: data, $options: "i" } },
        { cliente: { $in: clienteIds } }
      ]
    });

    res.status(200).json({
      servicios: serviciosEncontrados,
      currentPage: page,
      totalPages: Math.ceil(totalServicios / perPage),
    });
  } catch (err) {
    res.status(500).json({ error: "Hubo un error al buscar los servicios: " + err.message });
  }
};
