import { Router } from "express";
import { upload } from "../utils/multer.js"; // Assuming your multer setup is correct
import { getImage, sendImage } from "../model/imageHandler.js";

const router = Router();

// Image upload route, specifying the user and project
router.route("/upload/:userId/:projectName").post(upload.single("file"), getImage);

// Image download route, specifying user, project, and file name with query params for transformations
router.route("/download/:userId/:projectName/:fileName").get(sendImage);

export default router;

