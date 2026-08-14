import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { createContext } from "../server/_core/context";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

app.use("/api/trpc", trpcMiddleware);
app.use("/trpc", trpcMiddleware);

app.use((req, res, next) => {
  if (req.url.includes("trpc") || req.originalUrl.includes("trpc")) {
    return trpcMiddleware(req, res, next);
  }
  next();
});

export default app;
