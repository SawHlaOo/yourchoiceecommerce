import express from "express";
import { router as usersRouter } from "./users.js";
import { router as productsRouter } from "./products.js";
import { router as featureFlagsRouter } from "./featureFlags.js";
import { router as commerceRouter } from "./commerce.js";

export const apiRouter = express.Router();

apiRouter.get("/", (_req, res) => {
	res.json({ status: "Digitalshop API v1 running..." });
});

apiRouter.use(usersRouter);
apiRouter.use(productsRouter);
apiRouter.use(featureFlagsRouter);
apiRouter.use(commerceRouter);