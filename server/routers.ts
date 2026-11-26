import { router } from "./_core/trpc";
import { ongsRouter, adminAuthRouter, ongAuthRouter } from "./routers/ongs";

export const appRouter = router({
  ongs: ongsRouter,
  adminAuth: adminAuthRouter,
  ongAuth: ongAuthRouter,
});

export type AppRouter = typeof appRouter;
