import { Router } from "express";
import {
  importB2BSheet,
  getProcessedFile,
  processB2BImport,
  uploadMiddleware,
} from "../controllers/gstr2bimportcontroller.js";

const router = Router();

router.post("/b2b", uploadMiddleware, importB2BSheet);
router.post("/:id/process", processB2BImport);
router.get("/:id/processed", getProcessedFile);

export default router;

