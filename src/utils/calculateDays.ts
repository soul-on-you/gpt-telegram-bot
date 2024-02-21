export function calculateDays(createdAt: Date): number {
  const delta = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(delta);
}
