import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * Every asset this site serves is same origin. Fonts are self hosted by
 * next/font at build time rather than fetched from Google, and all imagery is
 * local, so nothing here needs a third party origin except the feedback form.
 *
 * connect-src is the directive that matters most: it is deliberately narrow,
 * allowing exactly one external host, and it is what the /feedback page needs
 * in order to reach Web3Forms. Narrowing it further, or forgetting to list
 * that host, silently breaks form submission while every page still renders.
 *
 * script-src keeps 'unsafe-inline'. Removing it means a nonce, a nonce means
 * middleware, and middleware would force every route to render dynamically,
 * which would trade the site's fully static profile for a hardening win it
 * cannot really bank while inline hydration data is still emitted. The
 * directives that actually blunt injection here are object-src, base-uri,
 * form-action and frame-ancestors, and those are all locked down.
 *
 * 'unsafe-eval' is development only, where the dev server needs it for hot
 * reloading. It is never sent in production.
 */
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.web3forms.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // frame-ancestors above covers modern browsers; this is the older equivalent.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Stops Next advertising itself in every response.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
