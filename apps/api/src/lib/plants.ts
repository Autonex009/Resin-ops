import { getDb } from "@resin-ops/db";
import { plants } from "@resin-ops/db/schema";

export async function listPlants() {
  const db = getDb();
  return db.select().from(plants).orderBy(plants.code);
}
