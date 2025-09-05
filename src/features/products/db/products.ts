import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateProductCache } from "./cache";

export async function insertProduct(
  data: Partial<typeof ProductTable.$inferInsert> & { courseIds: string[] }
) {}

export async function updateProduct(
  id: string,
  data: Partial<typeof ProductTable.$inferInsert> & { courseIds: string[] }
) {}

export async function deleteProduct(id: string) {
  const [deletedProduct] = await db
    .delete(ProductTable)
    .where(eq(ProductTable.id, id))
    .returning();

  if (deletedProduct == null) throw new Error("Failed to delete product");

  revalidateProductCache(deletedProduct.id);

  return deletedProduct;
}
