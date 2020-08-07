import express from "express";
import multer from "multer";
const router = express.Router();
import AssetsController from "./assets.controller";
import path from "path";
import csv from "csvtojson";

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
    const parsedData = await csv().fromFile(req.file.path);
    // TODO: please continue from here
    console.log("-----------------------", parsedData)
    next();
  });
};
router.get("/", AssetsController.getAssets);
router.get("/:sku", AssetsController.getAsset);
router.post("/", multerMiddleware, AssetsController.createAsset);
router.post("/:sku/event", AssetsController.handleAssetEvent);
router.post("/transferOwnership", AssetsController.transferOwnership);
export default router;