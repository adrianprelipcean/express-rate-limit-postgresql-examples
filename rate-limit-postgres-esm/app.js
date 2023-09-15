import express from "express";
import userRoutes from "./routes/userRoutes.js";
import rateLimit from "express-rate-limit";
import {PostgresStore} from "@acpr/rate-limit-postgresql";
import {PostgresStoreIndividualIP} from "@acpr/rate-limit-postgresql";

let databaseConnection = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT)
}


const aggregatedRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message:
      'Too many accounts created from this IP, please try again after 15 minutes',
    standardHeaders: 'draft-7', // Set `RateLimit` and `RateLimit-Policy`` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new PostgresStore(
      databaseConnection,
      'aggregated_store'
    ), // Use an external store for more precise rate limiting
  })
  
  
  const individualRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message:
      'Too many accounts created from this IP, please try again after 15 minutes',
    standardHeaders: 'draft-7', // Set `RateLimit` and `RateLimit-Policy`` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new PostgresStoreIndividualIP(
      databaseConnection,
      'individual_store'), // Use an external store for more precise rate limiting
  })
  
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', aggregatedRateLimiter, userRoutes);
app.use('/other-users', individualRateLimiter, userRoutes);

const port = process.env.PORT || 3000;

app.get("/", (req, res, next) => {
  res
    .status(200)
    .json({ status: true, msg: "Welcome ES6 with Node ESM Liabrary" });
});

// Handles 404 errors
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
});

// Handles global errors
app.use((err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "" : err.stack
  });
});

app.listen(port, () => {
    console.log(`Server started on ${port}`);
  });
  