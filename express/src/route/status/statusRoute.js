import { Router } from "express";
import {
  getHealth,
  getIP,
  updateIP,
} from "../../controller/status/statusController.js";

const router = Router();

router.get("/health", getHealth);
router.get("/config/ip", getIP);
router.put("/config/ip", updateIP);

export default router;
