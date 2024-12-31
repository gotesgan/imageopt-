import { Router } from "express";

import{ createUserAndFolder} from "../model/userhanderl.js";

const router = Router();

router.route("/create").post(createUserAndFolder);

export default router