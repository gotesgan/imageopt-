import express  from "express";
const app = express();
const port = process.env.port;
import dotenv from "dotenv";
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
dotenv.config({
	path: "./.env",
});


app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

import imagroute from"./routes/imageRoute.js";

app.use("/api/v1/image",imagroute)
import userroute from "./routes/userRoutes.js"
app.use("/api/v1/user", userroute);
import projectroute from "./routes/projectRoutes.js"
app.use("/api/v1/project", projectroute);