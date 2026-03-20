import app from "./app";
import { envVars } from "./config/env";
import { Server } from "http";

let server: Server;

const shutdownServer = (reason: string, error?: unknown) => {
    if (error) {
        console.error(reason, error);
    } else {
        console.error(reason);
    }

    if (server) {
        server.close(() => {
            console.log("HTTP server closed.");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

process.on("uncaughtException", (error) => {
    shutdownServer("Uncaught Exception detected. Shutting down server...", error);
});

process.on("unhandledRejection", (reason) => {
    shutdownServer("Unhandled Rejection detected. Shutting down server...", reason);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received. Closing server gracefully...");
    if (server) {
        server.close(() => {
            console.log("Server closed successfully.");
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

const main = () => {
    try {
        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT} in ${envVars.NODE_ENV} mode`);
        });
    } catch (error) {
        shutdownServer("Failed to start server:", error);
    }
};
 
main();