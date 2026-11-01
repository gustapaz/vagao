# Arquitetura

Modo integrado: ArrowJS e GSAP consome Rou3 e ArkType na mesma origem. SSR entrega conteúdo editorial, imagens, metadados e navegação. ClientBoot monta o bundle após a hidratação do documento para evitar conflito entre runtimes.

`server/service.mjs`: domínio, validação e exportador. `api.mjs`: router próprio da stack. `routes.mjs`: operações. `store.mjs`: D1, revisão, autorização e TTL. `transport.mjs`: corpo limitado e erros padronizados.

Seis estações, 112 serviços de um dia abstrato. Busca de caminhos simples com até cinco trechos e oito minutos mínimos de conexão. Ordenação por chegada ou trocas, desempate estável. Não são viagens reais.

Cada registro possui UUID, receita JSON, digest SHA-256 de token de 256 bits, revisão e timestamps UTC. UPDATE condicional por revisão impõe CAS. Contador atômico limita criações por hora UTC. Exclusão só do próprio recurso. Cliente guarda no máximo doze capacidades por aba e nunca as põe no URL.



Testes de integração usam Miniflare e migrações reais em diretório temporário. Smoke cria e remove somente seu próprio registro sintético. Não há reset público ou operação administrativa no cliente.
