import ClientBoot from "./client-boot";
export default function Home() {
  return (
    <>
      <a className="skip" href="#planner">
        Ir para escolher o caminho
      </a>
      <header>
        <a className="brand" href="/">
          VAGÃO<span>companhia de caminhos imaginários</span>
        </a>
        <a href="#about">Por onde vamos ↓</a>
      </header>
      <main>
        <section className="departure">
          <div className="departure-top">
            <span>EMBARQUE / QUALQUER LUGAR</span>
            <span>UM DIA FORA DO ROTEIRO</span>
          </div>
          <h1>
            Deixe o mundo
            <br />
            <em>passar pela janela.</em>
          </h1>
          <div className="window-frame">
            <img
              id="landscape"
              src="/media/viaduct.webp"
              width="1400"
              height="933"
              alt="Viaduto ferroviário atravessando uma paisagem verde real"
              fetchPriority="high"
            />
            <div className="window-glare" />
            <span>
              06 ESTAÇÕES
              <br />
              INFINITAS VONTADES DE IR
            </span>
          </div>
          <p className="intro">
            Nem sempre o mais rápido é o melhor caminho.
            <br />
            Escolha como prefere chegar.
          </p>
          <a className="boarding" href="#planner">
            Escolher meu caminho <span>↓</span>
          </a>
        </section>
        <section id="planner" className="station">
          <div className="station-label">
            <span>QUADRO DE PARTIDAS</span>
            <span>REDE IMAGINÁRIA · DIA ÚNICO</span>
          </div>
          <div id="app-root">
            <p>Preparando o quadro de partidas…</p>
          </div>
          <div className="map-wrap">
            <svg
              id="rail-map"
              viewBox="0 0 1000 340"
              role="img"
              aria-label="Mapa das seis estações fictícias; o itinerário também está na lista de trechos"
            >
              <g id="map-base" />
              <path
                id="selected-route"
                fill="none"
                stroke="#ef602d"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle id="train-dot" r="9" fill="#ef602d" />
              <g id="map-stations" />
            </svg>
            <span>UM MAPA PARA IMAGINAR. NÃO PARA COMPRAR PASSAGENS.</span>
          </div>
        </section>
        <section className="slow" id="about">
          <div className="slow-image">
            <img
              src="/media/window.webp"
              alt="Vista real da paisagem pela janela de um trem"
              width="1400"
              height="933"
              loading="lazy"
            />
          </div>
          <div>
            <span>O INTERVALO TAMBÉM CONTA</span>
            <h2>
              Chegar é só
              <br />
              uma parte
              <br />
              <em>da viagem.</em>
            </h2>
            <p>
              Às vezes, vale esperar. Nossa rede imaginária encontra as conexões
              possíveis, respeita o tempo de troca e deixa você decidir entre
              chegar antes ou mudar menos de trem.
            </p>
            <p>
              Estações e horários são fictícios. Nenhum bilhete é vendido aqui.
            </p>
            <a href="#planner">Voltar ao quadro ↗</a>
          </div>
        </section>
      </main>
      <footer>
        <strong>VAGÃO</strong>
        <p>Uma experiência de Gustavo Paz.</p>
        <a href="/api-docs.html">A rede por dentro ↗</a>
        <a href="https://github.com/gustapaz/vagao">Código e créditos ↗</a>
        <small>Fotografias: alleksana e Robert Schwarz / Pexels.</small>
        <button id="motion-toggle" aria-pressed="false">
          Pausar movimento
        </button>
      </footer>
      <ClientBoot />
    </>
  );
}
