# Site Dani Alonso — atualização UI/UX e identidade visual

Projeto estático HTML/CSS/JavaScript com **10 páginas**, baseado no ZIP original enviado.

## Blog completo e painel administrativo

- A página `noticias.html` contém as 347 matérias históricas, com 459 imagens locais, busca e paginação.
- O painel de publicação está em `/admin` e exige PHP 8.1+ com `json`, `fileinfo` e `mbstring`.
- Não há senha padrão. Configure `DANI_CMS_SETUP_KEY` no servidor e acesse `/admin/setup.php` para criar o primeiro acesso.
- Em hospedagem compartilhada, copie `admin/config.local.example.php` para `admin/config.local.php` e substitua a chave de exemplo por uma sequência aleatória de pelo menos 32 caracteres.
- Use HTTPS em produção. O painel protege sessão, senha, formulários e uploads e bloqueia tentativas excessivas de login.

## Como executar

Abra `index.html` no navegador ou use um servidor HTTP estático. Para testar todas as rotas e o formulário, recomenda-se `python -m http.server 8000` e acessar `http://localhost:8000`. Não é necessário `npm install`.

## Atualizações feitas

- Identidade do guia: Navy `#1E3A5F`, azul `#284F7A`, areia `#EDE3D7`, gelo `#F8F7F4`, taupe `#C9B7A4` e paleta auxiliar de terracota, verde, dourado e blush.
- Tipografia **Montserrat** nos títulos, botões e texto, com pesos ExtraBold, SemiBold e Regular. Logotipo de texto recriado **aproximadamente** a partir da imagem de referência, pois não foi fornecido vetor original. Substitua pela marca vetorial oficial ao publicar.
- 8 retratos originais do Google Drive fornecido foram convertidos para WebP com redução de peso, recorte responsivo e ajustes leves; foto principal com `srcset` e carregamento prioritário.
- Hierarquia editorial, grid, espaçamento, menu desktop/mobile, foco de teclado, estados acessíveis, `prefers-reduced-motion`, links oficiais e galeria.
- Formulário **não possui backend**: agora abre WhatsApp oficial com mensagem pré-preenchida, mediante consentimento. O visitante precisa tocar em **Enviar** no próprio WhatsApp.
- Estatísticas numéricas sem fonte na home foram substituídas por pilares qualitativos, evitando declarações potencialmente incorretas.

## Estrutura

- `index.html` (home) e nove páginas internas.
- `assets/css/style.css`: estilos originais preservados.
- `assets/css/brand-refresh.css`: camada de identidade e UX nova, fácil de editar.
- `assets/images/*.webp`: imagens otimizadas; imagens jornalísticas originais são mantidas para preservar o contexto.
- `assets/js/main.js`: interatividade existente e melhorias do menu e contato.

## Pendências para publicação definitiva

1. Conferir redação, cargos, dados, números de projetos de lei, nomes, datas e canais institucionais com a equipe do mandato. O conteúdo original do ZIP foi majoritariamente preservado.
2. Disponibilizar o logotipo oficial em SVG/PNG de alta resolução para substituir o wordmark aproximado.
3. Se desejar enviar formulários para CRM, e-mail ou Google Sheets automaticamente, integrar endpoint real e política de privacidade/LGPD. **Não existe envio automático no pacote atual.**
4. Para notícias e eventos, substituir os recortes de telas pelas fotografias originais dos respectivos acontecimentos, quando disponibilizadas, evitando usar fotos de estúdio em contexto jornalístico.

## Fontes dos retratos

Pastas do Drive compartilhadas pela equipe: `1DJ-dUs7y5EQY1ptSieAQU7d98rdYokRR` e `1txe62kQwP9GjMV8iZ3Jk3OzjJ8CMnJtO`. Retratos 574, 588, 537, 480, 502, 416, 616, 570 do ensaio augusto_dani.


## Revisão de UI/UX V3 (outubro de 2026)
- Página inicial: uma única foto de Dani na biografia, sem miniatura flutuante.
- Cards Mulher Inteira e Método 21D: fotografias ampliadas e faces reenquadradas; etiquetas sem fundo.
- O Que Defendo: manifesto final redesenhado em formato de citação editorial discreta.
- Método 21D: manifesto reorganizado em duas colunas, com título menor e mensagem de destaque lateral.
- A Deputada e Mulher Inteira: citações mais suaves, com hierarquia reduzida.
- Ajustes para dispositivos menores: fontes fluidas, grades de uma coluna, imagens proporcionais, cartões e botões refinados.
- CSS de revisão anexado ao final de `assets/css/brand-refresh.css` para facilitar manutenção.
- Testar em servidor HTTP local (ex.: `python -m http.server 8000`) e revisar conteúdo antes da publicação.

- Correção dos cabeçalhos específicos de iniciativas em mobile: ação duplicada é ocultada para impedir rolagem horizontal.


## V5 — Correções de navegação e rodapé (26/10/2026)

- Iniciativas: dropdown abre ao passar o mouse no desktop, sem intervalo entre gatilho e submenu; continua acessível via clique e teclado.
- Menu mobile: atalhos existentes permanecem acessíveis por toque.
- Página autogoverno.html: faixa inferior com © 2026 Autogoverno e Clareza, propósito e liderança pessoal removida; demais links do rodapé preservados.
- Atualizações em assets/css/brand-refresh.css e assets/js/main.js afetam o menu em todas as páginas.


## V7 — Pente fino de UI/UX (16/11/2026)

Nenhuma seção, página ou ordem de conteúdo foi alterada. As correções ficam em `assets/css/ux-polish.css` (carregado por último em todas as páginas) e em pequenos ajustes pontuais de HTML/JS.

**Responsividade**
- Rolagem horizontal eliminada em telas de 320 px (busca de Projetos de Lei e cabeçalho do Mulher Inteira).
- Projetos de Lei: cards de destaque empilham imagem + texto no celular (antes o texto ficava espremido numa coluna estreita); painel de busca com padding menor e busca em largura total.
- Mulher Inteira: "Para quem é" passa a 1 coluna no celular; foto do topo não corta mais o rosto em tablet.
- Cartões com padding inline de 48–56 px (A Deputada, Início, O Que Defendo) ganham mais área útil no celular; títulos inline com tamanho fluido e entrelinha correta.
- Pilares da home (01/02/03) viram lista legível no celular (antes ~9 px em 3 colunas).
- Rodapé em 2 colunas no celular, reduzindo a rolagem.
- Modais de notícia/projeto com padding e botão de fechar adequados ao celular.

**Legibilidade e contraste (WCAG AA)**
- Texto de corpo nunca abaixo de 15 px no celular; etiquetas nunca abaixo de 11,5 px; menu desktop e barra superior maiores.
- Todos os pares de cor que reprovavam (datas das notícias, numeração dos pilares, etiquetas terracota, títulos dos canais de contato, assinaturas do rodapé) ajustados para ≥ 4,5:1. Resultado: 0 reprovações na auditoria automática.
- Entrelinha de títulos corrigida (títulos com estilo inline herdavam 1.7).

**Usabilidade / acessibilidade**
- Áreas de toque ≥ 40–44 px: links do rodapé, filtros, "Ver detalhes", "Ler justificativa", ações das bandeiras, menu mobile.
- Campos do formulário com 16 px (evita zoom automático no iPhone), `autocomplete` e teclado numérico no WhatsApp.
- Buscas de Notícias e Projetos: `type="search"`, rótulo acessível e busca sem diferenciar acentos ("saude" encontra "Saúde").
- Filtros com `aria-pressed` e contador de resultados anunciado a leitores de tela.
- Removidos os "•" soltos ao lado do Instagram no rodapé.

**Pendência que depende de material novo**
- Algumas fotos jornalísticas têm resolução menor que o espaço que ocupam em tablet/desktop (`dani-palco-mulher-inteira.jpg` 464 px, `mulher-inteira-auditorio.jpg` 745 px, `dani-trajetoria-construcao.jpg`, `dani-visita-fabrica.jpg`, `dani-capitao-augusto.jpg`). Substituir por versões com ≥ 1400 px de largura quando disponíveis.


## V8 — Ajustes solicitados (16/11/2026)

- **Títulos no celular:** as quebras de linha forçadas (`<br>`) dos títulos são ignoradas até 768 px; o texto flui naturalmente (ex.: "Todas as Notícias", "Mulher Inteira").
- **Home:** removidos os pilares 01/02/03 do topo; título do hero reduzido (máx. ~54 px no desktop, ~30–37 px no celular).
- **Projetos de Lei:** acervo agora traz as **97 proposituras** listadas no site antigo (danialonso.com.br/projetos-de-lei-aprovados), cada uma com data de apresentação e link para a ficha oficial na ALESP. Os textos editoriais já existentes foram preservados e unidos às respectivas proposituras. Dados em `assets/js/projetos-alesp.js` (fácil de atualizar). Novos filtros por tema, botão "Mostrar mais" (12 por vez) e números do painel atualizados (97 • 20 em 2025 • 28 em 2024 • 49 em 2023). O item 872/2024, arquivado a pedido antes da publicação, ficou de fora.
- **Página Mulher Inteira:** nova identidade visual do manual de marca 2.0 (Figma): logo horizontal oficial no cabeçalho e versão negativa no rodapé, símbolo como favicon, paleta Petróleo/Verde Profundo/Sálvia/Névoa/Bege/Terracota/Dourado/Creme, Lora Italic nos destaques e citações, sobrelinhas com traço dourado, ícones oficiais com forma névoa, ramo de folhas no hero e chamado final em Verde Profundo. Arquivos em `assets/images/mulher-inteira/` e `assets/css/mulher-inteira-idv.css` (aplicado só nesta página).


## V10 — Nova foto no topo da home (16/11/2026)

- Hero da home com fotografia em tela cheia: `assets/images/dani-hero-home.webp/.jpg` (desktop, 1920×800, com versão 1280 px) e `dani-hero-home-mobile.webp/.jpg` (celular, 800×1200). O navegador escolhe a versão certa automaticamente (`<picture>`), e a imagem certa é pré-carregada para cada tamanho de tela.
- Desktop/tablet: texto à esquerda sobre a área clara da foto, com véu suave para garantir leitura. Celular: texto no topo claro e a foto continua logo abaixo.
- Removidos o card arredondado com a foto antiga e o selo "Voz Forte do Interior Paulista".
- Página Mulher Inteira: título "Mulher Inteira" em uma linha e sem a curva terracota sob os destaques.
- Página "Quem é Dani Alonso" (a-deputada.html): topo com fotografia em tela cheia, versão escura — `dani-hero-quem-sou.webp/.jpg` (desktop) e `dani-hero-quem-sou-mobile.webp/.jpg` (celular), texto em tons claros sobre o fundo escuro.
- Página Autogoverno | Método 21D: topo com fotografia em tela cheia, versão quente — `dani-hero-autogoverno.webp/.jpg` (desktop) e `dani-hero-autogoverno-mobile.webp/.jpg` (celular), texto claro com véu marrom suave para leitura.
- Home: banner "Projetos aprovados" sem foto (texto à esquerda, botão claro à direita; empilhado no celular). Cards de iniciativas com novas fotos: `mulher-inteira-encontro.jpg` e `autogoverno-card.jpg`.
- Home › "Quem é a deputada": nova foto da Dani ao microfone no plenário (`dani-plenario-microfone.webp/.jpg`).
- A Deputada: novas fotos em Minha história, Mulher Inteira e Compromisso com o interior paulista, exibidas em proporção natural (sem cortar cabeças).
- O Que Defendo: topo com foto na tribuna da ALESP (`dani-hero-defendo`, com recorte vertical para o celular), carrossel com 5 fotos em "Um olhar especial pra quem mais precisa" e nova foto no bloco Mulher Inteira — todas em proporção original, sem cortes.
- Minhas Bandeiras: topo sem foto (apenas texto), links "Ver projetos…" removidos dos cards das bandeiras e foto do Mulher Inteira exibida inteira (proporção original).
- Mulher Inteira: novas fotos no topo (grupo no encontro), em Conceito & Essência e em Auditórios lotados (panorâmica), todas em proporção original.
- Galeria: arquivo completo com as 124 fotos do site antigo (filtro por ano, 24 por vez, lightbox com setas/teclado/deslizar). Dados em `assets/js/galeria-fotos.js`. **Para hospedar as fotos no próprio site**, rode `tools/baixar-fotos-galeria.ps1` (Windows) ou `tools/baixar-fotos-galeria.sh` (Mac/Linux): elas vão para `assets/images/galeria/`. Enquanto isso, o site carrega cada foto do endereço antigo automaticamente.
- V14: cards da home (Mulher Inteira / Método 21D) refeitos a partir das fotos em alta resolução — antes eram arquivos de 422 px esticados, por isso pareciam borrados. O Que Defendo ganhou foto vertical própria no celular. Método 21D: três novas imagens (caminho dourado, encontro, pilares) em proporção 4:5, sem cortes; foto do topo mantida.
- V15: logo oficial em todo o site (cabeçalho, menu do celular e rodapé de todas as páginas, inclusive Método 21D). O arquivo enviado era uma imagem de 114×76 px; foi redesenhada em vetor (`assets/images/logo-dani-alonso-navy.svg` para fundos claros e `logo-dani-alonso-branco.svg` para o rodapé). A página Mulher Inteira mantém a logo do movimento. Galeria: removido o bloco de 12 fotos em destaque; a página mostra só o arquivo completo.

## V16 — Segurança e desempenho (16/11/2026)

- Visual, textos e qualidade dos arquivos de imagem preservados; nenhuma imagem foi recomprimida nesta revisão.
- HTTPS obrigatório no painel fora do localhost, cookies seguros, sessões com expiração/renovação, CSRF, limitação de tentativas, resposta de login uniforme e senhas com Argon2id quando disponível.
- Upload de imagem validado por conteúdo real, dimensões e tamanho; execução de scripts bloqueada na pasta pública de uploads.
- Conteúdo histórico sanitizado antes da exibição e JavaScript inline removido, permitindo uma Política de Segurança de Conteúdo mais restritiva.
- Cabeçalhos de segurança, HSTS, bloqueio de listagem de diretórios e arquivos sensíveis configurados para Apache por meio dos arquivos `.htaccess`.
- Índice público das notícias reduzido de aproximadamente 1,5 MB para 245 KB; o conteúdo completo é carregado somente quando a matéria é aberta.
- Scripts carregados sem bloquear a renderização, compressão Brotli/Gzip e cache seletivo para arquivos estáticos. HTML, painel e índice de notícias não usam cache persistente.
- As 124 fotos originais da galeria foram armazenadas localmente, evitando a tentativa inicial com erro e uma segunda requisição ao site antigo.
- Consulte `SECURITY-DEPLOYMENT.md` antes de publicar.

## V17 — Administração multiusuário (16/11/2026)

- Nova página `admin/users.php`, acessível pelo link **Administradores** no painel.
- Cadastro de até 50 acessos individuais, sempre com e-mail único e senha forte.
- Perfis **Administrador** (publica e gerencia usuários) e **Editor** (somente publica).
- Alteração de senha encerra as sessões antigas daquele usuário.
- Administradores podem bloquear, reativar, alterar a permissão ou excluir acessos.
- O sistema impede o bloqueio ou a exclusão do próprio acesso e protege o último administrador ativo.
- A conta única já existente é migrada automaticamente para o novo formato, sem trocar sua senha.
- Cada nova matéria registra privadamente qual usuário realizou a publicação.
