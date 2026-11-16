/**
 * DANI ALONSO - DEPUTADA ESTADUAL
 * Script Global para Multi-Páginas, Filtros em Tempo Real, Lightbox e Modais
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initProjectsDatabase();
  initNewsSystem();
  initGalleryLightbox();
  initContactForm();
  initSecureModalControls();
});

function initSecureModalControls() {
  document.addEventListener('click', event => {
    const projectTrigger = event.target.closest('[data-project-id]');
    if (projectTrigger) window.openProjectModal?.(projectTrigger.dataset.projectId);

    const closeButton = event.target.closest('.modal-close-btn');
    if (closeButton?.closest('#newsModal')) window.closeNewsModal?.();
    if (closeButton?.closest('#projectModal')) window.closeProjectModal?.();

    if (event.target?.id === 'newsModal') window.closeNewsModal?.();
    if (event.target?.id === 'projectModal') window.closeProjectModal?.();
  });
}

/* ==========================================================================
   1. NAVBAR & MENU RESPONSIVO MOBILE
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.btn-mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-menu-drawer');
  const mobileBackdrop = document.querySelector('.mobile-menu-backdrop');
  const mobileClose = document.querySelector('.mobile-menu-close');
  const desktopDropdown = document.querySelector('.nav-dropdown');
  const desktopDropdownToggle = document.querySelector('.nav-dropdown-toggle');
  let lastFocus = null;

  window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 20), {passive:true});
  if (mobileDrawer) mobileDrawer.inert = true;

  function toggleMobile(open) {
    if (!mobileDrawer || !mobileBackdrop) return;
    if (open) lastFocus = document.activeElement;
    mobileDrawer.classList.toggle('open', open);
    mobileBackdrop.classList.toggle('open', open);
    mobileDrawer.inert = !open;
    mobileDrawer.setAttribute('aria-hidden', String(!open));
    mobileToggle?.setAttribute('aria-expanded', String(open));
    mobileToggle?.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu de navegação');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) mobileClose?.focus();
    else if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }
  mobileToggle?.addEventListener('click', () => toggleMobile(!mobileDrawer?.classList.contains('open')));
  mobileClose?.addEventListener('click', () => toggleMobile(false));
  mobileBackdrop?.addEventListener('click', () => toggleMobile(false));
  document.querySelectorAll('.mobile-nav-links .nav-link').forEach(link => link.addEventListener('click', () => toggleMobile(false)));
  // Desktop: abre por hover e permanece aberto até o cursor sair do item + submenu.
  // Em dispositivos touch, o clique mantém a alternativa de abrir/fechar.
  const hoverEnabled = window.matchMedia('(hover: hover) and (pointer: fine)');
  let lastInteractionWasPointer = false;
  desktopDropdown?.addEventListener('pointerdown', () => { lastInteractionWasPointer = true; });
  desktopDropdown?.addEventListener('keydown', () => { lastInteractionWasPointer = false; });
  function setDesktopDropdown(open) {
    if (!desktopDropdown) return;
    desktopDropdown.classList.toggle('menu-open', open);
    desktopDropdownToggle?.setAttribute('aria-expanded', String(open));
  }
  desktopDropdown?.addEventListener('mouseenter', () => {
    if (hoverEnabled.matches) setDesktopDropdown(true);
  });
  desktopDropdown?.addEventListener('mouseleave', () => {
    if (hoverEnabled.matches) {
      // Clicar no gatilho deixa o foco no link. Ao sair com mouse,
      // solta esse foco para não manter o :focus-within aberto para sempre.
      if (lastInteractionWasPointer && desktopDropdown.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      setDesktopDropdown(false);
    }
  });
  desktopDropdown?.addEventListener('focusin', () => setDesktopDropdown(true));
  desktopDropdown?.addEventListener('focusout', e => {
    if (!desktopDropdown.contains(e.relatedTarget)) setDesktopDropdown(false);
  });
  desktopDropdownToggle?.addEventListener('click', e => {
    e.preventDefault();
    setDesktopDropdown(hoverEnabled.matches ? true : !desktopDropdown.classList.contains('menu-open'));
  });
  document.addEventListener('click', e => {
    if (desktopDropdown && !desktopDropdown.contains(e.target)) {
      desktopDropdown.classList.remove('menu-open');
      desktopDropdownToggle?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (mobileDrawer?.classList.contains('open')) toggleMobile(false);
    desktopDropdown?.classList.remove('menu-open');
    desktopDropdownToggle?.setAttribute('aria-expanded', 'false');
    if (desktopDropdown?.contains(document.activeElement)) document.activeElement.blur();
    window.closeNewsModal?.();
    window.closeProjectModal?.();
  });
}

/* ==========================================================================
   2. ANIMAÇÕES SUAVES COM INTERSECTION OBSERVER
   ========================================================================== */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal-fade-up');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('active'));
  }
}

/* ==========================================================================
   3. BANCO DE DADOS & FILTROS DE PROJETOS DE LEI
   ========================================================================== */
const PROJETOS_DE_LEI = [
  {
    id: 'pl-18074',
    numero: 'Lei nº 18.074/2023',
    titulo: 'Saúde da mulher no climatério e na menopausa',
    categoria: 'Saúde',
    destaque: true,
    ano: '2023',
    resumo: 'Cria a Política Estadual de Conscientização e Atenção Integral à Saúde das Mulheres no Climatério e na Menopausa. Garante acolhimento, medicação e acompanhamento médico para milhões de mulheres paulistas.',
    detalhes: 'Essa lei histórica estabelece a obrigatoriedade do estado de São Paulo em garantir consultas ginecológicas especializadas, exames diagnósticos hormonais e densitometria óssea na rede do SUS, além de distribuição gratuita de medicamentos para controle dos sintomas severos do climatério.'
  },
  {
    id: 'pl-17838',
    numero: 'Lei nº 17.838/2023',
    titulo: 'Laudo médico com validade indeterminada para Diabetes Tipo 1',
    categoria: 'Saúde',
    destaque: true,
    ano: '2023',
    resumo: 'Quem tem Diabetes Tipo 1 sabe que é uma condição contínua. Essa lei torna o laudo válido por tempo indeterminado, acabando com a burocracia desumana para ter acesso a insulina e insumos.',
    detalhes: 'Antes dessa lei, famílias e pacientes precisavam enfrentar filas anuais apenas para renovar papeladas comprobatórias de uma condição genética/autoimune vitalícia. O projeto assegura dignidade e acesso ininterrupto ao tratamento.'
  },
  {
    id: 'pl-18359',
    numero: 'Lei nº 18.359/2025',
    titulo: 'Trecho da Rodovia SP-330 nomeado "Comunicador Silvio Santos"',
    categoria: 'Turismo',
    destaque: true,
    ano: '2025',
    resumo: 'Homenagem oficial na Rodovia Anhanguera (SP-330) no trecho entre a Capital e Jundiaí, onde fica a sede da emissora SBT, eternizando o maior comunicador da história do Brasil.',
    detalhes: 'Projeto protocolado com apoio da família de Silvio Santos e da população paulista, reconhecendo a história de superação e a alegria que Silvio Santos levou a lares de todo o país.'
  },
  {
    id: 'pl-1278',
    numero: 'PL nº 1278/2025',
    titulo: 'Criação do Selo "Cidade Mulher Paulista"',
    categoria: 'Mulheres',
    destaque: true,
    ano: '2025',
    resumo: 'Concedido anualmente aos municípios paulistas que se destacarem na implementação de políticas públicas voltadas ao combate à violência, proteção e empreendedorismo feminino.',
    detalhes: 'Incentiva prefeituras e câmaras a criarem casas-abrigo, salas lilás em delegacias, patrulhas especializadas e linhas de crédito para mães solo e empreendedoras.'
  },
  {
    id: 'pl-1285',
    numero: 'PL 1285/2025',
    titulo: 'Proteção à imagem e combate à dramatização precoce de crimes reais',
    categoria: 'Segurança',
    ano: '2025',
    resumo: 'Proíbe a produção e veiculação de obras audiovisuais que dramatizem crimes graves sem prévia e expressa autorização das vítimas ou seus representantes legais.',
    detalhes: 'Preserva a memória e o respeito aos familiares de vítimas de homicídios e violências hediondas contra o sensacionalismo de produções sem consentimento.'
  },
  {
    id: 'pl-1251',
    numero: 'PL 1251/2025',
    titulo: 'Institui o "Dia do Veterano do Instrutor do PROERD"',
    categoria: 'Segurança',
    ano: '2025',
    resumo: 'Reconhece o valor dos policiais militares que dedicaram suas vidas a educar e blindar crianças e adolescentes contra as drogas e a violência nas escolas.',
    detalhes: 'Valoriza os policiais educadores do Programa Educacional de Resistência às Drogas e à Violência do Estado de São Paulo.'
  },
  {
    id: 'pl-1133',
    numero: 'PL 1133/2025',
    titulo: 'Declara Panorama "Capital Estadual da Pesca Esportiva"',
    categoria: 'Turismo',
    ano: '2025',
    resumo: 'Fortalecimento do turismo regional no Rio Paraná, gerando emprego, hotelaria e renda no interior paulista.',
    detalhes: 'Ação que impulsiona o ecoturismo e atrai investimentos privados para o setor náutico e hoteleiro da região de Presidente Prudente e Panorama.'
  },
  {
    id: 'pl-1124',
    numero: 'PL 1124/2025',
    titulo: 'Institui o "Dia Estadual do Amendoim" no Calendário Oficial',
    categoria: 'Agricultura',
    ano: '2025',
    resumo: 'São Paulo é responsável por mais de 90% da produção nacional de amendoim. Homenagem e incentivo aos produtores rurais do interior.',
    detalhes: 'Fortalece feiras agroindustriais, o cooperativismo e o reconhecimento dos polos produtores de Tupã, Marília e Ribeirão Preto.'
  },
  {
    id: 'pl-1121',
    numero: 'PL 1121/2025',
    titulo: 'Denomina "Dr. Adib Habeb" o Ambulatório Médico de Especialidades (AME Marília)',
    categoria: 'Saúde',
    ano: '2025',
    resumo: 'Homenagem a um dos médicos mais dedicados da história de Marília no polo de saúde que atende toda a região.',
    detalhes: 'Reconhecimento oficial à memória de um profissional que salvou milhares de vidas na Alta Paulista.'
  },
  {
    id: 'pl-1091',
    numero: 'PL 1091/2025',
    titulo: 'Digitalização e interoperabilidade eletrônica do prontuário do SUS',
    categoria: 'Saúde',
    ano: '2025',
    resumo: 'Determina prontuário digital unificado com pulseira de identificação e tecnologia de leitura digital nos hospitais públicos do Estado.',
    detalhes: 'Evita erros de medicação, reduz o tempo de espera no pronto-atendimento e unifica exames realizados em diferentes cidades de SP.'
  },
  {
    id: 'pl-1057',
    numero: 'PL 1057/2025',
    titulo: 'Institui o "Dia Estadual das Provas Equestres"',
    categoria: 'Esportes',
    ano: '2025',
    resumo: 'Fomenta os esportes equestres, o bem-estar animal regulamentado e a cultura sertaneja que movimenta o PIB do interior.',
    detalhes: 'Valoriza os centros de treinamento, provas de tambor, laço e hipismo que empregam milhares de veterinários, tratadores e atletas.'
  },
  {
    id: 'pl-1056',
    numero: 'PL 1056/2025',
    titulo: 'Garantia de efetivo mínimo para o policiamento ostensivo individual',
    categoria: 'Segurança',
    ano: '2025',
    resumo: 'Veda a designação de policiais militares para atividades ostensivas de risco em formato estritamente individual sem retaguarda adequada.',
    detalhes: 'Protege a integridade física do policial militar em serviço e aumenta a segurança operacional nas ruas.'
  },
  {
    id: 'pl-859',
    numero: 'PL 859/2025',
    titulo: 'Autoriza municípios a transferirem recursos de Fundos de Solidariedade',
    categoria: 'Assistência',
    ano: '2025',
    resumo: 'Desburocratiza o repasse de verbas emergenciais para famílias atingidas por enchentes e desastres climáticos.',
    detalhes: 'Permite agilidade nas secretarias municipais para compra de cestas básicas, cobertores e materiais de reconstrução.'
  },
  {
    id: 'pl-711',
    numero: 'PL 711/2025',
    titulo: 'Ampliação do "Programa Bolsa Talento Esportivo"',
    categoria: 'Esportes',
    ano: '2025',
    resumo: 'Garante bolsas de auxílio para atletas e paratletas de municípios de pequeno porte que não contam com patrocínio corporativo.',
    detalhes: 'Apoio fundamental para jovens promissores das cidades paulistas conquistarem títulos nacionais e internacionais.'
  },
  {
    id: 'pl-356',
    numero: 'PL 356/2025',
    titulo: 'Declara Araçatuba como "Capital Estadual da Tecnologia Agropecuária"',
    categoria: 'Agricultura',
    ano: '2025',
    resumo: 'Reconhecimento ao polo de pesquisa genética, confinamento de gado e automação agrícola de Araçatuba.',
    detalhes: 'Incentiva a criação de parques tecnológicos e atração de startups agro (AgTechs) para a região noroeste paulista.'
  },
  {
    id: 'pl-354',
    numero: 'PL 354/2025',
    titulo: 'Declara Barretos como "Capital dos Rodeios do Estado de São Paulo"',
    categoria: 'Esportes',
    ano: '2025',
    resumo: 'Consagra oficialmente Barretos como a capital da tradição sertaneja, do turismo e da maior festa de peão da América Latina.',
    detalhes: 'Patrimônio imaterial do povo paulista que atrai mais de 900 mil turistas anualmente e gera receitas bilionárias para o estado.'
  }
];


/* V6 — busca sem diferenciar acentos/maiúsculas (ex.: "saude" encontra "Saúde") */
function normalizeText(str) {
  return String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/* V8 — acervo completo: une os textos editoriais (PROJETOS_DE_LEI) à lista oficial da ALESP */
function buildProjectsAcervo() {
  const curated = (typeof PROJETOS_DE_LEI !== 'undefined') ? PROJETOS_DE_LEI : [];
  const alesp = Array.isArray(window.PROJETOS_ALESP) ? window.PROJETOS_ALESP : [];
  if (!alesp.length) return curated;
  // Leis sancionadas cujo número difere do PL de origem
  const aliases = { '343/2024': 'pl-18074', '1015/2023': 'pl-17838', '591/2024': 'pl-18359' };
  const byKey = {};
  curated.forEach(c => {
    const m = String(c.numero).match(/(\d+)\/(\d{4})/);
    if (m && !/Lei/i.test(c.numero)) byKey[`${m[1]}/${m[2]}`] = c;
  });
  Object.entries(aliases).forEach(([k, id]) => { const c = curated.find(x => x.id === id); if (c) byKey[k] = c; });
  const used = new Set();
  const list = alesp.map(a => {
    const c = byKey[a.chave];
    if (c) { used.add(c.id); return Object.assign({}, c, { link: a.link, data: a.data, ementa: a.ementa }); }
    return {
      id: 'alesp-' + a.chave.replace(/\W+/g, '-').toLowerCase(),
      numero: a.numero, titulo: a.ementa, ementa: a.ementa, categoria: a.categoria,
      ano: a.ano, data: a.data, link: a.link, resumo: '', detalhes: ''
    };
  });
  curated.forEach(c => { if (!used.has(c.id)) list.push(c); });
  return list;
}
let PROJETOS_ACERVO = null;
function getAcervo() { if (!PROJETOS_ACERVO) PROJETOS_ACERVO = buildProjectsAcervo(); return PROJETOS_ACERVO; }

function initProjectsDatabase() {
  const container = document.getElementById('projectsGrid');
  const countDisplay = document.getElementById('projectsCountDisplay');
  const searchInput = document.getElementById('projectSearchInput');
  const filterChips = document.querySelectorAll('.filter-chip');

  if (!container) return;
  if (countDisplay) { countDisplay.setAttribute('aria-live', 'polite'); }

  const ACERVO = getAcervo();
  const PAGE_SIZE = 12;
  let visible = PAGE_SIZE;
  let currentCategory = 'todos';
  let searchTerm = '';

  // Botão "Mostrar mais" criado logo abaixo da grade
  const moreWrap = document.createElement('div');
  moreWrap.className = 'projects-more-wrap';
  moreWrap.innerHTML = '<button type="button" class="btn-secondary projects-more-btn"></button>';
  container.insertAdjacentElement('afterend', moreWrap);
  const moreBtn = moreWrap.querySelector('button');
  moreBtn.addEventListener('click', () => { visible += PAGE_SIZE; renderProjects(true); });

  function matchesCategory(p) {
    if (currentCategory === 'todos') return true;
    const cat = normalizeText(p.categoria);
    return currentCategory.split('|').some(c => cat.startsWith(normalizeText(c)));
  }

  function renderProjects(keepFocus) {
    const term = normalizeText(searchTerm);
    const filtered = ACERVO.filter(p => {
      const matchSearch = term === '' ||
        normalizeText(p.titulo).includes(term) ||
        normalizeText(p.ementa).includes(term) ||
        normalizeText(p.numero).includes(term) ||
        normalizeText(p.resumo).includes(term) ||
        normalizeText(p.categoria).includes(term);
      return matchesCategory(p) && matchSearch;
    });

    if (countDisplay) {
      countDisplay.textContent = `Exibindo ${Math.min(visible, filtered.length)} de ${filtered.length} projetos`;
    }

    if (filtered.length === 0) {
      moreWrap.hidden = true;
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: #fff; border-radius: 16px; border: 1px dashed var(--border-medium);">
          <svg class="svg-icon xl" style="color: var(--navy-600); margin: 0 auto 16px auto;" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          <h4 style="font-size: 1.15rem; color: var(--navy-950); margin-bottom: 8px;">Nenhum projeto encontrado</h4>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Tente buscar por outro termo ou selecione a categoria "Todos".</p>
        </div>
      `;
      return;
    }

    const prevCount = container.children.length;
    container.innerHTML = filtered.slice(0, visible).map(item => `
      <div class="law-card reveal-fade-up active">
        <div class="law-card-top">
          <span class="law-category-tag">${item.categoria}</span>
          <span class="law-number">${item.numero}</span>
        </div>
        <h4 class="law-title">${item.titulo}</h4>
        ${item.resumo ? `<p class="law-desc" style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px;">${item.resumo}</p>` : ''}
        <div class="law-card-footer">
          <span class="law-year" style="font-size: 0.8rem; font-weight: 700; color: var(--text-light);">${item.data || item.ano}</span>
          <button class="law-detail-btn" type="button" data-project-id="${item.id}" aria-label="Ver detalhes: ${String(item.titulo).replace(/"/g, '&quot;')}">
            Ver detalhes
            <svg class="svg-icon sm" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    const remaining = filtered.length - visible;
    moreWrap.hidden = remaining <= 0;
    moreBtn.textContent = `Mostrar mais projetos (${remaining} restantes)`;
    if (keepFocus) {
      const firstNew = container.children[prevCount]?.querySelector('.law-detail-btn');
      firstNew?.focus({ preventScroll: true });
    }
  }

  filterChips.forEach(chip => {
    chip.setAttribute('type', 'button');
    chip.setAttribute('aria-pressed', chip.classList.contains('active') ? 'true' : 'false');
    chip.addEventListener('click', () => {
      filterChips.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      currentCategory = chip.getAttribute('data-category') || 'todos';
      visible = PAGE_SIZE;
      renderProjects();
    });
  });

  searchInput?.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim();
    visible = PAGE_SIZE;
    renderProjects();
  });

  renderProjects();
}

window.openProjectModal = function(id) {
  const item = getAcervo().find(p => p.id === id);
  if (!item) return;

  const modalContainer = document.getElementById('projectModal');
  const modalContent = document.getElementById('projectModalContent');

  if (!modalContainer || !modalContent) return;

  modalContent.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
      <span class="law-category-tag" style="background: var(--navy-100); color: var(--navy-800);">${item.categoria}</span>
      <span style="font-size: 0.88rem; font-weight: 700; color: var(--navy-700);">${item.numero}</span>
    </div>
    <h3 style="font-family: var(--font-sans); font-size: ${item.resumo ? '1.6rem' : '1.25rem'}; font-weight: 800; color: var(--navy-950); margin-bottom: 16px; line-height: 1.35;">${item.titulo}</h3>
    ${item.resumo ? `
    <div style="background: var(--navy-50); border-left: 4px solid var(--navy-700); padding: 18px; border-radius: 0 10px 10px 0; margin-bottom: 24px;">
      <p style="font-weight: 600; color: var(--navy-900); font-size: 0.98rem; line-height: 1.6;">${item.resumo}</p>
    </div>` : ''}
    ${item.detalhes ? `
    <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--navy-950); margin-bottom: 10px;">Justificativa e Impacto no Estado de SP:</h4>
    <p style="font-size: 0.98rem; color: var(--text-body); line-height: 1.75; margin-bottom: 24px;">${item.detalhes}</p>` : ''}
    ${item.resumo && item.ementa ? `<p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 20px;"><strong style="color: var(--navy-900);">Ementa oficial:</strong> ${item.ementa}</p>` : ''}

    <div style="display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-light); padding-top: 20px;">
      <span style="font-size: 0.88rem; color: var(--text-muted);">Autoria: <strong>Deputada Dani Alonso</strong>${item.data ? ` • Apresentado em ${item.data}` : ''}</span>
      ${item.link ? `<a class="btn-secondary" href="${item.link}" target="_blank" rel="noopener" style="min-height: 44px;">Ver ficha na ALESP <svg class="svg-icon sm" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></a>` : ''}
    </div>
  `;

  modalContainer.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeProjectModal = function() {
  const modalContainer = document.getElementById('projectModal');
  modalContainer?.classList.remove('open');
  document.body.style.overflow = '';
};

/* ==========================================================================
   4. SISTEMA DE NOTÍCIAS & BUSCA
   ========================================================================== */
const NOTICIAS_DATA = Array.isArray(window.NOTICIAS_DATA) ? window.NOTICIAS_DATA : [
  {
    id: 'noticia-tarcisio',
    titulo: 'Convenção Estadual do PL confirma as pré-candidaturas de Dani Alonso e Capitão Augusto',
    data: '23 de Julho, 2026',
    imagem: 'assets/images/noticia-tarcisio-freitas.jpg',
    categoria: 'Articulação Política',
    resumo: 'Ao lado do Governador Tarcísio de Freitas, o evento reuniu milhares de lideranças municipais de todo o Estado na capital paulista.',
    conteudo: 'A convenção consolidou a aliança estratégica em prol do desenvolvimento dos municípios do interior paulista. O Governador Tarcísio de Freitas destacou a firmeza da atuação de Dani Alonso na Assembleia Legislativa como vice-líder e presidente da Comissão de Defesa dos Direitos das Mulheres, garantindo celeridade nas aprovações de projetos estruturantes.'
  },
  {
    id: 'noticia-ciclovia',
    titulo: 'Dani Alonso e Capitão Augusto vistoriam obra da Ciclovia de Avencas',
    data: '21 de Julho, 2026',
    imagem: 'assets/images/noticia-ciclovia-avencas.jpg',
    categoria: 'Infraestrutura',
    resumo: 'Investimento histórico conquistado junto ao Governo de SP para garantir segurança e mobilidade aos ciclistas e trabalhadores rurais.',
    conteudo: 'Em visita técnica, a deputada acompanhou a fase de pavimentação e sinalização da via que liga os distritos, um anseio antigo dos moradores que agora se torna realidade com recursos viabilizados pelo mandato.'
  },
  {
    id: 'noticia-escola-marilia',
    titulo: 'Dani Alonso e Capitão Augusto vistoriam avanço da maior escola de Marília',
    data: '15 de Julho, 2026',
    imagem: 'assets/images/noticia-escola-marilia.jpg',
    categoria: 'Educação',
    resumo: 'Nova unidade de ensino de tempo integral vai atender mais de mil alunos com estrutura completa de robótica e esportes.',
    conteudo: 'A deputada conferiu o ritmo acelerado do canteiro de obras da nova escola estadual. A unidade contará com salas climatizadas, laboratórios de tecnologia e ginásio poliesportivo coberto, fortalecendo a formação das crianças da região.'
  },
  {
    id: 'noticia-asfalto',
    titulo: 'Jardim Ismael tem asfalto novo vistoriado por Dani Alonso e Capitão Augusto',
    data: '10 de Julho, 2026',
    imagem: 'assets/images/noticia-asfalto-marilia.jpg',
    categoria: 'Cidades & Obras',
    resumo: 'Fim da poeira e da lama para dezenas de famílias que aguardavam a pavimentação há mais de duas décadas.',
    conteudo: 'As obras de recape e infraestrutura urbana no bairro foram viabilizadas através de emendas parlamentares destinadas por Dani Alonso. A deputada conversou com os moradores e reforçou o compromisso com os bairros periféricos.'
  },
  {
    id: 'noticia-apae',
    titulo: 'APAE usa uniforme de frio destinado por Dani Alonso e Capitão Augusto',
    data: '08 de Julho, 2026',
    imagem: 'assets/images/noticia-apae-uniforme.jpg',
    categoria: 'Ação Social',
    resumo: 'Apoio contínuo às instituições que acolhem crianças e famílias com necessidades especiais no interior.',
    conteudo: 'A deputada participou pessoalmente da cerimônia de entrega dos kits de inverno para os assistidos da instituição. O cuidado com as entidades filantrópicas e APAEs é uma das prioridades inegociáveis do mandato parlamentar.'
  },
  {
    id: 'noticia-tea',
    titulo: 'Dani Alonso e Capitão Augusto vistoriam possível local do Centro TEA Marília',
    data: '03 de Julho, 2026',
    imagem: 'assets/images/noticia-centro-tea.jpg',
    categoria: 'Saúde & Inclusão',
    resumo: 'Espaço multiprofissional para atendimento a crianças e adultos com Transtorno do Espectro Autista.',
    conteudo: 'Em parceria com o governo estadual e equipes médicas, o novo centro oferecerá terapias integradas, apoio psicológico para mães atípicas e fonoaudiologia com suporte do SUS.'
  }
];

const newsContentCache = new Map();

function sanitizeArticleHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'IMG', 'FIGURE', 'FIGCAPTION', 'HR', 'SPAN', 'DIV']);
  const removeEntirely = new Set(['SCRIPT', 'STYLE', 'FORM', 'IFRAME', 'OBJECT', 'EMBED', 'META', 'LINK', 'BASE', 'SVG', 'MATH']);

  Array.from(template.content.querySelectorAll('*')).forEach(element => {
    if (!allowedTags.has(element.tagName)) {
      if (removeEntirely.has(element.tagName)) element.remove();
      else element.replaceWith(...element.childNodes);
      return;
    }

    Array.from(element.attributes).forEach(attribute => {
      const name = attribute.name.toLowerCase();
      const allowed = element.tagName === 'A'
        ? ['href', 'title', 'target', 'rel', 'class'].includes(name)
        : element.tagName === 'IMG'
          ? ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'class'].includes(name)
          : ['class'].includes(name);
      if (!allowed || name.startsWith('on') || name === 'srcdoc' || name === 'style') element.removeAttribute(attribute.name);
    });

    if (element.tagName === 'A') {
      const href = element.getAttribute('href') || '';
      if (!/^(https?:\/\/|mailto:|\/|#)/i.test(href)) element.removeAttribute('href');
      if (element.getAttribute('target') === '_blank') element.setAttribute('rel', 'noopener noreferrer');
    }
    if (element.tagName === 'IMG') {
      const src = element.getAttribute('src') || '';
      if (!/^(assets\/|uploads\/|https:\/\/danialonso\.com\.br\/)/i.test(src)) element.removeAttribute('src');
      element.setAttribute('loading', 'lazy');
      element.setAttribute('decoding', 'async');
    }
  });
  return template.innerHTML;
}

function initNewsSystem() {
  const newsContainer = document.getElementById('noticiasGrid');
  const searchInput = document.getElementById('newsSearchInput');
  const countLabel = document.getElementById('newsResultCount');
  const previousButton = document.getElementById('newsPrevBtn');
  const nextButton = document.getElementById('newsNextBtn');
  const pageLabel = document.getElementById('newsPageInfo');
  if (!newsContainer) return;

  const pageSize = 12;
  let currentPage = 1;
  let filterTerm = '';
  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function getFilteredNews() {
    return NOTICIAS_DATA.filter(n => {
      if (!filterTerm) return true;
      const term = normalizeText(filterTerm);
      return normalizeText(n.titulo).includes(term) ||
             normalizeText(n.resumo).includes(term) ||
             normalizeText(n.categoria).includes(term);
    });
  }

  function renderNews() {
    const list = getFilteredNews();
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const visibleNews = list.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (countLabel) countLabel.textContent = `${list.length} ${list.length === 1 ? 'matéria encontrada' : 'matérias encontradas'}`;
    if (pageLabel) pageLabel.textContent = `Página ${currentPage} de ${totalPages}`;
    if (previousButton) previousButton.disabled = currentPage <= 1;
    if (nextButton) nextButton.disabled = currentPage >= totalPages;

    if (list.length === 0) {
      newsContainer.innerHTML = `
        <div class="news-empty-state">
          <svg class="svg-icon xl" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          <h2>Nenhuma notícia encontrada</h2>
          <p>Tente pesquisar por outros termos.</p>
        </div>
      `;
      return;
    }

    newsContainer.innerHTML = visibleNews.map(news => `
      <article class="news-card reveal-fade-up active" role="button" tabindex="0" data-news-id="${escapeHtml(news.id)}" aria-label="Ler notícia: ${escapeHtml(news.titulo)}">
        <div class="news-thumb-wrap">
          <img src="${escapeHtml(news.imagem || 'assets/images/dani-hero-alesp.jpg')}" alt="${escapeHtml(news.imagemAlt || news.titulo)}" loading="lazy" decoding="async">
          <span class="news-category-badge">${escapeHtml(news.categoria)}</span>
        </div>
        <div class="news-body">
          <span class="news-date">
            <svg class="svg-icon sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${escapeHtml(news.data)}
          </span>
          <h2 class="news-title">${escapeHtml(news.titulo)}</h2>
          <p class="news-snippet">${escapeHtml(news.resumo)}</p>
          <span class="news-read-more">
            Ler matéria completa
            <svg class="svg-icon sm" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </article>
    `).join('');
    newsContainer.querySelectorAll('.news-thumb-wrap img').forEach(image => {
      image.addEventListener('error', () => {
        if (!image.dataset.fallback) {
          image.dataset.fallback = '1';
          image.src = 'assets/images/dani-hero-alesp.jpg';
        }
      }, { once: true });
    });
  }

  searchInput?.addEventListener('input', (event) => {
    filterTerm = event.target.value.trim();
    currentPage = 1;
    renderNews();
  });

  newsContainer.addEventListener('click', (event) => {
    const card = event.target.closest('[data-news-id]');
    if (card) openNewsModal(card.dataset.newsId);
  });

  newsContainer.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('[data-news-id]');
    if (!card) return;
    event.preventDefault();
    openNewsModal(card.dataset.newsId);
  });

  previousButton?.addEventListener('click', () => {
    if (currentPage <= 1) return;
    currentPage -= 1;
    renderNews();
    document.querySelector('.browser-header')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  nextButton?.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(getFilteredNews().length / pageSize));
    if (currentPage >= totalPages) return;
    currentPage += 1;
    renderNews();
    document.querySelector('.browser-header')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  renderNews();
}

window.openNewsModal = async function(id) {
  const news = NOTICIAS_DATA.find(n => n.id === id);
  if (!news) return;

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const modal = document.getElementById('newsModal');
  const modalContent = document.getElementById('newsModalContent');
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <img src="${escapeHtml(news.imagem || 'assets/images/dani-hero-alesp.jpg')}" alt="${escapeHtml(news.imagemAlt || news.titulo)}" class="modal-header-img">
    <div class="modal-body">
      <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 14px;">
        <span class="news-category-badge" style="position: static;">${escapeHtml(news.categoria)}</span>
        <span class="news-date" style="margin-bottom: 0;">${escapeHtml(news.data)}</span>
      </div>
      <h2 class="news-modal-title">${escapeHtml(news.titulo)}</h2>
      <p class="news-modal-lead">${escapeHtml(news.resumo)}</p>
      <div class="news-article-content" aria-live="polite"><p>Carregando matéria…</p></div>
      <div class="news-modal-footer">
        <span style="font-size: 0.85rem; color: var(--text-muted);">Assessoria de Comunicação • Mandato Dani Alonso</span>
      </div>
    </div>
  `;

  modal.dataset.newsId = id;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const headerImage = modalContent.querySelector('.modal-header-img');
  headerImage?.addEventListener('error', () => {
    if (!headerImage.dataset.fallback) {
      headerImage.dataset.fallback = '1';
      headerImage.src = 'assets/images/dani-hero-alesp.jpg';
    }
  }, { once: true });

  const article = modalContent.querySelector('.news-article-content');
  try {
    let content = news.conteudo || newsContentCache.get(id);
    if (!content && news.contentUrl) {
      const response = await fetch(news.contentUrl, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Falha ao carregar matéria');
      const payload = await response.json();
      if (payload.id !== id || typeof payload.conteudo !== 'string') throw new Error('Conteúdo inválido');
      content = payload.conteudo;
      newsContentCache.set(id, content);
    }
    if (modal.dataset.newsId === id && article) article.innerHTML = sanitizeArticleHtml(content || `<p>${escapeHtml(news.resumo)}</p>`);
  } catch {
    if (modal.dataset.newsId === id && article) article.textContent = 'Não foi possível carregar o texto completo agora. Tente novamente em instantes.';
  }
};

window.closeNewsModal = function() {
  const modal = document.getElementById('newsModal');
  modal?.classList.remove('open');
  if (modal) delete modal.dataset.newsId;
  document.body.style.overflow = '';
};

/* ==========================================================================
   5. LIGHTBOX DE GALERIA DE FOTOS
   ========================================================================== */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');

  if (!galleryItems.length || !lightbox) return;

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.getAttribute('data-caption') || img?.alt || '';

      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        if (lightboxCaption) lightboxCaption.textContent = caption;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    lightbox?.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeProjectModal();
      closeNewsModal();
    }
  });
}

/* ==========================================================================
   6. FORMULÁRIO DE OUVIDORIA / FALE COM A DEPUTADA
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('gabineteContactForm');
  const feedbackAlert = document.getElementById('formFeedbackAlert');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const nome = String(data.get('nome') || '').trim();
    const whatsapp = String(data.get('whatsapp') || '').trim();
    const cidade = String(data.get('cidade') || '').trim();
    const assunto = form.querySelector('#formAssunto')?.selectedOptions[0]?.textContent?.trim() || 'Atendimento';
    const mensagem = String(data.get('mensagem') || '').trim();
    if (!nome || !whatsapp || !cidade || !mensagem || !data.get('consentimento')) return;

    const mensagemPronta = [
      'Olá! Gostaria de falar com a equipe da deputada Dani Alonso.',
      '', 'Nome: ' + nome, 'WhatsApp: ' + whatsapp,
      'Cidade: ' + cidade, 'Assunto: ' + assunto, '',
      'Mensagem:', mensagem
    ].join('\n');
    const url = 'https://wa.me/5511916912200?text=' + encodeURIComponent(mensagemPronta);
    window.location.assign(url);
    if (feedbackAlert) {
      feedbackAlert.replaceChildren();
      const text = document.createElement('span');
      text.textContent = 'O WhatsApp foi aberto com a mensagem pronta. Confira o texto e toque em enviar para concluir. O site não enviou seus dados automaticamente.';
      feedbackAlert.appendChild(text);
      feedbackAlert.className = 'form-feedback-alert notice';
      feedbackAlert.style.display = 'flex';
    }
  });
}

/* ==========================================================================
   V12 — Carrossel de fotos acessível (scroll-snap + botões + indicadores)
   ========================================================================== */
function initMediaCarousels() {
  document.querySelectorAll('.media-carousel').forEach(car => {
    const track = car.querySelector('.media-carousel__track');
    const slides = Array.from(car.querySelectorAll('.media-carousel__slide'));
    const dotsWrap = car.querySelector('.media-carousel__dots');
    const prev = car.querySelector('[data-dir="-1"]');
    const next = car.querySelector('[data-dir="1"]');
    if (!track || slides.length < 2) return;

    const dots = slides.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'media-carousel__dot';
      d.setAttribute('aria-label', `Ir para a foto ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap?.appendChild(d);
      return d;
    });

    let current = 0;
    function goTo(i) {
      const idx = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[idx].offsetLeft - track.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    function update() {
      const w = track.clientWidth || 1;
      current = Math.round(track.scrollLeft / (slides[0].offsetWidth + 16 || w));
      current = Math.max(0, Math.min(slides.length - 1, current));
      dots.forEach((d, i) => d.setAttribute('aria-current', i === current ? 'true' : 'false'));
      if (prev) prev.disabled = current === 0;
      if (next) next.disabled = current === slides.length - 1;
    }
    prev?.addEventListener('click', () => goTo(current - 1));
    next?.addEventListener('click', () => goTo(current + 1));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
    });
    let raf;
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMediaCarousels);
else initMediaCarousels();

/* ==========================================================================
   V13 — Arquivo completo da galeria (124 fotos) + lightbox com navegação
   Usa a foto local (assets/images/galeria/) e, se ainda não existir, a origem.
   ========================================================================== */
function initGalleryArchive() {
  const grid = document.getElementById('galleryArchiveGrid');
  const data = Array.isArray(window.GALERIA_FOTOS) ? window.GALERIA_FOTOS : [];
  if (!grid || !data.length) return;

  const filtersWrap = document.querySelector('.gallery-archive__filters');
  const countEl = document.getElementById('galleryArchiveCount');
  const moreBtn = document.getElementById('galleryArchiveMore');
  const lightbox = document.getElementById('galleryLightbox');
  const lbImg = document.getElementById('lightboxImage');
  const lbCap = document.getElementById('lightboxCaption');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');
  const PAGE = 24;
  let visible = PAGE, year = 'todos', list = data, current = -1;

  const localSrc = f => 'assets/images/galeria/' + f.arquivo;
  const caption = f => `Registro do mandato • ${f.mes} de ${f.ano}`;
  function useFallback(img, f) {
    img.onerror = () => {
      if (img.dataset.fallback) return;
      img.dataset.fallback = '1';
      img.src = f.origem;
    };
  }

  const years = ['todos', ...Array.from(new Set(data.map(f => f.ano))).sort().reverse()];
  years.forEach(y => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'filter-chip' + (y === 'todos' ? ' active' : '');
    b.setAttribute('aria-pressed', y === 'todos' ? 'true' : 'false');
    const n = y === 'todos' ? data.length : data.filter(f => f.ano === y).length;
    b.textContent = (y === 'todos' ? 'Todas' : y) + ` (${n})`;
    b.addEventListener('click', () => {
      filtersWrap.querySelectorAll('.filter-chip').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
      b.classList.add('active'); b.setAttribute('aria-pressed', 'true');
      year = y; visible = PAGE; render();
    });
    filtersWrap?.appendChild(b);
  });

  function render() {
    list = year === 'todos' ? data : data.filter(f => f.ano === year);
    grid.innerHTML = '';
    list.slice(0, visible).forEach((f, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-archive__item';
      btn.setAttribute('aria-label', 'Ampliar foto: ' + caption(f));
      const img = document.createElement('img');
      img.loading = 'lazy'; img.decoding = 'async'; img.alt = caption(f);
      useFallback(img, f);
      img.src = localSrc(f);
      btn.appendChild(img);
      btn.addEventListener('click', () => open(i));
      li.appendChild(btn);
      grid.appendChild(li);
    });
    const shown = Math.min(visible, list.length);
    if (countEl) countEl.textContent = `Exibindo ${shown} de ${list.length} fotos`;
    if (moreBtn) {
      moreBtn.hidden = shown >= list.length;
      moreBtn.parentElement.hidden = shown >= list.length;
      moreBtn.textContent = `Mostrar mais fotos (${list.length - shown} restantes)`;
    }
  }
  moreBtn?.addEventListener('click', () => {
    const before = visible; visible += PAGE; render();
    grid.children[before]?.querySelector('button')?.focus({ preventScroll: true });
  });

  function show(i) {
    current = (i + list.length) % list.length;
    const f = list[current];
    delete lbImg.dataset.fallback;
    useFallback(lbImg, f);
    lbImg.src = localSrc(f);
    lbImg.alt = caption(f);
    if (lbCap) lbCap.textContent = `${caption(f)} — ${current + 1}/${list.length}`;
  }
  function open(i) {
    if (!lightbox || !lbImg) return;
    lightbox.dataset.mode = 'archive';
    if (lbPrev) lbPrev.hidden = false;
    if (lbNext) lbNext.hidden = false;
    show(i);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('lightboxClose')?.focus();
  }
  lbPrev?.addEventListener('click', e => { e.stopPropagation(); show(current - 1); });
  lbNext?.addEventListener('click', e => { e.stopPropagation(); show(current + 1); });
  document.addEventListener('keydown', e => {
    if (!lightbox?.classList.contains('open') || lightbox.dataset.mode !== 'archive') return;
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'ArrowLeft') show(current - 1);
  });
  // Ao abrir pelas fotos em destaque, as setas ficam ocultas
  document.querySelectorAll('.gallery-grid .gallery-item').forEach(it => it.addEventListener('click', () => {
    if (lightbox) lightbox.dataset.mode = 'destaque';
    if (lbImg) { lbImg.onerror = null; delete lbImg.dataset.fallback; }
    if (lbPrev) lbPrev.hidden = true;
    if (lbNext) lbNext.hidden = true;
  }));
  // Swipe no celular
  let x0 = null;
  lightbox?.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lightbox?.addEventListener('touchend', e => {
    if (x0 === null || lightbox.dataset.mode !== 'archive') return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });

  render();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGalleryArchive);
else initGalleryArchive();
