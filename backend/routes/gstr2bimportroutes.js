import { Router } from "express";
import {
  importB2BSheet,
  uploadMiddleware,
} from "../controllers/gstr2bimportcontroller.js";

const router = Router();

router.post("/b2b", uploadMiddleware, importB2BSheet);

export default router;

