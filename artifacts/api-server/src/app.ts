import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";
import { getUserIdFromToken } from "./lib/auth-tokens";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required.");
}

const app: Express = express();

// Trust the Replit reverse proxy so Express sees HTTPS and sets secure cookies correctly.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Allow the Replit preview domain and any explicitly configured production domain.
// Falling back to a broad allowlist (origin: true) is not acceptable because it
// enables cross-origin authenticated requests from arbitrary sites.
const allowedOrigins = new Set<string>();
if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOrigins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}
if (process.env.REPLIT_DOMAINS) {
  // REPLIT_DOMAINS is a comma-separated list of production domains.
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const trimmed = domain.trim();
    if (trimmed) allowedOrigins.add(`https://${trimmed}`);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin header) and same-origin requests.
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      callback(new Error(`CORS: origin not allowed: ${origin}`));
    },
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie-free auth fallback: if the request carries an X-Auth-Token header
// (set by the frontend when cookies are blocked in the Replit preview iframe),
// inject the userId into the session so downstream handlers work normally.
app.use((req, _res, next) => {
  const token = req.headers["x-auth-token"] as string | undefined;
  if (token && !req.session.userId) {
    const userId = getUserIdFromToken(token);
    if (userId !== undefined) {
      req.session.userId = userId;
    }
  }
  next();
});

app.use("/api", router);

export default app;
