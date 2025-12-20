import dotenv from "dotenv";

dotenv.config();

interface IEnvVars {
    PORT: string,
    DATABASE_URL: string,
    NODE_ENV: string,
    JWT_SECRET: string,
    JWT_EXPIRES_IN: string,
    JWT_REFRESH_SECRET: string,
    JWT_EXPIRES_IN_REFRESH: string,
    RESET_PASS_TOKEN: string,
    RESET_PASS_TOKEN_EXPIRES_IN: string,
    SALT_ROUND: string,
    STRIPE_PUBLISHABLE_KEY: string,
    STRIPE_PUBLISHABLE_SECRET_KEY: string,
    Stripe_Webhook_Scret: string,
    CLOUDINARY_CLOUD_NAME: string,
    CLOUDINARY_API_KEY: string,
    CLOUDINARY_API_SECRET: string,
    FRONTEND_BASE_URL:string

}

const loadEnvVars = (): IEnvVars => {
    const requiredEnvVars: string[] = ["PORT", "DATABASE_URL", "NODE_ENV", "JWT_SECRET", "JWT_EXPIRES_IN", "JWT_REFRESH_SECRET", "JWT_EXPIRES_IN_REFRESH", "RESET_PASS_TOKEN", "RESET_PASS_TOKEN_EXPIRES_IN", "SALT_ROUND",
        "STRIPE_PUBLISHABLE_KEY", "STRIPE_PUBLISHABLE_SECRET_KEY", "Stripe_Webhook_Scret",
        "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET","FRONTEND_BASE_URL"
    ]

    requiredEnvVars.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable ${key}`)
        }
    })

    return {
        PORT: process.env.port as string,
        DATABASE_URL: process.env.DATABASE_URL!,
        NODE_ENV: process.env.NODE_ENV as string,
        JWT_SECRET: process.env.JWT_SECRET as string,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_EXPIRES_IN_REFRESH: process.env.JWT_EXPIRES_IN_REFRESH as string,
        RESET_PASS_TOKEN: process.env.RESET_PASS_TOKEN as string,
        RESET_PASS_TOKEN_EXPIRES_IN: process.env.RESET_PASS_TOKEN_EXPIRES_IN as string,
        SALT_ROUND: process.env.SALT_ROUND as string,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY as string,
        STRIPE_PUBLISHABLE_SECRET_KEY: process.env.STRIPE_PUBLISHABLE_SECRET_KEY as string,
        Stripe_Webhook_Scret: process.env.Stripe_Webhook_Scret as string,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
        FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL as string

    }
}
export const envVars = loadEnvVars()