import express from "express";
const router = express.Router();
import AssetsController from "./assets.controller";
import path from "path";
import { rest } from "blockapps-rest";

router.get("/", AssetsController.getAssets);
router.get("/:sku", AssetsController.getAsset);
router.post("/", AssetsController.createAsset);
router.post("/:sku/event", AssetsController.handleAssetEvent);
router.post("/transferOwnership", AssetsController.transferOwnership);
export default router;
