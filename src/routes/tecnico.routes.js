import { Router } from "express";
const router = Router();

import {
    createTecnico,
    deleteTecnico,
    updateTecnico,
    getAllTecnicos,
    getTecnico,
    getAllEspecialidades,
    createEspecialidad,
    findTecnico,
    addEspecialidadToTecnico,
    suspenderTecnico,
    quitarSuspensionTecnico,
    searchSimilarTecnico,
} from "../controllers/tecnico.controller.js";

router.get("/tecnicos", getAllTecnicos);
router.post("/tecnico", createTecnico);
router.put("/tecnico/:id", updateTecnico);
router.delete("/tecnico/:id", deleteTecnico);
router.post("/tecnico/find", findTecnico);
router.get("/tecnico/:id", getTecnico);
router.post("/tecnico/similar", searchSimilarTecnico);

router.put("/tecnico/suspender/:id", suspenderTecnico);
router.put("/tecnico/quitarsus/:id", quitarSuspensionTecnico)

router.get("/especialidades", getAllEspecialidades)
router.post("/especialidad", createEspecialidad);
router.post("/add/especialidad", addEspecialidadToTecnico);

export default router;