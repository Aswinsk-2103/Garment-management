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

app.use(
  ["/api/trpc", "/trpc"],
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use((req: any, res: any) => {
  res.status(404).json({ error: "API Route Not Found", url: req.url });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error("[Vercel API Error]", err);
  res.status(500).json({ error: err?.message || String(err), stack: err?.stack });
});

export default app;
