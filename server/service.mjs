import { type } from "arktype";
import { fail } from "./errors.mjs";
const schema = type({
  origin: "string",
  destination: "string",
  depart: "number.integer",
  priority: "'arrival' | 'transfers'",
}).onUndeclaredKey("reject");
export const stations = [
  { id: "aurora", name: "Aurora", x: 8, y: 62 },
  { id: "serra", name: "Serra Alta", x: 30, y: 23 },
  { id: "vale", name: "Vale do Sol", x: 35, y: 78 },
  { id: "campo", name: "Campo Verde", x: 61, y: 56 },
  { id: "porto", name: "Porto Claro", x: 84, y: 24 },
  { id: "mar", name: "Mar de Dentro", x: 94, y: 76 },
];
const lines = [
  ["aurora", "serra", 55],
  ["aurora", "vale", 35],
  ["serra", "campo", 40],
  ["vale", "campo", 35],
  ["campo", "porto", 45],
  ["campo", "mar", 65],
  ["porto", "mar", 35],
  ["aurora", "porto", 190],
];
export const trains = lines.flatMap(([from, to, duration], i) => [
  ...Array.from({ length: 7 }, (_, k) => ({
    id: "L" + i + "A" + k,
    from,
    to,
    departure: 420 + k * 100 + (i % 3) * 12,
    arrival: 420 + k * 100 + (i % 3) * 12 + duration,
    line: "L" + (i + 1),
  })),
  ...Array.from({ length: 7 }, (_, k) => ({
    id: "L" + i + "B" + k,
    from: to,
    to: from,
    departure: 455 + k * 100 + (i % 3) * 12,
    arrival: 455 + k * 100 + (i % 3) * 12 + duration,
    line: "L" + (i + 1),
  })),
]);
export const meta = {
  slug: "vagao",
  title: "VAGÃO",
  engine: "rou3-arktype-timetable",
  headline: "O caminho também é destino.",
  default_input: {
    origin: "aurora",
    destination: "mar",
    depart: 500,
    priority: "arrival",
  },
  stations,
  presets: [
    {
      name: "Até o mar",
      input: {
        origin: "aurora",
        destination: "mar",
        depart: 500,
        priority: "arrival",
      },
    },
    {
      name: "Menos trocas",
      input: {
        origin: "aurora",
        destination: "porto",
        depart: 500,
        priority: "transfers",
      },
    },
    {
      name: "Sem pressa",
      input: {
        origin: "serra",
        destination: "vale",
        depart: 680,
        priority: "arrival",
      },
    },
  ],
  note: "Estações, horários e serviços são fictícios. Minutos de um dia abstrato; não são bilhetes, disponibilidade ou orientação de viagem real.",
};
export function validate(input) {
  const r = schema(input);
  if (
    r instanceof type.errors ||
    !stations.some((s) => s.id === r.origin) ||
    !stations.some((s) => s.id === r.destination) ||
    r.origin === r.destination ||
    r.depart < 0 ||
    r.depart > 1439
  )
    fail(
      "invalid_input",
      "Escolha duas estações distintas e um horário válido.",
    );
  return r;
}
export function solve(input, timetable = trains) {
  const p = validate(input),
    found = [];
  function visit(at, time, path, visited) {
    if (at === p.destination) {
      found.push(path);
      return;
    }
    if (path.length >= 5) return;
    for (const train of timetable) {
      if (
        train.from !== at ||
        visited.has(train.to) ||
        train.departure < time + (path.length ? 8 : 0)
      )
        continue;
      visit(
        train.to,
        train.arrival,
        [...path, train],
        new Set([...visited, train.to]),
      );
    }
  }
  visit(p.origin, p.depart, [], new Set([p.origin]));
  found.sort((a, b) => {
    const arrival = a.at(-1).arrival - b.at(-1).arrival,
      transfers = a.length - b.length;
    return (
      (p.priority === "arrival"
        ? arrival || transfers
        : transfers || arrival) ||
      a
        .map((t) => t.id)
        .join()
        .localeCompare(b.map((t) => t.id).join())
    );
  });
  if (!found.length)
    return {
      found: false,
      segments: [],
      reason: "Nenhuma conexão neste dia. Tente um horário anterior.",
      options_examined: 0,
    };
  const best = found[0],
    arrival = best.at(-1).arrival,
    onboard = best.reduce((s, t) => s + t.arrival - t.departure, 0);
  return {
    found: true,
    segments: best,
    arrival,
    departure: best[0].departure,
    total_minutes: arrival - p.depart,
    onboard_minutes: onboard,
    waiting_minutes: arrival - p.depart - onboard,
    transfers: best.length - 1,
    minimum_connection: 8,
    options_examined: found.length,
  };
}
export const compute = solve;
export function exportResult(input) {
  return {
    type: "application/json; charset=utf-8",
    extension: "json",
    text: JSON.stringify(
      { fictional: true, input, journey: solve(input) },
      null,
      2,
    ),
  };
}
export const service = { meta, validate, compute, export: exportResult };
