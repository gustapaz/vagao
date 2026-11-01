import { createRouter, addRoute, findRoute } from "rou3";
import { service } from "./service.mjs";
import { routeTable } from "./routes.mjs";
import { guarded } from "./transport.mjs";
import { fail } from "./errors.mjs";
export function createApi(db, clock) {
  const router = createRouter();
  for (const [method, path, handler] of routeTable(db, service, clock))
    addRoute(router, method, path, handler);
  return guarded((req) => {
    const u = new URL(req.url);
    if (u.search) fail("invalid_query", "Sem parâmetros de URL.", 400);
    const match = findRoute(router, req.method, u.pathname);
    if (!match) fail("not_found", "Endpoint não encontrado.", 404);
    return match.data(req, match.params ?? {});
  });
}
