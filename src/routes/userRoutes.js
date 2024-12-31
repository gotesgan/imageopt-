import { Router } from "express";
import { createUserAndFolder } from "../model/userHandler.js";

const router = Router();

// Route to create a user
router.route("/create").post(createUserAndFolder);

export default router;

