import { fileURLToPath } from "url";
import path, { dirname } from "path";
import morgan from "morgan";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import tecnicoRoutes from "./routes/tecnico.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";
import servicioRoutes from "./routes/servicio.routes.js";
import programarRoutes from "./routes/programar.routes.js";
import productoRoutes from "./routes/producto.routes.js";
import { connectDB } from "./database.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(
  cors({
    origin: "http://localhost:" + (process.env.PORT || 5173),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api", tecnicoRoutes);
app.use("/api", clienteRoutes);
app.use("/api", servicioRoutes);
app.use("/api", programarRoutes);
app.use("/api", productoRoutes);

const frontendBuildPath = path.join(__dirname, "public", "dist");
app.use(express.static(frontendBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

await connectDB();


export default app ;