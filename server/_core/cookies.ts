export function getSessionCookieOptions(req: any): any {
  const forwardedProto = req?.headers ? req.headers["x-forwarded-proto"] : undefined;
  const isHttps = req?.protocol === "https" ||
    (typeof forwardedProto === "string" && forwardedProto.includes("https")) ||
    (Array.isArray(forwardedProto) && forwardedProto.some((p: string) => p.includes("https")));

  return {
    httpOnly: true,
    path: "/",
    sameSite: isHttps ? "none" : "lax",
    secure: isHttps,
  };
}
