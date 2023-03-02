import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { connection } from "./db/dbconnect.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { router } from "./router.js";

const app = express();
const port = process.env.PORT || 3000;
connection();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/elearn", router);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`ELearn API listening on port ${port}`);
});
