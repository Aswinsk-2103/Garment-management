import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { createContext } from "../server/_core/context";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use((req: any, res: any, next: any) => {
  if (req.url.startsWith("/api/trpc")) {
    req.url = req.url.replace("/api/trpc", "");
  } else if (req.url.startsWith("/trpc")) {
    req.url = req.url.replace("/trpc", "");
  } else if (req.url.startsWith("/api")) {
    req.url = req.url.replace("/api", "");
  }
  if (!req.url.startsWith("/")) {
    req.url = "/" + req.url;
  }
  next();
});

registerStorageProxy(app);
registerOAuthRoutes(app);

app.use(
  "/",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default function handler(req: any, res: any) {
  return app(req, res);
}
