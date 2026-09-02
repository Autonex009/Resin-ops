import { getDb } from "@resin-ops/db";
import { plants } from "@resin-ops/db/schema";

async function main() {
  const db = getDb();

  await db
    .insert(plants)
    .values([{ code: "DMP1", name: "Dahej" }])
    .onConflictDoNothing();

  console.log("Seeded plants.");
}

main().then(() => process.exit(0));
