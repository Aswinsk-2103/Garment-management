export default function handler(req: any, res: any) {
  res.status(200).json({ message: "Vercel API Working!", url: req.url });
}
