/**
 * ServiZen Backend Server
 *
 * Main server entry point with graceful shutdown handling and error management.
 * Handles HTTP server lifecycle, process signals, and uncaught exceptions.
 */

import app from "./app";
import { envVars } from "./config/env";
import { Server } from "http";

// Global server instance for graceful shutdown
let server: Server;

/**
 * Gracefully shuts down the server with proper logging
 * @param reason - Reason for shutdown
 * @param error - Optional error object for logging
 */
const shutdownServer = (reason: string, error?: unknown): void => {
    // Log the shutdown reason and error if provided
    if (error) {
        console.error(`🚨 ${reason}`, error);
    } else {
        console.error(`🚨 ${reason}`);
    }

    // Close server gracefully if it exists
    if (server) {
        server.close(() => {
            console.log("✅ HTTP server closed gracefully.");
            process.exit(1);
        });

        // Force exit after 10 seconds if server doesn't close gracefully
        setTimeout(() => {
            console.error("⚠️  Forced shutdown after timeout.");
            process.exit(1);
        }, 10000);
    } else {
        process.exit(1);
    }
};

/**
 * Handle uncaught exceptions
 * These are synchronous errors that weren't caught by try-catch
 */
process.on("uncaughtException", (error: Error) => {
    shutdownServer("Uncaught Exception detected. Shutting down server...", error);
});

/**
 * Handle unhandled promise rejections
 * These are asynchronous errors that weren't caught by .catch()
 */
process.on("unhandledRejection", (reason: unknown) => {
    shutdownServer("Unhandled Rejection detected. Shutting down server...", reason);
});

/**
 * Handle SIGTERM signal for graceful shutdown
 * Usually sent by process managers like PM2 or Kubernetes
 */
process.on("SIGTERM", (): void => {
    console.log("📡 SIGTERM received. Initiating graceful shutdown...");

    if (server) {
        server.close(() => {
            console.log("✅ Server closed successfully via SIGTERM.");
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

/**
 * Main server startup function
 * Initializes the HTTP server and handles startup errors
 */
const main = (): void => {
    try {
        // Validate required environment variables
        if (!envVars.PORT || !envVars.NODE_ENV) {
            throw new Error("Missing required environment variables: PORT or NODE_ENV");
        }

        // Start the server
        server = app.listen(envVars.PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${envVars.PORT} in ${envVars.NODE_ENV} mode`);
            console.log(`📊 Environment: ${envVars.NODE_ENV}`);
            console.log(`🔌 Port: ${envVars.PORT}`);
        });

        // Handle server startup errors
        server.on("error", (error: Error) => {
            shutdownServer("Server startup failed:", error);
        });

    } catch (error) {
        shutdownServer("Failed to start server:", error);
    }
};

// Start the application
main();