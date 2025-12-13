import http, { Server } from "http"
import app from "./app";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";

dotenv.config();

let server: Server | null = null;


async function connectToDB() {
    try{
        await prisma.$connect();
        console.log("DB connected")
    }catch(err:any){
        console.log("DB connection Err:",err)
    }
}

async function startServer() {
    try {
        await connectToDB()
        server = http.createServer(app);
        server.listen(process.env.PORT, () => {
            console.log(`Example app listening on port ${process.env.PORT}`)
        })

         // Function to gracefully shut down the server
        const exitHandler = () => {
            if (server) {
                server.close(() => {
                    console.log('Server closed gracefully.');
                    process.exit(1); // Exit with a failure code
                });
            } else {
                process.exit(1);
            }
        };

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (error) => {
            console.log('Unhandled Rejection is detected, we are closing our server...');
            if (server) {
                server.close(() => {
                    console.log(error);
                    process.exit(1);
                });
            } else {
                process.exit(1);
            }
        });
    } catch (err: any) {
        console.log("server Err:", err);
        process.exit(1);
    }
}

startServer()