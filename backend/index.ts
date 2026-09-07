import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { isDatabaseConfigured, prisma } from "./lib/prisma.js";
import { apiRouter } from "./routes/api.js";
import { apiLimiter } from "./middlewares/rateLimit.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const port = Number(process.env.PORT || 8800);

// Vercel sits behind a proxy. Trusting its first proxy makes rate limiting use
// the visitor's IP instead of the proxy's shared IP address.
if (process.env.VERCEL) {
  app.set("trust proxy", 1);
}


const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Digitalshop API",
    version: "1.0.0",
    description: "Digitalshop backend API documentation",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 8800}/api/v1`,
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean" },
          error: { type: "string" },
        },
      },
      SuccessResponse: {
        type: "object",
        required: ["success"],
        properties: {
          success: { type: "boolean" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: { type: "string", minLength: 1 },
          password: { type: "string", minLength: 1 },
        },
      },
      RegistrationRequest: {
        type: "object",
        required: ["name", "username", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1 },
          username: { type: "string", minLength: 3 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          bio: { type: "string" },
          role: { type: "string", enum: ["USER"], default: "USER" },
        },
      },
      ProductRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1 },
          description: { type: "string" },
          image: { type: "string", format: "uri" },
          logo: { type: "string", format: "uri" },
          badge: { type: "string" },
        },
      },
      ProductUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
          description: { type: "string" },
          image: { type: "string", format: "uri" },
          logo: { type: "string", format: "uri" },
          badge: { type: "string" },
        },
      },
      FeatureFlagRequest: {
        type: "object",
        required: ["key"],
        properties: {
          key: { type: "string", minLength: 2 },
          enabled: { type: "boolean" },
          description: { type: "string" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
          bio: { type: "string", nullable: true },
          avatar: { type: "string", nullable: true },
          role: { type: "string", enum: ["USER", "ADMIN", "SELLER"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          user: { $ref: "#/components/schemas/User" },
          token: { type: "string" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          image: { type: "string" },
          badge: { type: "string", nullable: true },
          logo: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      FeatureFlag: {
        type: "object",
        properties: {
          id: { type: "integer" },
          key: { type: "string" },
          enabled: { type: "boolean" },
          description: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      FeatureFlagResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean" },
          data: { $ref: "#/components/schemas/FeatureFlag" },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        summary: "API health check",
        responses: {
          200: {
            description: "API status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/login": {
      post: {
        summary: "Authenticate a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                },
                required: ["username", "password"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Authenticated user and token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/register": {
      post: {
        summary: "Deprecated registration endpoint",
        description: "Use POST /users instead. This endpoint is retained for compatibility.",
        deprecated: true,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegistrationRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "New user created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          409: { description: "Username or email already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/users": {
      post: {
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  username: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                  bio: { type: "string" },
                  role: { type: "string", enum: ["USER", "ADMIN"] },
                },
                required: ["name", "username", "email", "password"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "New user created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/verify": {
      get: {
        summary: "Verify the current JWT and return user details",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Verified user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/users/{id}": {
      delete: {
        summary: "Delete an existing user",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "User deleted successfully",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" } } },
              },
            },
          },
          403: {
            description: "Admin access required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/games": {
      get: {
        summary: "List games",
        responses: {
          200: {
            description: "List of games",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Product" } } } },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a game",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  image: { type: "string", format: "uri" },
                  logo: { type: "string", format: "uri" },
                  badge: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created game",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } } },
              },
            },
          },
        },
      },
    },
    "/games/{id}": {
      get: {
        summary: "Get a game by ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Game details",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } } },
              },
            },
          },
          404: {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        summary: "Update a game",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  image: { type: "string", format: "uri" },
                  logo: { type: "string", format: "uri" },
                  badge: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated game",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } } },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete a game",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Game deleted",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/game/{id}": {
      get: {
        summary: "Deprecated singular game endpoint",
        description: "Use GET /games/{id} instead. This endpoint is retained for compatibility.",
        deprecated: true,
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          200: {
            description: "Game details",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } } } } },
          },
          400: { description: "Invalid game ID", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "Game not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/apps": {
      get: {
        summary: "List apps",
        responses: {
          200: {
            description: "List of apps",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Product" } } } },
              },
            },
          },
        },
      },
      post: {
        summary: "Create an app",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  image: { type: "string", format: "uri" },
                  logo: { type: "string", format: "uri" },
                  badge: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created app",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } } },
              },
            },
          },
        },
      },
    },
    "/apps/{id}": {
      patch: {
        summary: "Update an app",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  image: { type: "string", format: "uri" },
                  logo: { type: "string", format: "uri" },
                  badge: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated app",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } } },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete an app",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "App deleted",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/powerpoints": {
      get: {
        summary: "List powerpoints",
        responses: {
          200: {
            description: "List of powerpoints",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Product" } } } },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a powerpoint",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  image: { type: "string", format: "uri" },
                  logo: { type: "string", format: "uri" },
                  badge: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created powerpoint",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } } },
              },
            },
          },
        },
      },
    },
    "/powerpoints/{id}": {
      patch: {
        summary: "Update a powerpoint",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  image: { type: "string", format: "uri" },
                  logo: { type: "string", format: "uri" },
                  badge: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated powerpoint",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Product" } } },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete a powerpoint",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Powerpoint deleted",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/feature-flags": {
      get: {
        summary: "List feature flags",
        responses: {
          200: {
            description: "List of feature flags",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/FeatureFlag" } } } },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a feature flag",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  enabled: { type: "boolean" },
                  description: { type: "string" },
                },
                required: ["key"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created feature flag",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/FeatureFlag" } } },
              },
            },
          },
        },
      },
    },
    "/feature-flags/{key}": {
      get: {
        summary: "Get feature flag by key",
        parameters: [{ name: "key", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Feature flag details",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/FeatureFlag" } } },
              },
            },
          },
          404: {
            description: "Feature flag not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        summary: "Update a feature flag",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "key", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  enabled: { type: "boolean" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated feature flag",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/FeatureFlag" } } },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete a feature flag",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "key", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Feature flag deleted",
            content: {
              "application/json": {
                schema: { type: "object", properties: { success: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/dev/feature-flags": {
      post: {
        summary: "Create a feature flag in development",
        description: "Available only when NODE_ENV is not production.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/FeatureFlagRequest" } } },
        },
        responses: {
          201: { description: "Feature flag created", content: { "application/json": { schema: { $ref: "#/components/schemas/FeatureFlagResponse" } } } },
          400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/dev/feature-flags/{key}": {
      patch: {
        summary: "Update a feature flag in development",
        description: "Available only when NODE_ENV is not production.",
        parameters: [{ name: "key", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/FeatureFlagRequest" } } },
        },
        responses: {
          200: { description: "Feature flag updated", content: { "application/json": { schema: { $ref: "#/components/schemas/FeatureFlagResponse" } } } },
          400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      delete: {
        summary: "Delete a feature flag in development",
        description: "Available only when NODE_ENV is not production.",
        parameters: [{ name: "key", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Feature flag deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } } },
          400: { description: "Unable to delete feature flag", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
  },
};

app.use(helmet());
const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [
  "http://localhost:5173",
  "https://ecommerce-y4lw.vercel.app",
  ...configuredOrigins,
];

app.use(cors({
  origin: (origin, callback) => {
    const allowedLocalhost = /^http:\/\/localhost:\d+$/;
    if (!origin || allowedOrigins.includes(origin) || (!process.env.VERCEL && allowedLocalhost.test(origin))) {
      callback(null, true);
    } else {
      const error = new Error("CORS origin not allowed") as Error & { status?: number };
      error.status = 403;
      callback(error);
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get("/swagger", (_req, res) => res.redirect("/docs/"));
app.get("/swagger/", (_req, res) => res.redirect("/docs/"));
app.get("/swagger-ui", (_req, res) => res.redirect("/swagger-ui/"));
app.get("/swagger-ui/", swaggerUi.setup(openApiDocument));
app.get("/swagger-ui/index.html", swaggerUi.setup(openApiDocument));
app.use("/swagger-ui", swaggerUi.serve);
app.get("/swagger.json", (_req, res) => res.json(openApiDocument));
app.get("/docs.json", (_req, res) => res.json(openApiDocument));

app.get("/", (_req, res) => {
  res.json({ status: "Digitalshop API running..." });
});

// Liveness probe — simple check the server is running
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok' }));

// Readiness probe — verify DB connectivity (and Redis if configured)
app.get('/ready', async (_req, res) => {
  try {
    if (!isDatabaseConfigured) {
      return res.status(503).json({ ready: false, error: 'DATABASE_URL is not configured' });
    }
    // simple DB check
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({ ready: true });
  } catch (err) {
    console.error('[ready] db check failed', err);
    return res.status(503).json({ ready: false, error: 'db unavailable' });
  }
});

app.use("/api/v1", apiRouter);

app.use(errorHandler);

export default app;

// Vercel imports the exported app as a serverless function. Only create a
// listening server when this module is executed directly for local development.
if (!process.env.VERCEL) {
  const server = app.listen(port, () => {
    console.log(`Digitalshop API running at ${port}...`);
  });

  async function shutdown(signal: string) {
    console.log(`Received ${signal}, shutting down...`);
    try {
      await prisma.$disconnect();
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => {
        console.error('Forcing shutdown');
        process.exit(1);
      }, 10000).unref();
    } catch (err) {
      console.error('Error during shutdown', err);
      process.exit(1);
    }
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
