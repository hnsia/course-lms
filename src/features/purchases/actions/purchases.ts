"use server";

import { currentUser } from "@clerk/nextjs/server";
import { canRefundPurchases } from "../permissions/purchases";
import { getCurrentUser } from "@/services/clerk";
import { stripeServerClient } from "@/services/stripe/stripeServer";
import { db } from "@/drizzle/db";
import { getPurchaseIdTag } from "../db/cache";
import { updatePurchase } from "../db/purchases";

export async function refundPurchase(id: string) {
  if (!canRefundPurchases(await getCurrentUser())) {
    return {
      error: true,
      message: "There was an error refunding this purchase",
    };
  }

  db.transaction(async (trx) => {
    const refundedPurchase = await updatePurchase(
      id,
      { refundedAt: new Date() },
      trx
    );

    const session = await stripeServerClient.checkout.sessions.retrieve(
      refundedPurchase.stripeSessionId
    );

    if (session.payment_intent == null) {
      trx.rollback();
      return {
        error: true,
        message: "There was an error refunding this purchase",
      };
    }

    try {
      await stripeServerClient.refunds.create({
        payment_intent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id,
      });
    } catch {
      trx.rollback();
      return {
        error: true,
        message: "There was an error refunding this purchase",
      };
    }
  });
}
