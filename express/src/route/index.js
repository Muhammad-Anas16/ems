import { Router } from "express";
import statusRoute from "./status/statusRoute.js";
import dataRoutes from "./aurora/dataRoutes.js";

const router = Router();

router.use("/", statusRoute);
router.use("/aurora", dataRoutes);

export default router;
