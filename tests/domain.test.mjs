import { test } from "node:test";
import assert from "node:assert/strict";
import { service, solve } from "../server/service.mjs";
const input = {
  origin: "aurora",
  destination: "porto",
  depart: 400,
  priority: "arrival",
};
const timetable = [
  { id: "direct", from: "aurora", to: "porto", departure: 410, arrival: 600 },
  { id: "a", from: "aurora", to: "serra", departure: 420, arrival: 450 },
  { id: "b", from: "serra", to: "porto", departure: 458, arrival: 490 },
];
test("earliest arrival can prefer a connection", () => {
  const r = solve(input, timetable);
  assert.deepEqual(
    r.segments.map((t) => t.id),
    ["a", "b"],
  );
  assert.equal(r.arrival, 490);
  assert.equal(r.waiting_minutes + r.onboard_minutes, r.total_minutes);
});
test("fewest transfers prefers a slower direct train", () => {
  assert.equal(
    solve({ ...input, priority: "transfers" }, timetable).segments[0].id,
    "direct",
  );
});
test("minimum eight-minute connection enforced at boundary", () => {
  assert.equal(
    solve(
      input,
      timetable.map((t) => (t.id === "b" ? { ...t, departure: 457 } : t)),
    ).segments[0].id,
    "direct",
  );
});
test("late departure returns empty honestly", () => {
  assert.equal(service.compute({ ...input, depart: 1439 }).found, false);
});
test("default journeys use ordered compatible legs", () => {
  for (const p of service.meta.presets) {
    const r = service.compute(p.input);
    assert.equal(r.found, true);
    for (let i = 1; i < r.segments.length; i++) {
      assert.equal(r.segments[i].from, r.segments[i - 1].to);
      assert.ok(r.segments[i].departure >= r.segments[i - 1].arrival + 8);
    }
  }
});
test("invalid station equal endpoints and unknown fields rejected", () => {
  for (const p of [
    { ...input, destination: "unknown" },
    { ...input, destination: "aurora" },
    { ...input, depart: 1.5 },
    { ...input, extra: 1 },
  ])
    assert.throws(() => service.compute(p));
});
