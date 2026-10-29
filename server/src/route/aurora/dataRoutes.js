import { Router } from "express";

import {
  fetchTrendlogs,
  fetchTrendlogData,
  fetchEnergylogs,
  fetchEnergylogData,
} from "../../controller/aurora/dataController.js";

const router = Router();

router.get("/trendlog", fetchTrendlogs);
router.post("/trendlog", fetchTrendlogs);
router.post("/trendlog-data", fetchTrendlogData);

router.get("/energylog", fetchEnergylogs);
router.post("/energylog", fetchEnergylogs);
router.post("/energylog-data", fetchEnergylogData);

export default router;
