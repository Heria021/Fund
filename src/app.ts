import express, { Request, Response, Application } from "express";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/userRoutes";
import searchRoutes from "./routes/searchRoutes";

const app: Application = express(); 

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/api", userRoutes);
app.use("/api", searchRoutes ); 

export default app;