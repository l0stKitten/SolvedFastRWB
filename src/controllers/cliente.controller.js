import Cliente from "../models/cliente.model.js";

export const createCliente = async (req, res) => {
  const {
    documento_identidad,
    tipo_documento,
    nombres,
    apellido_paterno,
    apellido_materno,
    num_telefono,
    distrito,
    provincia,
    direccion,
    referencia,
    comentario,
    forceCreate,
  } = req.body;

  const cliente = new Cliente({
    documento_identidad,
    tipo_documento,
    nombres,
    apellido_paterno,
    apellido_materno,
    num_telefono,
    distrito,
    provincia,
    direccion,
    referencia,
    comentario,
  });

  try {
    if (!forceCreate) {
      const normalize = (str) =>
        str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
      const normalizedNombres = normalize(nombres);
      const normalizedApellidoPaterno = normalize(apellido_paterno);
      const normalizedApellidoMaterno = normalize(apellido_materno);

      const existingClientes = await Cliente.find({
        $or: [
          { nombres: { $regex: normalizedNombres, $options: "i" } },
          {
            apellido_paterno: {
              $regex: normalizedApellidoPaterno,
              $options: "i",
            },
          },
          {
            apellido_materno: {
              $regex: normalizedApellidoMaterno,
              $options: "i",
            },
          },
        ],
      });

      // Filtrar los resultados para encontrar coincidencias significativas
      const matchingClientes = existingClientes.filter((cliente) => {
        const normalizedExistingNombres = normalize(cliente.nombres);
        const normalizedExistingApellidoPaterno = normalize(
          cliente.apellido_paterno
        );
        const normalizedExistingApellidoMaterno = normalize(
          cliente.apellido_materno
        );

        // Compara nombres y apellidos normalizados
        return (
          normalizedExistingNombres.includes(normalizedNombres) ||
          normalizedExistingApellidoPaterno.includes(
            normalizedApellidoPaterno
          ) ||
          normalizedExistingApellidoMaterno.includes(normalizedApellidoMaterno)
        );
      });

      if (matchingClientes.length > 0) {
        return res.status(200).json({ clientesEncontrados: matchingClientes });
      }
    }

    await cliente.save();
    res.json(cliente);
  } catch (err) {
    res.json({ error: "Hubo un error al guardar el cliente: " + err.message });
    return;
  }
};

export const updateCliente = async (req, res) => {
  const { id } = req.params;
  const {
    documento_identidad,
    tipo_documento,
    nombres,
    apellido_paterno,
    apellido_materno,
    num_telefono,
    distrito,
    provincia,
    direccion,
    referencia,
    comentario,
  } = req.body;

  try {
    await Cliente.findByIdAndUpdate(id, {
      documento_identidad,
      tipo_documento,
      nombres,
      apellido_paterno,
      apellido_materno,
      num_telefono,
      distrito,
      provincia,
      direccion,
      referencia,
      comentario,
    });

    res.json({ ...req.body });
  } catch (err) {
    res.json({ error: "Hubo un error al guardar el cliente: " + err.message });
  }
};

export const getCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(cliente);
  } catch (err) {
    res.json({ error: "Hubo un error al obtener el cliente: " + err.message });
    return;
  }
};

export const getAllClientes = async (req, res) => {
  const page = req.query.page || 1;
  const perPage = 50;

  try {
    const clientes = await Cliente.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const totalClientes = await Cliente.countDocuments();

    res.json({
      clientes,
      currentPage: page,
      totalPages: Math.ceil(totalClientes / perPage),
    });
  } catch (error) {
    res.status(500).json({ message: "Hubo un error al obtener los clientes" });
  }
};

export const findCliente = async (req, res) => {
    const page = req.query.page || 1;
    const perPage = 50;

    try {
        const { data } = req.body;
        const skipAmount = (page - 1) * perPage;

        const escapedData = data.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Crear una expresión regular para buscar la cadena de búsqueda sin tener en cuenta los acentos
        const regex = new RegExp(escapedData, 'i');

        const clientesEncontrados = await Cliente.find({
            $or: [
                { documento_identidad: { $regex: regex } },
                { nombres: { $regex: regex } },
                { apellido_paterno: { $regex: regex } },
                { apellido_materno: { $regex: regex } },
                { num_telefono: { $regex: regex } },
                { distrito: { $regex: regex } },
                { provincia: { $regex: regex } },
                { direccion: { $regex: regex } },
                { referencia: { $regex: regex } },
                { comentario: { $regex: regex } }
            ],
        })
            .sort({ createdAt: -1 })
            .skip(skipAmount)
            .limit(perPage);

        const totalClientes = await Cliente.countDocuments({
            $or: [
                { documento_identidad: { $regex: regex } },
                { nombres: { $regex: regex } },
                { apellido_paterno: { $regex: regex } },
                { apellido_materno: { $regex: regex } },
                { num_telefono: { $regex: regex } },
                { distrito: { $regex: regex } },
                { provincia: { $regex: regex } },
                { direccion: { $regex: regex } },
                { referencia: { $regex: regex } },
                { comentario: { $regex: regex } }
            ],
        });

        res.json({
            clientes: clientesEncontrados,
            currentPage: page,
            totalPages: Math.ceil(totalClientes / perPage),
        });
    } catch (error) {
        res.status(500).json({ message: "Hubo un error al obtener los clientes" });
    }
};

export const deleteCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const clienteEliminado = await Cliente.findOneAndDelete({ _id: id });

    if (!clienteEliminado) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    /*await servicioModel.deleteMany({cliente: clienteEliminado._id});*/

    return res.status(200).json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el cliente:", error);
    return res.status(500).json({ error: "Error al eliminar el cliente" });
  }
};
