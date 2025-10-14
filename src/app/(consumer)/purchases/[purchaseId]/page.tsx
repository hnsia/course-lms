import { LoadingSpinner } from "@/components/LoadingSpinner";
import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import { getPurchaseIdTag } from "@/features/purchases/db/cache";
import { getCurrentUser } from "@/services/clerk";
import { stripeServerClient } from "@/services/stripe/stripeServer";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function PurchasesPage({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  const { purchaseId } = await params;
  return (
    <div className="container my-6">
      <Suspense fallback={<LoadingSpinner className="size-36 mx-auto" />}>
        <SuspenseBoundary purchaseId={purchaseId} />
      </Suspense>
    </div>
  );
}

async function SuspenseBoundary({ purchaseId }: { purchaseId: string }) {
  const { userId, redirectToSignIn, user } = await getCurrentUser({
    allData: true,
  });
  if (userId == null || user == null) return redirectToSignIn();

  const purchase = await getPurchase({ userId, id: purchaseId });

  if (purchase == null) return notFound();

  const { receiptUrl, pricingRows } = await getStripeDetails(
    purchase.stripeSessionId,
    purchase.pricePaidInCents,
    purchase.refundedAt != null
  );
}

function getPurchase({ userId, id }: { userId: string; id: string }) {
  "use cache";
  cacheTag(getPurchaseIdTag(id));

  return db.query.PurchaseTable.findFirst({
    columns: {
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
      stripeSessionId: true,
    },
    where: and(eq(PurchaseTable.id, id), eq(PurchaseTable.userId, userId)),
  });
}

async function getStripeDetails(
  stripeSessionId: string,
  pricePaidInCents: number,
  isRefunded: boolean
) {
  const { payment_intent, total_details, amount_total, amount_subtotal } =
    await stripeServerClient.checkout.sessions.retrieve(stripeSessionId, {
      expand: [
        "payment_intent.latest_charge",
        "total_details.breakdown.discounts",
      ],
    });

  const refundAmount =
    typeof payment_intent !== "string" &&
    typeof payment_intent?.latest_charge !== "string"
      ? payment_intent?.latest_charge?.amount_refunded
      : isRefunded
      ? pricePaidInCents
      : undefined;

  return {
    receiptUrl: getReceiptUrl(payment_intent),
    pricingRows: getPricingRows(total_details, {
      total: (amount_total ?? pricePaidInCents) - (refundAmount ?? 0),
      amount_subtotal: amount_subtotal ?? pricePaidInCents,
      refund: refundAmount,
    }),
  };
}
