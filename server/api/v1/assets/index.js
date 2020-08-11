import express from "express";
import multer from "multer";
const router = express.Router();
import AssetsController from "./assets.controller";
import path from "path";
import csv from "csvtojson";
import { rest } from 'blockapps-rest';

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
  })

const fileUploader = multer({ storage: storage });

const multerMiddleware = (req, res, next) => {
  fileUploader.single("file")(req, res, async (error) => {
    if (req.query.createAssetMode === 'USING_FIELDS') return next();

    if (!req.file) {
      rest.response.status400(res, "Missing file");
    }
    
    const parsedCsv = await csv().fromFile(req.file.path);

    if (!parsedCsv.length) {
      rest.response.status400(res, 'Uploaded file should not be empty');
      return next();
    }

    req.parsedCsv = parsedCsv;
    return next();
  });
};
router.get("/", AssetsController.getAssets);
router.get("/:sku", AssetsController.getAsset);
router.post("/", multerMiddleware, AssetsController.createAsset);
router.post("/:sku/event", AssetsController.handleAssetEvent);
router.post("/transferOwnership", AssetsController.transferOwnership);
export default router;