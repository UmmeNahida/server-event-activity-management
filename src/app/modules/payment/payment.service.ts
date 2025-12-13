import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import { PaymentStatus } from "@prisma/client";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      // console.log("sesscion from webhook:", session)

      const participantId = session.metadata?.participantId;
      const paymentId = session.metadata?.paymentId;

      await prisma.eventParticipant.update({
        where: {
          id: participantId,
        },
        data: {
          paid: true,
        },
      });

      await prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PaymentStatus.PAID,
          paymentGatewayData: session,
        },
      });

      console.log("web hook session", session);
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
};

export const PaymentService = {
  handleStripeWebhookEvent,
};
