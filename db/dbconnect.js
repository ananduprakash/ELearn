import { development } from "./knexfile.js";
import knex from "knex";

export const connection = knex(development);