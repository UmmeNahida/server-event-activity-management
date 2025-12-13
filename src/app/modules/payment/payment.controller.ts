import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import { stripe } from "../../helper/stripe";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";


const handleStripeWebhookEvent = catchAsync(async(req:Request,res:Response, next:NextFunction)=>{

    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = envVars.Stripe_Webhook_Scret as string; 

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
         res.status(400).send(`Webhook Error: ${err.message}`);
         return
    }
    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Webhook req send successfully',
        data: result,
    });
});

export const PaymentController = {
    handleStripeWebhookEvent
}