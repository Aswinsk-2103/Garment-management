import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { createContext } from "../server/_core/context";
import { appRouter } from "../server/routers";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default function handler(req: any, res: any) {
  return app(req, res);
}
