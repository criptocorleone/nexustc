# Briefing: novo site da Nexus TC (nexustc.com.br)

Este documento é a fonte de verdade do projeto. Leia inteiro antes de escrever qualquer código. Quando algo aqui conflitar com uma suposição sua, este documento vence. Quando faltar informação, pergunte em vez de inventar.

## 1. Contexto

- **Empresa:** Nexus TC. Descrição oficial, usada literalmente em meta description da home, schema Organization e rodapé: "Consultoria especializada em tráfego e conversão pelo Google: SEO, Google Ads e CRO."
- A Nexus é uma **consultoria**, nunca uma "agência". Não use essa palavra em nenhum lugar.
- **Fundador e autor de todos os artigos:** Ricardo Zago.
- **Três serviços:** SEO, Google Ads e CRO. O site atual também tem uma página de serviço de "sites", que deixa de ser serviço (ver seção 6).
- **Site atual:** nexustc.com.br, feito no Lovable (React SPA com prerender). O novo site substitui o atual por completo e precisa preservar o SEO já conquistado.
- **Objetivo do site:** gerar contatos qualificados (WhatsApp e formulário) e ser a prova viva do serviço. Como vendemos SEO, o próprio site precisa ser tecnicamente exemplar.

## 2. Público

A Nexus atende empresas no Brasil e nos Estados Unidos. Todo o conteúdo é em português. Não crie páginas voltadas ao público dos EUA nesta fase, apenas mencione "Atendemos empresas no Brasil e nos Estados Unidos" no rodapé e na página Sobre.

Segmentos, na ordem de ênfase:

| Segmento | Slug provisório | Peso na home | Texto base |
|---|---|---|---|
| Startups e SaaS B2B | /segmentos/startups-e-saas | Destaque | Startups com produto no ar e clientes pagantes que precisam de um canal de aquisição previsível além da indicação. |
| Empresas Web3 | /segmentos/web3 | Destaque | Fintechs cripto, plataformas de tokenização e PSAVs. SEO e CRO para ser encontrado por quem pesquisa, e Google Ads dentro das regras de certificação do Google. |
| Indústria e Manufatura | /segmentos/industria | Padrão | Fabricantes de máquinas, peças, injeção plástica, caldeiras e matérias-primas. |
| Logística e Infraestrutura | /segmentos/logistica | Padrão | Transporte de carga, galpões, importação e exportação. |
| Distribuidores | /segmentos/distribuidores | Padrão | Distribuidoras de aço, ferro e suprimentos em atacado. |
| Escolas e Educação | /segmentos/escolas | Padrão | Escolas particulares e cursos que disputam matrícula. Os pais pesquisam no Google na hora de escolher, e a gente trabalha para sua escola aparecer nessa busca. |

Regras para o segmento Web3:
- A Nexus vende apenas SEO, Google Ads e CRO para empresas Web3. Nunca oferece estratégia, tokenização, tokenomics, regulação ou compliance.
- Não mencione nenhuma outra empresa ou marca do fundador.
- A página explica com honestidade que anúncios de cripto no Google exigem certificação e autorização local, e que por isso SEO e CRO costumam ser o núcleo do trabalho, com Ads para quem é elegível.

## 3. Stack e regras técnicas

- **Framework:** Astro, versão estável mais recente, `output: 'static'`.
- **Zero JavaScript no cliente por padrão.** Menu mobile com `<details>`, hover e animações em CSS. O único JS permitido na primeira carga é o envio do formulário (pequeno, inline). Analytics carrega depois (seção 11).
- **Estilo:** CSS puro. Os arquivos `src/styles/tokens.css` e `src/styles/components.css` já estão no projeto e são a base visual. Não use Tailwind, nem biblioteca de componentes, nem CSS-in-JS.
- **Conteúdo:** content collection `blog` em Markdown/MDX com schema validado (zod): `title`, `description`, `pubDate`, `updatedDate`, `category` (`seo` | `google-ads` | `cro`), `author` (padrão `ricardo-zago`), `cover` opcional, `faq` opcional (lista de pergunta e resposta).
- **Fontes:** Geist e Geist Mono (licença OFL), self-hosted em woff2 em `public/fonts`, só os pesos declarados em `components.css`. Preload apenas da Geist 500 (a do H1).
- **Imagens:** `astro:assets`, AVIF/WebP, sempre com `width` e `height`, `loading="lazy"` abaixo da dobra.
- **Integrações:** `@astrojs/sitemap` e `@astrojs/mdx`. Nada além disso sem me perguntar.
- **Hospedagem:** Vercel, deploy estático. Redirects em `vercel.json`.
- **Ambiente de homologação:** enquanto a variável `PUBLIC_SITE_ENV` não for `production`, toda página sai com `<meta name="robots" content="noindex, nofollow">` e o `robots.txt` bloqueia tudo.
- **Barra final nas URLs:** siga o padrão do site atual (confirme no inventário da seção 6) e configure `trailingSlash` de acordo.

**Metas de performance** (Lighthouse mobile, build de produção):
- Performance, Acessibilidade, Boas práticas e SEO: todas ≥ 95.
- LCP < 1,8 s, CLS < 0,05.
- 0 KB de JavaScript de framework na primeira carga.

## 4. Design system

A base visual segue um padrão próprio, com referência de layout limpo e fundo granulado. Tudo já está implementado em `components.css`. Transforme cada bloco em um componente `.astro` usando exatamente essas classes:

| Componente | Classes principais | Observação |
|---|---|---|
| Layout base | `.ds-page`, `.ds-shell` | Fundo pontilhado fora do container, container de 1200px com hairlines laterais |
| Topbar | `.ds-topbar` | Desligada por padrão; ativável por prop |
| Header | `.ds-header`, `.ds-logo`, `.ds-nav` | Nav: SEO, Google Ads, CRO, Segmentos, Blog. CTAs: "Ver serviços" (secundário) e "Falar com especialista" (primário) |
| Botões | `.ds-btn--primary`, `.ds-btn--secondary`, `.ds-link-arrow` | Um primário por área visível |
| Rótulos | `.ds-label`, `.ds-chip` | Mono, caixa alta, substantivos curtos |
| Hero | `.ds-hero`, `.ds-feature` + `.ds-grain` | Único `h1` da página |
| Números | `.ds-stats`, `.ds-stat` | Só números verificáveis |
| Card granulado | `.ds-card`, `.ds-card__bg.ds-grain` | Neutro em repouso, grão roxo no hover e no foco |
| Autor | `.ds-author`, `.ds-avatar` | Em todo artigo |

Regras visuais:
- O gradiente granulado (`.ds-grain`) aparece em três lugares e só neles: card de destaque do hero, cards no hover e avatar do autor. Nos dois segmentos em destaque, o card já nasce com o grão ativo (classe `is-active`).
- Sem emojis, sem ícones coloridos, sem sombras. Separação por hairline.
- Sem ilustrações ou imagens de banco.
- Logo: por enquanto, texto "Nexus TC" com o marcador `.ds-logo__mark`. Deixe o componente pronto para receber um SVG depois.
- Todas as cores vêm de `tokens.css`. Não crie cores novas.
- Foco visível em tudo que é clicável. Respeite `prefers-reduced-motion`.
- Mobile first de verdade: teste em 375px, 768px e 1280px.

## 5. Arquitetura de páginas (fase 1)

Os slugs abaixo são provisórios. Se o inventário da seção 6 mostrar uma URL atual para a mesma página, **a URL atual vence**.

- `/` home
- 3 páginas de serviço: SEO, Google Ads, CRO
- `/segmentos/` (índice) e as 6 páginas de segmento da seção 2
- `/blog/` (listagem com filtro por categoria via páginas estáticas `/blog/categoria/[categoria]/`) e `/blog/[slug]/`
- `/autor/ricardo-zago/`
- `/sobre/`
- `/contato/`
- `/privacidade/`
- `404`

Fora desta fase: páginas de cidade e migração completa do blog (fase 2). Nenhuma página da fase 1 vai para produção antes da migração completa.

## 6. Primeira tarefa: inventário de URLs

Antes de criar qualquer página:

1. Leia `https://nexustc.com.br/sitemap.xml` e `https://nexustc.com.br/robots.txt`.
2. Gere `docs/inventario-urls.csv` com as colunas: `url_atual`, `tipo` (home, servico, cidade, blog, institucional, outro), `destino_novo`, `acao` (`manter`, `301`, `decidir`), `observacao`.
3. Regras de preenchimento:
   - Toda URL atual precisa ter um destino. Nenhuma pode virar 404.
   - Páginas de serviço de SEO, Google Ads e CRO: `manter` na mesma URL.
   - Página de serviço de sites: `decidir`.
   - Páginas de cidade: `manter` (serão reconstruídas na fase 2).
   - Artigos do blog: `manter` na mesma URL.
4. Pare e me mostre o inventário junto com o plano de arquivos do projeto. Só siga depois da minha aprovação.

## 7. Home

Ordem das seções:

1. **Header**
2. **Hero:** rótulo "SEO · Google Ads · CRO"; H1 proposto "Tráfego e conversão pelo Google, com dados na mesa."; subtítulo com a descrição oficial e "para empresas no Brasil e nos Estados Unidos"; CTAs "Falar com especialista" e "Ver serviços". O card granulado à direita aponta para o artigo pilar mais recente do blog.
3. **Números:** "25+ anos em tecnologia", "3 frentes integradas", "0 meses de fidelidade".
4. **Serviços:** três cards (SEO, Google Ads, CRO), cada um com uma frase sobre o que entrega e link com o nome do serviço como texto do link.
5. **Segmentos:** os dois em destaque em cards grandes com grão ativo; os quatro padrão em cards neutros menores. Cada card leva à página do segmento.
6. **Como trabalhamos:** quatro etapas numeradas (diagnóstico, plano, execução, acompanhamento). Aqui a numeração é permitida porque é uma sequência real.
7. **Artigos recentes:** três cards granulados vindos da collection `blog`.
8. **Quem conduz:** faixa curta com foto, nome e duas linhas de credenciais do Ricardo, e link para a página de autor.
9. **CTA final + contato:** botão de WhatsApp e formulário (seção 11).
10. **Rodapé:** descrição oficial, links para serviços, segmentos e institucionais, a frase sobre Brasil e EUA, e o link de privacidade.

## 8. Página de serviço (modelo)

- H1 com o nome do serviço e o resultado que ele busca.
- Para quem é (com links para os segmentos).
- O que entregamos, em entregáveis concretos.
- Como trabalhamos.
- O que não prometemos: posição garantida no Google, número garantido de leads, citação garantida em IA.
- Modelo comercial: sem fidelidade, preço transparente e verba de mídia separada do honorário.
- FAQ com schema `FAQPage`.
- CTA.
- Reaproveite o texto atual das páginas de serviço do site (extraia do HTML de produção), ajustando às regras da seção 12. Meta: 1.000 a 1.400 palavras por página.

## 9. Página de segmento (modelo)

- H1 específico do segmento.
- Como o público desse segmento pesquisa no Google.
- Quais dos três serviços se aplicam e por quê.
- Erros comuns do segmento.
- FAQ e CTA.
- Cada página precisa ter ângulo e estrutura próprios. Não use o mesmo template de texto trocando só o nome do segmento: o site atual já foi penalizado por duplicação nas páginas de cidade.

## 10. Blog e E-E-A-T

- Todo artigo é assinado por Ricardo Zago. `AuthorBox` curto logo abaixo do título (nome, datas) e completo no fim.
- Datas de publicação e atualização visíveis, e iguais às do schema.
- Schema `Article` (ou `BlogPosting`) com `author` apontando para `https://nexustc.com.br/autor/ricardo-zago/#person`.
- A página `/autor/ricardo-zago/` tem schema `Person` com esse mesmo `@id`, `sameAs` para `https://ricardozago.com` e foto real (arquivo [PREENCHER]).
- Bio para a página de autor: "Ricardo Zago é fundador da Nexus TC. Tem mais de 25 anos em tecnologia, com passagens por Whirlpool, Accenture e BASF, e trabalha na interseção entre dados, tecnologia e marketing. É professor na FIAP e mentor de startups na Rock New Ventures e na ACE Ventures."
- Nesta fase, migre apenas um artigo existente, na mesma URL, para validar o template.
- Card de artigo: o texto do link é o título do artigo. Nunca "Saiba mais" ou "Leia mais".

## 11. SEO técnico, conversão e rastreamento

SEO:
- `title` e `meta description` únicos por página.
- Canonical absoluto em todas as páginas.
- Open Graph e Twitter Card, com imagem OG padrão 1200×630 ([PREENCHER]).
- `BreadcrumbList` em páginas internas, `Organization` na home, `Service` em cada página de serviço.
- Um único `h1` por página e hierarquia de headings sem saltos.
- `lang="pt-BR"` em todas as páginas.
- Sitemap sem as páginas `noindex`.
- Linkagem interna: blog aponta para serviços, serviços apontam para segmentos, e vice-versa.

Conversão:
- **WhatsApp:** link `https://wa.me/[PREENCHER]` com mensagem pré-preenchida que identifica a página de origem.
- **Formulário:** campos nome, empresa, e-mail, WhatsApp, segmento (select com os 6) e mensagem. Envio via `fetch` para o endpoint em `PUBLIC_FORM_ENDPOINT`. Não escolha serviço de formulário sem me perguntar. Estados de sucesso e erro claros, sem recarregar a página.
- **Eventos:** dispare `whatsapp_click` e `form_submit` no `dataLayer`.
- **Tags:** GA4 e Google Ads (IDs em variáveis de ambiente, [PREENCHER]) carregadas só após a primeira interação do usuário ou 3 s depois do `load`, o que vier primeiro. As conversões atuais de WhatsApp e formulário precisam continuar funcionando.

## 12. Regras de copy

- Português do Brasil, frases curtas e diretas, voz ativa.
- Palavras proibidas: "soluções", "alavancar", "sinergia", "agência".
- Sem travessão (—). Use ponto, vírgula ou dois-pontos.
- Sem promessa de resultado.
- Nada em inglês além de termos técnicos consagrados (SEO, CRO, Google Ads, SaaS).
- Nunca descreva a Nexus como "especializada em captação de alunos".
- Não invente números, depoimentos, clientes, logos ou cases. Onde faltar dado real, use [PREENCHER].

## 13. Forma de trabalho

Execute em etapas e pare para aprovação ao final de cada uma:

1. Inventário de URLs + plano de arquivos.
2. Setup do projeto, layout base e componentes.
3. Home.
4. Páginas de serviço.
5. Páginas de segmento.
6. Blog, autor e artigo migrado.
7. Revisão final: SEO técnico, Lighthouse e acessibilidade.

Em cada etapa: rode o build, mostre prints em 375px e 1280px, e liste os [PREENCHER] pendentes.

## 14. Critérios de aceite da fase 1

- [ ] `docs/inventario-urls.csv` aprovado, sem nenhuma URL atual órfã.
- [ ] Build estático sem erros e sem JS de framework no cliente.
- [ ] Lighthouse mobile ≥ 95 nas quatro categorias em home, uma página de serviço, uma de segmento e o artigo migrado.
- [ ] Schemas válidos no Rich Results Test (Organization, Service, BreadcrumbList, Article, Person, FAQPage).
- [ ] `noindex` ativo fora de produção.
- [ ] Nenhuma palavra proibida, nenhum travessão, nenhum número inventado (verificar com busca no repositório).
- [ ] Formulário e WhatsApp disparando eventos no `dataLayer`.
