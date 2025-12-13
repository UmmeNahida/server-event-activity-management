import Stripe from "stripe";
import dotenv from "dotenv";
import { envVars } from "../config/env";

dotenv.config();

export const stripe = new Stripe(envVars.STRIPE_PUBLISHABLE_SECRET_KEY as string);