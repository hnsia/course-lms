import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import { revalidatePurchaseCache } from "./db/cache";

export async function insertPurchase(data: typeof PurchaseTable.$inferInsert) {
  const details = data.productDetails;

  const [newPurchase] = await db
    .insert(PurchaseTable)
    .values({
      ...data,
      productDetails: {
        name: details.name,
        description: details.description,
        imageUrl: details.imageUrl,
      },
    })
    .onConflictDoNothing()
    .returning();

  if (newPurchase != null) revalidatePurchaseCache(newPurchase);

  return newPurchase;
}
