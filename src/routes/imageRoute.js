import { Router } from "express";
import { upload } from "../utils/multer.js";
import { getImage,sendImage } from "../model/imageHnadler.js";
import express from"express"
const router = Router();
router.route("/upload/:id").post(upload.single("file"), getImage);
router.route("/download/:id/:fileName").get(express.static("images"), sendImage);
export default router 
