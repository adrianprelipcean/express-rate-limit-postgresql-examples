import express from "express";
const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).json({ status: true, msg: "Express.js router" });
});

export default router;
