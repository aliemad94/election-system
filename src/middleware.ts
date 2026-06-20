// ====================================================================
// Middleware — تُصدّر proxy function لحماية API Routes
// Next.js يبحث عن هذا الملف تلقائياً في src/middleware.ts
// ====================================================================

export { proxy as middleware } from "./proxy";
export { config } from "./proxy";
