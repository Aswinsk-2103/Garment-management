import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";

let appRouter: any = null;
let createContext: any = null;
let routerError: string | null = null;
let contextError: string | null = null;

try {
  const routerMod = await import("../server/routers");
  appRouter = routerMod.appRouter;
} catch (err: any) {
  console.error("Failed to import appRouter:", err);
  routerError = err?.stack || err?.message || String(err);
}

try {
  const ctxMod = await import("../server/_core/context");
  createContext = ctxMod.createContext;
} catch (err: any) {
  console.error("Failed to import createContext:", err);
  contextError = err?.stack || err?.message || String(err);
}

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

if (appRouter && createContext) {
  app.use(
    "/",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
} else {
  app.use("/", (req, res) => {
    res.status(500).json({
      error: "Router initialization failed",
      appRouterLoaded: !!appRouter,
      createContextLoaded: !!createContext,
      routerError,
      contextError,
    });
  });
}

export default function handler(req: any, res: any) {
  return app(req, res);
}
