// postgresql://ewaste_owner:5amFeLdc6Mfk@ep-shy-hill-a5kna5my.us-east-2.aws.neon.tech/ewaste?sslmode=require

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from './schema'

const sql = neon(process.env.DB_URL)
export const db = drizzle(sql, { schema }) // helps db interaction with entire application

