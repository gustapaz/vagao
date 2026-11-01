import { html, reactive } from "@arrow-js/core";
import { gsap } from "gsap";
import { model } from "./model";
import { motionToggle } from "./client";
const s = reactive({ v: 0 });
let catalog: any,
  paused = false,
  tl: gsap.core.Timeline | undefined;
const clock = (m: number) =>
  String(Math.floor(m / 60)).padStart(2, "0") +
  ":" +
  String(m % 60).padStart(2, "0");
const a = model(
  "vagao",
  () => s.v++,
  (r) => {
    requestAnimationFrame(() => paint(r));
  },
);
const d = a.d;
const station = (id: string) =>
  d.catalog?.stations.find((x: any) => x.id === id)?.name ?? id;
function drawBase() {
  if (catalog === d.catalog) return;
  catalog = d.catalog;
  const ns = "http://www.w3.org/2000/svg",
    create = (tag: string, attrs: any, parent: Element) => {
      const e = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
      parent.append(e);
      return e;
    };
  const base = document.querySelector("#map-base")!,
    labels = document.querySelector("#map-stations")!;
  base.replaceChildren();
  labels.replaceChildren();
  const st = catalog.stations;
  [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
    [3, 5],
    [4, 5],
    [0, 4],
  ].forEach(([i, j]) => {
    create(
      "line",
      {
        x1: st[i].x * 9 + 30,
        y1: st[i].y * 3,
        x2: st[j].x * 9 + 30,
        y2: st[j].y * 3,
        stroke: "#c9cebd",
        "stroke-width": 3,
      },
      base,
    );
  });
  st.forEach((x: any) => {
    create(
      "circle",
      {
        cx: x.x * 9 + 30,
        cy: x.y * 3,
        r: 6,
        fill: "#f6f0dc",
        stroke: "#173a29",
        "stroke-width": 3,
      },
      labels,
    );
    const text = create(
      "text",
      {
        x: x.x * 9 + 30,
        y: x.y * 3 + 27,
        "text-anchor": "middle",
        fill: "#173a29",
        "font-size": 16,
      },
      labels,
    );
    text.textContent = x.name;
  });
}
function paint(r: any) {
  if (!d.catalog) return;
  drawBase();
  const path = document.querySelector<SVGPathElement>("#selected-route")!,
    dot = document.querySelector<SVGCircleElement>("#train-dot")!;
  tl?.kill();
  const coords =
    r.segments
      ?.flatMap((seg: any, i: number) => [
        ...(i ? [] : [d.catalog.stations.find((v: any) => v.id === seg.from)]),
        d.catalog.stations.find((v: any) => v.id === seg.to),
      ])
      .map((v: any) => ({ x: v.x * 9 + 30, y: v.y * 3 })) ?? [];
  path.setAttribute(
    "d",
    coords
      .map((v: any, i: number) => (i ? "L" : "M") + v.x + "," + v.y)
      .join(" "),
  );
  dot.style.visibility = coords.length ? "visible" : "hidden";
  if (!coords.length) return;
  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: paused ? 0 : len });
  if (paused) {
    dot.setAttribute("cx", String(coords.at(-1).x));
    dot.setAttribute("cy", String(coords.at(-1).y));
    return;
  }
  const cursor = { progress: 0 };
  tl = gsap
    .timeline({ repeat: -1, repeatDelay: 1.8 })
    .to(path, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" })
    .to(
      cursor,
      {
        progress: 1,
        duration: 5,
        ease: "none",
        onUpdate: () => {
          const p = path.getPointAtLength(len * cursor.progress);
          dot.setAttribute("cx", String(p.x));
          dot.setAttribute("cy", String(p.y));
        },
      },
      0,
    );
}
const view = () => {
  s.v;
  return html`<div class="journey-app">
    ${() =>
      d.catalog
        ? html`<div class="route-form">
              <label
                >De<select
                  aria-label="Estação de origem"
                  .value="${d.input.origin}"
                  @change="${(e: Event) => a.change("origin", (e.target as HTMLSelectElement).value)}"
                >
                  ${d.catalog.stations.map((x: any) => html`<option value="${x.id}" selected="${x.id === d.input.origin}">${x.name}</option>`)}
                </select></label
              ><button
                class="swap"
                aria-label="Inverter origem e destino"
                @click="${() => {
                  const old = d.input.origin;
                  a.change("origin", d.input.destination);
                  a.change("destination", old);
                }}"
              >
                ⇄</button
              ><label
                >Até<select
                  aria-label="Estação de destino"
                  @change="${(e: Event) => a.change("destination", (e.target as HTMLSelectElement).value)}"
                >
                  ${d.catalog.stations.map((x: any) => html`<option value="${x.id}" selected="${x.id === d.input.destination}">${x.name}</option>`)}
                </select></label
              ><label
                >A partir de<input
                  aria-label="Horário de partida"
                  type="time"
                  value="${clock(d.input.depart)}"
                  @change="${(e: Event) => {
                    const t = (e.target as HTMLInputElement).value
                      .split(":")
                      .map(Number);
                    a.change("depart", t[0] * 60 + t[1]);
                  }}" /></label
              ><label
                >O que importa<select
                  aria-label="Prioridade"
                  @change="${(e: Event) => a.change("priority", (e.target as HTMLSelectElement).value)}"
                >
                  <option
                    value="arrival"
                    selected="${d.input.priority === "arrival"}"
                  >
                    Chegar antes
                  </option>
                  <option
                    value="transfers"
                    selected="${d.input.priority === "transfers"}"
                  >
                    Trocar menos
                  </option>
                </select></label
              ><button class="search" disabled="${d.busy}" @click="${a.run}">
                ${d.busy ? "Buscando…" : "Encontrar caminho ↗"}
              </button>
            </div>
            <div class="examples">
              ${d.catalog.presets.map((p: any) => html`<button disabled="${d.busy}" @click="${() => a.preset(p)}">${p.name} ↗</button>`)}
            </div>`
        : html`<button @click="${a.init}">Tentar carregar estações</button>`}
    <p role="status" class="status">${() => d.error || d.status}</p>
    ${() =>
      d.result
        ? d.result.found
          ? html`<div class="arrival">
              <div>
                <small>CHEGADA PREVISTA</small
                ><strong>${clock(d.result.arrival)}</strong
                ><span
                  >${d.result.total_minutes} min no caminho ·
                  ${d.result.transfers} troca(s)</span
                >
              </div>
              <ol>
                ${d.result.segments.map(
                  (r: any) =>
                    html`<li>
                      <span
                        >${clock(r.departure)}<small
                          >${station(r.from)}</small
                        ></span
                      ><b>${r.line}<i>→</i></b
                      ><span
                        >${clock(r.arrival)}<small
                          >${station(r.to)}</small
                        ></span
                      >
                    </li>`,
                )}
              </ol>
              <p>
                ${d.result.onboard_minutes} min a bordo<br />${d.result.waiting_minutes}
                min em espera<br />Trocas de pelo menos 8 min
              </p>
            </div>`
          : html`<div class="empty">
              <h3>Hoje, por aqui, não dá.</h3>
              <p>${d.result.reason}</p>
              <button @click="${() => a.change("depart", 420)}">
                Voltar às 07:00
              </button>
            </div>`
        : ""}
    <section class="ticket">
      <div>
        <span>GUARDE O CAMINHO</span
        ><label
          >Nome da viagem<input
            aria-label="Nome da viagem"
            maxlength="48"
            value="${() => d.title}"
            @input="${(e: Event) => a.title((e.target as HTMLInputElement).value)}" /></label
        ><button disabled="${() => d.busy || !d.result}" @click="${a.save}">
          ${() => (d.current && d.owns ? "Salvar alterações" : "Guardar viagem")}
          ↗
        </button>
      </div>
      <div class="ticket-tools">
        ${() => (d.current ? html`<button disabled="${d.busy}" @click="${() => a.open(d.current.id)}">Reler do banco</button><button disabled="${d.busy}" @click="${a.download}">Exportar JSON ↓</button>${d.owns ? html`<button disabled="${d.busy}" @click="${a.share}">${d.current.published ? "Encerrar link" : "Criar link"}</button>` : ""}<button @click="${a.fresh}">Nova viagem</button>` : "")}${() => (d.link ? html`<a href="${d.link}" target="_blank" rel="noreferrer">Abrir viagem compartilhada ↗</a>` : "")}
        <details>
          <summary>Bilhetes desta aba (${() => d.archive.length})</summary>
          ${() => d.archive.map((x: any) => html`<button @click="${() => a.open(x.id)}">${x.title} ↗</button>`)}
        </details>
        <small
          >Somente viagens imaginárias. Guardadas por 7 dias; edição nesta aba.
          Exportação da revisão salva.</small
        >
      </div>
    </section>
  </div>`;
};
const host = document.querySelector("#app-root")!;
host.replaceChildren();
html`${view}`(host);
motionToggle((v) => {
  paused = v;
  tl?.paused(v);
  if (d.result) paint(d.result);
});
a.init();
let scheduled = false;
window.addEventListener(
  "scroll",
  () => {
    if (scheduled || paused) return;
    scheduled = true;
    requestAnimationFrame(() => {
      const image = document.querySelector<HTMLElement>("#landscape");
      if (image)
        image.style.transform = `scale(1.12) translateY(${Math.min(45, scrollY * 0.055)}px)`;
      scheduled = false;
    });
  },
  { passive: true },
);
document.addEventListener("visibilitychange", () => {
  if (tl) tl.paused(document.hidden || paused);
});
if (new URL(location.href).searchParams.has("record"))
  document.querySelector("#planner")?.scrollIntoView();
