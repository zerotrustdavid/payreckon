import { NextResponse } from "next/server";

// Forces this to prerender once, at build time, rather than recompute per
// request. That is the whole point of a build-time Expires: a build that
// goes stale has to say so, rather than a live clock quietly keeping the
// date looking current.
export const dynamic = "force-static";

const EXPIRES = (() => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 300);
  return expires.toISOString();
})();

const BODY = [
  "Contact: mailto:david@invisionsolutions.co.uk",
  `Expires: ${EXPIRES}`,
  "Policy: https://github.com/zerotrustdavid/payreckon/blob/main/SECURITY.md",
  "Preferred-Languages: en",
].join("\n");

export function GET() {
  return new NextResponse(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
