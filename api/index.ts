import { createContext } from "../server/_core/context";

export default async function handler(req: any, res: any) {
  try {
    const ctx = await createContext({ req, res } as any);
    res.status(200).json({ message: "Context created!", user: ctx.user });
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
