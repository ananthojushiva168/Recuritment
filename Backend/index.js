import dotenv from "dotenv";
dotenv.config();

import Express from "express";
import colors from "colors";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = Express();

//@ Cloudinary credentials for file upload
import cloudinary from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//@ Database connection and Port
import { DBconnection } from "./config/DBconnection.js";
DBconnection();
let port = process.env.PORT || 8080;
const v1api = "/api/v1";

//@ express middlewares
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

//? Importing Base Router
import routes from "./routes/base.router.js";

//? Using Router
app.use(v1api, routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`.cyan.bold);
});
