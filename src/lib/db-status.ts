export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function describeDbError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/relation .* does not exist/i.test(message)) {
    return "Database is connected but the schema hasn't been created yet. Run `npm run db:push`.";
  }
  return `Database query failed: ${message}`;
}
