/**
 * ============================================================================
 * HISTOLOGIA 360° — CORE APPLICATION ENGINE
 * Features: Audio Synthesis, Content Database, Virtual Canvas Microscope,
 * Battle Arena Game Engine, Dichotomous Diagnostic Tree, Flashcards & Mnemonics
 * ============================================================================
 */

// Global State
const state = {
  xp: 0,
  rank: "Novato",
  audioEnabled: true,
  currentTheme: "dark",
  currentTab: "tab-resumos",
  // Microscope State
  microscope: {
    currentSlide: "traqueia",
    zoom: 10,
    focus: 50,
    light: 85,
    pinsVisible: true
  },
  // Game State
  game: {
    mode: "campaign",
    currentPhase: 0,
    currentQuestionIndex: 0,
    score: 0,
    lives: 3,
    combo: 1,
    timer: 60,
    timerInterval: null,
    activeQuestions: [],
    correctAnswersCount: 0,
    totalAnswered: 0
  },
  // Flashcard State
  flashcards: {
    currentIndex: 0,
    category: "all",
    filteredList: []
  },
  // Diagnostic Tree State
  diagnostic: {
    currentNode: "root"
  }
};

/* ==========================================================================
   1. PROCEDURAL SOUND ENGINE (Web Audio API)
   ========================================================================== */
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playClick() {
    if (!state.audioEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playMicroscopeClick() {
    if (!state.audioEnabled) return;
    this.init();
    if (!this.ctx) return;
    // Heavy mechanical turret click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(240, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCorrect() {
    if (!state.audioEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0, now + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.25);
    });
  }

  playWrong() {
    if (!state.audioEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playLevelUp() {
    if (!state.audioEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.25, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.35);
    });
  }
}

const audio = new SoundEngine();

/* ==========================================================================
   2. CONTENT DATABASE (THE 6 LECTURES SUMMARY FOR 15-YEAR-OLDS)
   ========================================================================== */
const summariesData = [
  {
    id: "aula-1",
    lectureBadge: "Aula 1",
    title: "Introdução à Célula & A Teoria Celular",
    category: "celula",
    analogy: "Pensa que seu corpo é o maior servidor de Minecraft da história: as células são os blocos individuais. Se tirar os blocos, não sobra castelo nem terreno. Tudo o que você sente, pensa ou se mexe acontece porque trilhões de bloquinhos vivos estão trabalhando em sincronia.",
    subsections: [
      {
        heading: "⚡ O que é 'Estar Vivo'?",
        points: [
          "<strong>Definição biológica:</strong> É a qualidade que distingue seres vivos de matéria inorgânica (rochas) ou mortos.",
          "<strong>Pilares da vida:</strong> Metabolismo ativo, crescimento, capacidade de reproduzir e responder a estímulos do ambiente.",
          "<strong>Química universal:</strong> Toda célula na Terra compartilha a mesma base molecular: água, íons, proteínas, carboidratos, lipídios e ácidos nucleicos (DNA/RNA)."
        ]
      },
      {
        heading: "📜 A Teoria Celular (Schleiden & Schwann)",
        points: [
          "<strong>1838 e 1839:</strong> Mathias Schleiden (botânico) e Theodor Schwann (zoólogo) bateram o martelo: <em>Todos os seres vivos são formados por células!</em>",
          "<strong>Unidade da Vida:</strong> A célula é a menor unidade anatômica, estrutural e funcional viva.",
          "<strong>Biogênese (Virchow):</strong> Toda célula nasce exclusivamente de outra célula pré-existente (por divisão celular).",
          "<strong>Hereditariedade:</strong> O DNA é copiado e passado de geração para geração."
        ]
      },
      {
        heading: "🧬 Eucarionte vs Procarionte",
        points: [
          "<strong>Procariontes (Bactérias):</strong> Sem núcleo delimitado por membrana; DNA livre no citoplasma ('quarto de adolescente bagunçado').",
          "<strong>Eucariontes (Humanos, Animais, Plantas):</strong> Núcleo com carioteca (cofre do DNA) e organelas membranosas especializadas (mitocôndrias = usinas de energia, retículos = fábricas, complexo de Golgi = Correios da célula)."
        ]
      }
    ],
    trap: "Pegadinha de prova: Vírus NÃO são considerados seres celulares! Eles não possuem metabolismo próprio nem célula, por isso são parasitas intracelulares obrigatórios.",
    clinical: "Aplicação Médica: Antibióticos só funcionam contra bactérias porque atacam estruturas exclusivas delas (como parede celular e ribossomos bacterianos), sem danificar as nossas células eucarióticas!"
  },
  {
    id: "aula-2",
    lectureBadge: "Aula 2",
    title: "Tecido Epitelial de Revestimento & Junções de Adesão",
    category: "epitelial",
    analogy: "O tecido epitelial é a blindagem e o tapete inteligente do corpo. As células são como tijolos colados com cimento impermeável superforte (as junções celulares), sem espaço nem para passar uma agulha. Como não tem vasos sanguíneos dentro (é avascular), elas 'pedem comida pelo delivery' do tecido conjuntivo que fica logo embaixo!",
    subsections: [
      {
        heading: "🧱 Características Essenciais do Epitélio",
        points: [
          "<strong>Avascular:</strong> Zero vasos sanguíneos! A nutrição vem por difusão de oxigênio e glicose a partir dos vasos do tecido conjuntivo vizinho.",
          "<strong>Lâmina Basal:</strong> Camada de suporte de proteínas (colágeno IV, laminina) onde as células epiteliais se apoiam.",
          "<strong>Polaridade Celular:</strong> A célula tem 'topo' (polo apical voltado para a luz ou exterior), 'lados' (domínio lateral com junções) e 'fundo' (polo basal preso na lâmina).",
          "<strong>Células Justapostas:</strong> Encaixadas com pouquíssima matriz extracelular (MEC escassa)."
        ]
      },
      {
        heading: "🔗 As Junções Celulares (O Kit de Fixação)",
        points: [
          "<strong>Junção de Oclusão (Zonula occludens):</strong> O 'zíper vedante'. Fica no topo da lateral e sela o espaço, impedindo que o ácido do estômago ou fezes vazem entre as células!",
          "<strong>Junção de Adesão (Zonula adherens):</strong> Um 'cinto de segurança' de microfilamentos de actina que dá firmeza mecânica.",
          "<strong>Desmossomos:</strong> 'Botões de pressão' com filamentos intermediários (queratina) e caderinas; impedem que a pele se rasgue com atrito.",
          "<strong>Hemidesmossomos:</strong> 'Meio desmossomo' que ancora a base da célula à lâmina basal (usando integrinas).",
          "<strong>Junções Comunicantes (GAP / Nexo):</strong> Tubinhos com poros (conexons) que conectam o citoplasma de células vizinhas para troca relâmpago de íons e sinais elétricos."
        ]
      },
      {
        heading: "✨ Especializações Apicais (Os Acessórios da Superfície)",
        points: [
          "<strong>Microvilosidades:</strong> Dobrinhas microscópicas imóveis (com actina) que aumentam a área de absorção (ex: intestino delgado e túbulos renais).",
          "<strong>Cílios:</strong> Cerdas móveis com axonema (microtúbulos 9+2) que batem em ondas para varrer muco e poeira da traqueia.",
          "<strong>Estereocílios:</strong> Microvilos gigantes e ramificados, imóveis, para absorção no epidídimo e audição na orelha interna.",
          "<strong>Flagelo:</strong> Cauda única longa que bate em hélice (propulsão do espermatozoide)."
        ]
      },
      {
        heading: "📐 Classificação dos Epitélios de Revestimento",
        points: [
          "<strong>Quanto às camadas:</strong> Simples (1 camada = troca rápida); Estratificado (várias camadas = proteção contra atrito); Pseudoestratificado (1 camada só, todas tocam a lâmina basal, mas núcleos em alturas diferentes dão ilusão de várias camadas).",
          "<strong>Quanto à forma celular:</strong> Pavimentoso (achatado como escama), Cúbico (em dados), Prismático/Colunar (altas como colunas), e Transição/Urotélio (na bexiga: infla e achata quando cheia, fica fofa em cúpula quando vazia).",
          "<strong>Queratina:</strong> Estratificado pavimentoso queratinizado na pele seca (células mortas cheias de queratina impermeável); Não-queratinizado no esôfago e boca (úmidos)."
        ]
      }
    ],
    trap: "CUIDADO: No epitélio pseudoestratificado (ex: traqueia), TODAS as células tocam a lâmina basal, mas nem todas chegam à superfície livre! E em epitélios estratificados, o nome da forma é SEMPRE dado pelas células da camada mais superficial!",
    clinical: "Fisioterapia & Fisiologia: Lesões por pressão (escaras) em pacientes acamados ocorrem porque a pressão externa fecha os vasos do conjuntivo, cortando a nutrição do epitélio por difusão e matando a pele!"
  },
  {
    id: "aula-3",
    lectureBadge: "Aula 3 & 3.1",
    title: "Epitélio Glandular & Tecido Epitelial na Fisioterapia",
    category: "glandular",
    analogy: "Se o epitélio de revestimento é a muralha de um castelo, as glândulas são as cozinhas e alquimistas do reino. Elas nascem quando o epitélio afunda para dentro do tecido conjuntivo e vira uma usina de produzir substâncias (suor, saliva, leite, hormônios).",
    subsections: [
      {
        heading: "🏭 Exócrinas vs Endócrinas",
        points: [
          "<strong>Glândula Exócrina:</strong> Manteve o canal de saída (ducto secretor). Joga a secreção para uma superfície livre ou cavidade de órgão (ex: suor, lágrimas, saliva, enzimas gástricas).",
          "<strong>Glândula Endócrina:</strong> Perdeu a conexão com a superfície (sem ducto!). Joga sua secreção (os hormônios) diretamente na corrente sanguínea (ex: tireoide, paratireoide, hipófise).",
          "<strong>Parênquima:</strong> A parte funcional que fabrica a secreção.",
          "<strong>Estroma:</strong> O tecido conjuntivo de sustentação, vasos e nervos que abraça a glândula."
        ]
      },
      {
        heading: "💧 Modos de Eliminação da Secreção (O Destino da Célula)",
        points: [
          "<strong>Merócrina (Écrina):</strong> 'A educada'. Libera a secreção por exocitose pura, sem perder nenhum pedaço da célula (ex: pâncreas, parótida, salivares).",
          "<strong>Apócrina:</strong> 'A generosa'. A pontinha do citoplasma apical se desprende junto com o produto secretado (ex: glândula mamária em lactação e axilares).",
          "<strong>Holócrina:</strong> 'A homem-bomba'. A célula inteira se enche de gordura, morre e se desintegra virando ela própria a secreção (ex: glândulas sebáceas da pele)."
        ]
      },
      {
        heading: "🥣 Natureza da Secreção Exócrina",
        points: [
          "<strong>Serosa:</strong> Líquido ralo e aquoso rico em enzimas e proteínas (núcleos redondos basais, ácinos arroxeados escuros ao H&E; ex: parótida e pâncreas).",
          "<strong>Mucosa:</strong> Secreção espessa e viscosa rica em mucinogênios glicosilados (núcleos achatados na base, citoplasma pálido/claro; ex: células caliciformes).",
          "<strong>Mista:</strong> Contém ácinos serosos e mucosos juntos, formando a famosa <em>Semilua Serosa de Giannuzzi</em> (ex: glândula submandibular)."
        ]
      },
      {
        heading: "🩸 Organização Endócrina: Cordonais vs Foliculares",
        points: [
          "<strong>Cordonal:</strong> Células organizadas em cordões tortuosos ao redor de capilares de sangue (ex: paratireoide, suprarrenal).",
          "<strong>Folicular (Vesicular):</strong> Células formam esferas ocas (folículos) com uma lagoa central de reserva hormonal (colóide) (ex: tireoide)."
        ]
      }
    ],
    trap: "Mnemônico da Secreção: MERO-crina = Mero suor (sai só a secreção). APO-crina = Apical se desprende. HOLO-crina = Holocausto da célula (ela morre inteira)!",
    clinical: "Fisioterapia Dermatofuncional: Na cicatrização de feridas, as células basais do epitélio proliferam e migram sobre o tecido de granulação do conjuntivo para fechar a barreira cutânea. O fisioterapeuta usa laser de baixa potência para acelerar essa mitose celular!"
  },
  {
    id: "aula-4",
    lectureBadge: "Aula 4",
    title: "Tecido Conjuntivo Geral, Fibras & Células Imunes",
    category: "conjuntivo",
    analogy: "O tecido conjuntivo é o esqueleto de sustentação, o sistema de delivery e o batalhão de bombeiros do organismo. Ao contrário do epitélio (que é puro aglomerado de células), o conjuntivo é 90% espaço com gelatina elástica (matriz extracelular) e cordas de aço (colágeno), com células especializadas patrulhando o terreno.",
    subsections: [
      {
        heading: "🕸️ A Matriz Extracelular (MEC)",
        points: [
          "<strong>Fibras Colágenas (Colágeno I, II e III):</strong> Cabos de aço flexíveis resistentes à tração mecânica.",
          "<strong>Fibras Elásticas:</strong> Feitas de elastina e fibrilina; esticam e voltam como elástico de borracha (ex: artérias, pele, pulmão).",
          "<strong>Fibras Reticulares (Colágeno III):</strong> Redes fininhas que dão suporte a órgãos esponjosos como baço, fígado e linfonodos.",
          "<strong>Substância Fundamental Amorfa (SFA):</strong> Gel viscoso e hidratado de glicosaminoglicanos (GAGs, como ácido hialurônico) e proteoglicanos que retém água e permite difusão rápida de nutrientes."
        ]
      },
      {
        heading: "🏠 Células Residentes (Moram lá)",
        points: [
          "<strong>Fibroblastos / Fibrócitos:</strong> Os pedreiros mestres! Fabricam as fibras e a matriz. Fibroblasto é jovem e superativo; fibrócito é a versão madura e quiescente.",
          "<strong>Macrófagos (Histiócitos):</strong> O Pac-Man fagocitador! Engolem bactérias, restos celulares e apresentam antígenos para a imunidade.",
          "<strong>Mastócitos:</strong> As granadas de alerta! Contêm grânulos com histamina (vasodilatador do inchaço) e heparina (anticoagulante); disparam em reações alérgicas.",
          "<strong>Adipócitos:</strong> Células que guardam gordura (triglicerídeos)."
        ]
      },
      {
        heading: "🧈 Tecido Adiposo: Branco vs Pardo",
        points: [
          "<strong>Tecido Adiposo Branco (Unilocular):</strong> Possui 1 gota gigante de lipídio que empurra o núcleo para a borda ('anel de sinete'). Reserva energética de longo prazo e isolamento térmico.",
          "<strong>Tecido Adiposo Pardo / Marrom (Multilocular):</strong> Várias gotículas e recheado de mitocôndrias com termogenina (UCP-1). Não produz ATP, dissipa energia gerando CALOR puro (termogênese em recém-nascidos e mamíferos hibernantes)!"
        ]
      },
      {
        heading: "🚨 Células Transitórias (Os Leucócitos da Patrulha)",
        points: [
          "<strong>Neutrófilos:</strong> A polícia de choque! Primeira resposta contra bactérias agudas. Fagocitam e morrem em combate, formando o pus.",
          "<strong>Eosinófilos:</strong> Caçadores de vermes parasitas e moderadores de alergia.",
          "<strong>Linfócitos & Plasmócitos:</strong> O plasmócito nasce do Linfócito B e é uma impressora 3D de anticorpos (tem núcleo típico em 'roda de carroça')."
        ]
      }
    ],
    trap: "Diferença vital: Conjuntivo FROUXO tem proporção equilibrada de células, fibras e matriz (flexível, abaixo da pele). Conjuntivo DENSO é puro feixe de colágeno resistente (Denso NÃO-MODELADO na derme reticular resiste a forças em várias direções; DENSO MODELADO nos tendões resiste a forças em direção única paralela)!",
    clinical: "Correlação Prática: A celulite e a gordura localizada envolvem o tecido conjuntivo adiposo unilocular. Já no choque anafilático, os mastócitos desgranulam histamina maciçamente por todo o corpo, derrubando a pressão arterial!"
  },
  {
    id: "aula-5-cart",
    lectureBadge: "Aula 5 (Parte 1)",
    title: "Tecido Cartilaginoso (Hialina, Elástica & Fibrosa)",
    category: "cartilagem",
    analogy: "A cartilagem é o silicone amortecedor de impacto das nossas articulações. Ela é lisa, elástica e resistente. Mas tem um detalhe perigoso: ela NÃO tem vasos sanguíneos e NÃO tem nervos! Por isso, cartilagem machucada em adulto quase não se regenera sozinha.",
    subsections: [
      {
        heading: "🛡️ A Estrutura & O Pericôndrio",
        points: [
          "<strong>Avascular e Anérvica:</strong> Não tem vasos nem nervos. A nutrição vem pelo <em>pericôndrio</em> por difusão, ou pelo líquido sinovial das articulações.",
          "<strong>Pericôndrio:</strong> Capa de tecido conjuntivo denso que abraça a cartilagem. Camada externa fibrosa (proteção) + Camada interna celular (células condrogênicas prontas para virar condroblastos).",
          "<strong>EXCEÇÕES CRUCIAIS:</strong> A cartilagem articular NÃO possui pericôndrio! E a fibrocartilagem também NÃO tem pericôndrio!"
        ]
      },
      {
        heading: "👥 As Células e os Grupos Isogênicos",
        points: [
          "<strong>Condroblastos:</strong> Células jovens ativas na borda, sintetizam a matriz vigorosamente.",
          "<strong>Condrócitos:</strong> Células maduras que ficaram aprisionadas dentro de cavidades chamadas <em>lacunas</em> (ou condroplastos).",
          "<strong>Grupos Isogênicos:</strong> Células 'irmãs gêmeas' geradas por mitoses recentes do mesmo condrócito, agrupadas na mesma vizinhança."
        ]
      },
      {
        heading: "🎨 Os 3 Tipos de Cartilagem",
        points: [
          "<strong>1. Cartilagem Hialina (A mais comum):</strong> Aspecto vítreo e translúcido. Colágeno tipo II (fibras invisíveis ao M.O.). Forma o esqueleto do feto, traqueia, brônquios, costelas e superfícies articulares.",
          "<strong>2. Cartilagem Elástica:</strong> Rica em fibras elásticas entrelaçadas com colágeno tipo II. Super flexível! Encontrada no pavilhão da orelha, conduto auditivo e epiglote.",
          "<strong>3. Fibrocartilagem (Cartilagem Fibrosa):</strong> O Hulk das cartilagens! Feixes grossos e paralelos de Colágeno tipo I com condrócitos alinhados em fileiras. Suporta compressão brutal. SEM pericôndrio. Encontrada nos discos intervertebrais, sínfise púbica e meniscos."
        ]
      },
      {
        heading: "🌱 Crescimento da Cartilagem",
        points: [
          "<strong>Crescimento Aposicional:</strong> De fora para dentro, a partir das células condrogênicas do pericôndrio depositando novas camadas.",
          "<strong>Crescimento Intersticial:</strong> De dentro para fora, por mitose dos próprios condrócitos dentro de suas lacunas (ocorre nos discos de crescimento e cartilagem articular)."
        ]
      }
    ],
    trap: "CUIDADO: Se perguntarem em prova qual cartilagem não tem pericôndrio, lembre de duas: Cartilagem Articular e Fibrocartilagem (discos intervertebrais)!",
    clinical: "Hérnia de Disco: O disco intervertebral tem um anel fibroso externo (fibrocartilagem) e um centro gelatinoso (núcleo pulposo). Quando o anel rompe com sobrecarga, o núcleo vaza e aperta nervos, causando dor ciática severa!"
  },
  {
    id: "aula-5-osso",
    lectureBadge: "Aula 5 (Parte 2)",
    title: "Tecido Ósseo, Osteogênese & Sistemas de Havers",
    category: "osseo",
    analogy: "Muita gente acha que o osso é uma pedra seca e morta. Errado! O osso é um canteiro de obras frenético 24h por dia, com equipes de demolição (osteoclastos) e pedreiros de reconstrução (osteoblastos). Ele é vascularizado, rico em nervos e armazena 99% do cálcio do seu corpo.",
    subsections: [
      {
        heading: "🧱 Composição da Matriz Óssea",
        points: [
          "<strong>Parte Inorgânica (65%):</strong> Cristais minerais de <em>hidroxiapatita</em> [Ca10(PO4)6(OH)2], cálcio e fósforo. Dá a dureza e rigidez contra impacto.",
          "<strong>Parte Orgânica (35%):</strong> 90% Colágeno tipo I + osteocalcina e proteoglicanos. Dá flexibilidade e impede que o osso se estilhace como vidro seco."
        ]
      },
      {
        heading: "🔨 As 4 Células do Batalhão Ósseo",
        points: [
          "<strong>1. Células Osteoprogenitoras:</strong> Células-tronco do mesênquima que se transformam em osteoblastos.",
          "<strong>2. Osteoblastos:</strong> Os pedreiros construtores! Secretam a matriz óssea orgânica jovem (chamada de <em>osteóide</em>) e fosfatase alcalina para depositar os minerais.",
          "<strong>3. Osteócitos:</strong> Osteoblastos aposentados que ficaram presos na matriz calcificada dentro de lacunas. Eles emitem prolongamentos por finos <em>canalículos</em> e conversam por junções GAP como sensores de esforço!",
          "<strong>4. Osteoclastos:</strong> A bola de demolição gigante! Células móveis gigantes multinucleadas (vêm de monócitos do sangue). Ficam cavando buracos chamados <em>Lacunas de Howship</em>, liberando ácido e colagenase para dissolver o osso e jogar cálcio no sangue."
        ]
      },
      {
        heading: "🔬 Arquitetura Microscópica (Os Canais de Havers e Volkmann)",
        points: [
          "<strong>Ósteon (Sistema de Havers):</strong> Cilindros concêntricos de lamelas ósseas mineralizadas ao redor do <em>Canal de Havers</em> (longitudinal, onde passam vasos sanguíneos e nervos).",
          "<strong>Canais de Volkmann:</strong> Canais transversais ou oblíquos que ligam os canais de Havers entre si, com a cavidade da medula e com o periósteo. NÃO possuem lamelas concêntricas!",
          "<strong>Periósteo & Endósteo:</strong> O periósteo reveste a face externa do osso (com fibras de Sharpey ancorando); o endósteo reveste as cavidades internas e os canais."
        ]
      },
      {
        heading: "🦴 Como o Osso Nasce & Cresce (Ossificação)",
        points: [
          "<strong>Ossificação Intramembranosa:</strong> O osso nasce direto dentro de membranas de tecido conjuntivo embrionário (ossos chatos do crânio, mandíbula e clavícula).",
          "<strong>Ossificação Endocondral:</strong> O osso substitui um molde pré-existente de cartilagem hialina (ossos longos, fêmur, úmero).",
          "<strong>As 5 Zonas do Disco Epifisário:</strong> 1. Zona de Repouso; 2. Zona de Proliferação (condrócitos em pilhas de moedas); 3. Zona de Hipertrofia (células incham); 4. Zona de Calcificação (matriz mineraliza e condrócitos morrem); 5. Zona de Ossificação (osteoblastos depositam osso sobre as espículas)."
        ]
      }
    ],
    trap: "OsteoBLASTO = Constrói (B de Bom/Build). OsteoCLASTO = Corrói/Quebra (C de Catástrofe/Crush). Osteócito = Mantém quieto (Cito de Célula adulta)!",
    clinical: "Osteoporose: Quando a demolição pelos osteoclastos supera a construção dos osteoblastos, o osso fica poroso e quebra fácil. Muito comum em mulheres pós-menopausa pela queda do estrogênio (que antes freava os osteoclastos)!"
  }
];

/* ==========================================================================
   3. GAME QUESTIONS DATABASE (ARENA)
   ========================================================================== */
const gameQuestions = [
  // Aula 1
  {
    phase: 1,
    topic: "Teoria Celular",
    question: "Quem foram os cientistas que formularam a base clássica da Teoria Celular em 1838 e 1839?",
    options: [
      "Mathias Schleiden e Theodor Schwann",
      "Robert Hooke e Louis Pasteur",
      "Rudolf Virchow e Gregor Mendel",
      "Charles Darwin e Antonie van Leeuwenhoek"
    ],
    answer: 0,
    explanation: "Schleiden (em 1838, estudando plantas) e Schwann (em 1839, estudando animais) concluíram que todos os seres vivos são constituídos por células."
  },
  {
    phase: 1,
    topic: "Biologia Celular",
    question: "Qual das seguintes afirmações sobre os vírus é CORRETA sob a ótica da Teoria Celular?",
    options: [
      "São células procariontes primitivas que possuem ribossomos próprios.",
      "Não são constituídos por células e dependem do maquinário de uma célula hospedeira para se reproduzir.",
      "Possuem membrana plasmática com junções de oclusão.",
      "Originam-se de forma espontânea por abiogênese na ausência de DNA."
    ],
    answer: 1,
    explanation: "Os vírus são acelulares (sem estrutura celular própria), sendo parasitas intracelulares obrigatórios."
  },
  // Aula 2
  {
    phase: 2,
    topic: "Tecido Epitelial",
    question: "Por que o tecido epitelial depende obrigatoriamente do tecido conjuntivo subjacente para sua sobrevivência?",
    options: [
      "Porque o epitélio não tem núcleo e precisa do DNA do conjuntivo.",
      "Porque o epitélio é avascular e recebe oxigênio e nutrientes por difusão a partir dos capilares do conjuntivo.",
      "Porque o epitélio não produz suas próprias proteínas citoplasmáticas.",
      "Porque as junções GAP só funcionam se ligadas diretamente ao sangue arterial."
    ],
    answer: 1,
    explanation: "O tecido epitelial é totalmente avascular; sua nutrição e oxigenação dependem 100% da difusão a partir da lâmina própria conjuntiva."
  },
  {
    phase: 2,
    topic: "Junções Celulares",
    question: "Qual especialização juncional atua como verdadeiros 'botões de pressão', ancorando filamentos intermediários (queratina) para evitar o rompimento mecânico da epiderme?",
    options: [
      "Junções Comunicantes (GAP)",
      "Zonula de Oclusão",
      "Desmossomos (Mácula de Adesão)",
      "Microvilosidades apicais"
    ],
    answer: 2,
    explanation: "Os desmossomos formam placas de ancoragem com caderinas e queratina, garantindo altíssima resistência a tração e estresse mecânico."
  },
  {
    phase: 2,
    topic: "Especializações da Superfície",
    question: "Qual é a diferença funcional e estrutural primária entre os CÍLIOS e as MICROVILOSIDADES?",
    options: [
      "Cílios são para absorção passiva; microvilosidades batem ativamente para locomoção.",
      "Cílios possuem axonema (microtúbulos) e movimentam muco; microvilosidades contêm filamentos de actina e ampliam a área de absorção.",
      "Cílios só existem no intestino; microvilosidades só existem na traqueia.",
      "Ambos são idênticos em tamanho e proteínas, mudando apenas o órgão em que aparecem."
    ],
    answer: 1,
    explanation: "Cílios têm microtúbulos (9+2) e realizam batimento coordenado de transporte; microvilos são invaginações ricas em actina para absorver nutrientes."
  },
  {
    phase: 2,
    topic: "Classificação Epitelial",
    question: "Como é classificado o epitélio que reveste a traqueia humana?",
    options: [
      "Estratificado pavimentoso queratinizado",
      "Simples cúbico secretor",
      "Pseudoestratificado colunar (prismático) ciliado com células caliciformes",
      "Epitélio de transição (urotélio)"
    ],
    answer: 2,
    explanation: "A traqueia possui epitélio pseudoestratificado colunar ciliado: todas as células tocam a lâmina basal, mas seus núcleos em diferentes alturas dão falsa impressão de camadas."
  },
  // Aula 3
  {
    phase: 3,
    topic: "Epitélio Glandular",
    question: "Uma glândula cuja célula secretora acumula lipídios, morre e se desintegra por completo, tornando-se o próprio produto de secreção, é classificada como:",
    options: [
      "Merócrina (Écrina)",
      "Apócrina",
      "Holócrina (ex: glândula sebácea)",
      "Endócrina folicular"
    ],
    answer: 2,
    explanation: "Na secreção holócrina (ex: glândulas sebáceas), a célula inteira morre e vira secreção ('holocausto celular')."
  },
  {
    phase: 3,
    topic: "Glândulas Salivares",
    question: "O que caracteriza a famosa 'Semilua Serosa de Giannuzzi' encontrada na glândula submandibular?",
    options: [
      "Uma cápsula óssea que protege os ductos glandulares.",
      "Um agrupamento em crescente de células serosas que capeia o fundo de ácinos mucosos em glândulas mistas.",
      "Um folículo endócrino produtor de tiroxina.",
      "Uma invaginação de queratina na camada córnea da pele."
    ],
    answer: 1,
    explanation: "As semiluas de Giannuzzi são grupos de células serosas em formato de meia-lua que abraçam ácinos mucosos em glândulas mistas."
  },
  // Aula 4
  {
    phase: 4,
    topic: "Tecido Conjuntivo",
    question: "Qual célula do tecido conjuntivo é responsável por disparar histamina e heparina durante processos inflamatórios agudos e reações alérgicas?",
    options: [
      "Mastócito",
      "Fibrócito inativo",
      "Adipócito unilocular",
      "Condrócito maduro"
    ],
    answer: 0,
    explanation: "Os mastócitos são repletos de grânulos metacromáticos contendo histamina (vasodilatação) e heparina (anticoagulante)."
  },
  {
    phase: 4,
    topic: "Tecido Adiposo",
    question: "O que difere metabolicamente o Tecido Adiposo Pardo (Multilocular) do Tecido Adiposo Branco (Unilocular)?",
    options: [
      "O pardo acumula glicogênio no lugar de lipídios.",
      "O pardo possui mitocôndrias com termogenina (UCP-1) e dissipa energia na forma de calor corporal (termogênese sem tremor).",
      "O branco não tem vasos sanguíneos e é totalmente anérvico.",
      "O pardo só existe em idosos após os 80 anos."
    ],
    answer: 1,
    explanation: "O tecido adiposo multilocular (pardo) queima ácidos graxos via termogenina para gerar calor diretamente, vital para recém-nascidos."
  },
  {
    phase: 4,
    topic: "Fibras do Conjuntivo",
    question: "Tendões e ligamentos precisam resistir a forças unidirecionais extremas de tração. Por isso, são formados por:",
    options: [
      "Tecido conjuntivo frouxo rico em mastócitos.",
      "Tecido conjuntivo denso modelado (com feixes paralelos compactos de colágeno tipo I).",
      "Tecido epitelial estratificado prismático.",
      "Tecido adiposo unilocular com cápsula fibrosa."
    ],
    answer: 1,
    explanation: "O conjuntivo denso modelado alinha seus feixes espessos de colágeno na mesma direção da força mecânica, conferindo máxima resistência à tração."
  },
  // Aula 5 - Cartilagem
  {
    phase: 5,
    topic: "Cartilagem",
    question: "Em quais das seguintes localizações anatômicas encontramos cartilagem do tipo HIALINA?",
    options: [
      "Discos intervertebrais e sínfise púbica.",
      "Pavilhão da orelha e epiglote.",
      "Anéis da traqueia, superfícies articulares e esqueleto embrionário.",
      "Derme reticular e tendão do calcâneo."
    ],
    answer: 2,
    explanation: "A cartilagem hialina é a mais abundante: forma os anéis da traqueia, extremidades costais, articulações móveis e o molde fetal."
  },
  {
    phase: 5,
    topic: "Pericôndrio",
    question: "Sobre o pericôndrio, assinale a alternativa cientificamente CORRETA:",
    options: [
      "Ele reveste todas as cartilagens sem exceção, inclusive as cartilagens articulares.",
      "Possui uma camada externa fibrosa vascularizada e uma camada interna celular com células condrogênicas.",
      "É um tipo de tecido ósseo calcificado com canais de Havers.",
      "Impede o crescimento aposicional da cartilagem."
    ],
    answer: 1,
    explanation: "O pericôndrio é um envoltório conjuntivo com vasos para nutrir a cartilagem e células condrogênicas internas para crescimento por aposição (mas não existe nas superfícies articulares!)."
  },
  {
    phase: 5,
    topic: "Fibrocartilagem",
    question: "Qual característica histológica é marcante na FIBROCARTILAGEM (Cartilagem Fibrosa)?",
    options: [
      "Possui abundante pericôndrio bilaminar e células gigantes multinucleadas.",
      "Apresenta feixes espessos de colágeno tipo I, condrócitos em fileiras paralelas e NÃO possui pericôndrio.",
      "É formada apenas por fibras elásticas sem nenhuma fibrila de colágeno.",
      "É vascularizada por grandes artérias centrais."
    ],
    answer: 1,
    explanation: "A fibrocartilagem combina colágeno I denso com condrócitos em fileiras, suporta altíssima compressão (discos intervertebrais) e não tem pericôndrio."
  },
  // Aula 5 - Osso
  {
    phase: 6,
    topic: "Células Ósseas",
    question: "Células gigantes, móveis, multinucleadas, que ocupam as Lacunas de Howship e reabsorvem a matriz óssea liberando cálcio no sangue são os:",
    options: [
      "Osteoblastos",
      "Osteócitos",
      "Osteoclastos",
      "Condrócitos"
    ],
    answer: 2,
    explanation: "Os osteoclastos são os gigantes reabsorvedores de osso! Secretam ácido e enzimas nas lacunas de Howship para remodelar a matriz e regular a calcemia."
  },
  {
    phase: 6,
    topic: "Sistemas de Havers",
    question: "Como se diferenciam microscopicamente os Canais de Havers e os Canais de Volkmann no osso compacto lamelar?",
    options: [
      "Havers é longitudinal cercado por lamelas concêntricas (ósteon); Volkmann é transversal/oblíquo e perfura as lamelas sem círculos concêntricos.",
      "Havers só existe no feto; Volkmann só existe na velhice.",
      "Havers contém ar; Volkmann contém medula óssea vermelha.",
      "Havers é revestido por epitélio estratificado queratinizado."
    ],
    answer: 0,
    explanation: "Canais de Havers correm no sentido longitudinal rodeados por lamelas concêntricas formando o ósteon; os canais de Volkmann atravessam perpendicularmente conectando os ósteons."
  },
  {
    phase: 6,
    topic: "Ossificação",
    question: "Na placa (disco) epifisária de crescimento dos ossos longos, qual é a sequência correta das zonas de ossificação endocondral?",
    options: [
      "Repouso → Proliferação → Hipertrofia → Calcificação → Ossificação",
      "Ossificação → Repouso → Calcificação → Hipertrofia → Proliferação",
      "Hipertrofia → Repouso → Proliferação → Ossificação → Fibrose",
      "Calcificação → Repouso → Degeneração → Cicatrização → Havers"
    ],
    answer: 0,
    explanation: "A sequência clássica do disco de crescimento é: Repouso (reserva) -> Proliferação (colunas de células) -> Hipertrofia (células incham) -> Calcificação (mineraliza e células morrem) -> Ossificação (invasão vascular e deposição de osso)."
  },
  // Clinical Cases
  {
    phase: 1,
    topic: "Caso Clínico: Ortopedia",
    question: "Um jovem atleta sofreu uma fratura na diáfise do fêmur. Durante as primeiras 2 semanas, o corpo forma um calo provisório que une as extremidades antes da mineralização definitiva. Esse calo mole é composto por:",
    options: [
      "Tecido de granulação conjuntivo e fibrocartilagem provisória",
      "Epitélio estratificado pavimentoso",
      "Osso compacto lamelar maduro com sistemas de Havers completos",
      "Tecido adiposo marrom com termogenina"
    ],
    answer: 0,
    explanation: "Após a fratura e hematoma inicial, forma-se tecido de granulação e um calo fibrocartilaginoso mole. Só depois os osteoblastos o substituem por calo ósseo primário e, por fim, os osteoclastos remodelam o osso lamelar maduro."
  },
  {
    phase: 2,
    topic: "Caso Clínico: Reumatologia",
    question: "Uma paciente de 68 anos foi diagnosticada com osteoporose severa após uma queda leve resultar em fratura de rádio. Qual é o mecanismo celular histológico subjacente a essa condição?",
    options: [
      "Aumento excessivo do número de canalículos de Volkmann.",
      "Desbalanço onde a reabsorção óssea pelos osteoclastos supera a taxa de síntese de matriz pelos osteoblastos.",
      "Morte súbita de todas as células condrogênicas do pericôndrio.",
      "Transformação do osso compacto em cartilagem elástica."
    ],
    answer: 1,
    explanation: "A osteoporose ocorre quando a atividade de reabsorção dos osteoclastos fica maior do que a deposição de matriz pelos osteoblastos, rarefazendo as trabéculas ósseas."
  },

  // ==========================================
  // ESTUDO DIRIGIDO: TECIDO EPITELIAL (11 QUESTÕES)
  // ==========================================
  {
    phase: 2,
    topic: "Estudo Dirigido: Tecido Epitelial",
    question: "O que caracteriza o tecido epitelial em termos de arranjo celular e matriz extracelular (MEC), e como essa organização se relaciona com a sua nutrição?",
    options: [
      "Células poliédricas justapostas com escassa MEC e ausência de vasos (avascular), nutrindo-se por difusão a partir do conjuntivo subjacente.",
      "Células arredondadas amplamente dispersas em matriz extracelular calcificada e rica vascularização própria.",
      "Células multinucleadas conectadas por trabéculas ósseas com nutrição aeróbica direta.",
      "Células fusiformes sem junções celulares e com suprimento sanguíneo direto de arteríolas intraepiteliais."
    ],
    answer: 0,
    explanation: "O tecido epitelial apresenta forte justaposição celular com escassa substância intercelular. Como é totalmente avascular, recebe oxigênio e nutrientes por difusão a partir dos capilares do tecido conjuntivo (lâmina própria) através da membrana basal."
  },
  {
    phase: 2,
    topic: "Estudo Dirigido: Tecido Epitelial",
    question: "O tecido epitelial é o único que pode se originar dos três folhetos embrionários. Qual alternativa correlaciona CORRETAMENTE o folheto ao respectivo epitélio derivado?",
    options: [
      "Ectoderme: endotélio vascular; Mesoderme: epitélio da traqueia; Endoderme: epiderme queratinizada.",
      "Ectoderme: músculo liso; Mesoderme: neurônios do córtex; Endoderme: cartilagem hialina.",
      "Ectoderme: epiderme e córnea; Mesoderme: endotélio e mesotélio; Endoderme: epitélio do trato gastrointestinal e respiratório.",
      "Ectoderme: sangue; Mesoderme: epiderme; Endoderme: capilares sinusoides hepáticos."
    ],
    answer: 2,
    explanation: "Ectoderme dá origem à epiderme e córnea; Mesoderme dá origem ao endotélio (vasos) e mesotélios (pericárdio, pleura, peritônio); Endoderme dá origem ao revestimento do trato gastrointestinal e respiratório."
  },
  {
    phase: 2,
    topic: "Estudo Dirigido: Tecido Epitelial",
    question: "Qual é a composição molecular predominante da membrana basal e qual é a sua principal função na interface epitélio-conjuntivo?",
    options: [
      "Colágeno tipo I em feixes compactos e cristais de hidroxiapatita inorgânica com função de suporte mecânico rígido.",
      "Colágeno tipo IV, laminina, perlecan e entactina; atua como suporte mecânico, filtro molecular seletivo e guia para regeneração celular.",
      "Fibras elásticas puras desprovidas de glicoproteínas, com função exclusiva de contração celular rápida.",
      "Apenas condroitim sulfato livre sem nenhuma proteína fibrilar estrutural."
    ],
    answer: 1,
    explanation: "A membrana basal (lâmina lúcida + densa + reticular) é rica em colágeno IV, laminina, perlecan (heparam sulfato) e entactina/nidogênio. Atua ancorando o epitélio e servindo como filtro molecular seletivo."
  },
  {
    phase: 2,
    topic: "Estudo Dirigido: Tecido Epitelial",
    question: "Qual é a diferença funcional fundamental entre as junções de oclusão (zonula occludens) e as junções de adesão (zonula adherens)?",
    options: [
      "A de oclusão fixa a célula à lâmina basal por integrinas; a de adesão cria canais iônicos de baixa resistência elétrica.",
      "A de oclusão ancora filamentos de queratina; a de adesão promove a divisão meiótica da célula epitelial.",
      "Ambas possuem a mesma composição de conexons e realizam troca metabólica direta de glicose.",
      "A de oclusão sela o espaço intercelular mantendo a polaridade celular; a de adesão ancora filamentos de actina entre células vizinhas."
    ],
    answer: 3,
    explanation: "A zônula de oclusão sela o espaço intercelular com claudinas e ocludinas (barreira paracelular e manutenção da polaridade apical/basolateral). A zônula de adesão ancora feixes de filamentos de actina via caderinas e cateninas."
  },
  {
    phase: 2,
    topic: "Estudo Dirigido: Tecido Epitelial",
    question: "Em um tecido sob forte atrito mecânico (como a epiderme) e em um tecido que requer sincronismo elétrico/metabólico rápido, quais junções se destacam respectivamente?",
    options: [
      "Desmossomos (ancoragem de queratina para resistência à tração) e Junções GAP (canais de conexons para acoplamento elétrico e metabólico).",
      "Junções GAP (canais mecânicos) e Hemidesmossomos (troca iônica rápida de glicose).",
      "Microvilosidades (sustentação celular) e Zônulas de oclusão (comunicação citoplasmática).",
      "Estereocílios (bloqueio elétrico) e Desmossomos (passagem direta de hormônios)."
    ],
    answer: 0,
    explanation: "Desmossomos (máculas de adesão) ancoram filamentos intermediários de queratina suportando grandes tensões mecânicas na epiderme. Junções GAP comunicantes formam poros de conexons permitindo fluxo direto de íons e metabólitos."
  },
  {
    phase: 2,
    topic: "Estudo Dirigido: Tecido Epitelial",
    question: "Quanto à ultraestrutura do citoesqueleto interno e à função biológica, diferencie CORRETAMENTE microvilosidades de cílios:",
    options: [
      "Microvilosidades possuem microtúbulos 9+2 e batem ativamente; cílios contêm actina e aumentam a absorção intestinal.",
      "Microvilosidades contêm feixes de filamentos de actina e ampliam a área absortiva; cílios contêm microtúbulos (axonema 9+2) e exercem motilidade coordenada.",
      "Microvilosidades realizam propulsão unidirecional de muco na traqueia; cílios realizam absorção na borda em escova renal.",
      "Ambas são projeções estáticas sustentadas exclusivamente por filamentos de miosina e queratina."
    ],
    answer: 1,
    explanation: "Microvilosidades contêm filamentos longitudinais de actina unidos por vilina/fimbrina para maximizar a área de absorção (borda em escova). Cílios possuem axonema com 9 pares periféricos e 1 central de microtúbulos (9+2) associados a dineína para batimento móvel."
  },
  {
    phase: 2,
    topic: "Estudo Dirigido: Tecido Epitelial",
    question: "Um epitélio composto por uma única camada de células onde todas tocam a membrana basal, mas com núcleos em diferentes alturas simulando múltiplas camadas, é classificado como:",
    options: [
      "Estratificado pavimentoso não queratinizado de transição.",
      "Simples cúbico secretor com microvilosidades apicais.",
      "Pseudoestratificado prismático (cilíndrico), típico das vias respiratórias.",
      "Estratificado prismático com queratinização total."
    ],
    answer: 2,
    explanation: "No epitélio pseudoestratificado, todas as células repousam sobre a membrana basal, mas como têm alturas desiguais, seus núcleos situam-se em diferentes níveis, simulando estratificação."
  },
  {
    phase: 2,
    topic: "Estudo Dirigido: Tecido Epitelial",
    question: "Como as glândulas se originam embriologicamente e qual o critério histológico que diferencia glândulas exócrinas de endócrinas?",
    options: [
      "As exócrinas mantêm conexão com a superfície através de ductos secretores; as endócrinas perdem os ductos e liberam hormônios nos capilares sanguíneos.",
      "As exócrinas liberam hormônios na circulação linfática; as endócrinas mantêm ductos ramificados para a derme profunda.",
      "As exócrinas originam-se do tecido adiposo; as endócrinas originam-se de neurônios da medula espinhal.",
      "As exócrinas são formadas por condrócitos avasculares; as endócrinas não possuem células epiteliais."
    ],
    answer: 0,
    explanation: "Glândulas formam-se por invaginação celular do epitélio no conjuntivo subjacente. Glândulas exócrinas mantêm ductos condutores para a superfície; glândulas endócrinas perdem os ductos e vertem seus hormônios diretamente na corrente sanguínea."
  },
  {
    phase: 2,
    topic: "Estudo Dirigido: Tecido Epitelial",
    question: "Qual alternativa exemplifica com exatidão os modos de secreção merócrina, apócrina e holócrina?",
    options: [
      "Merócrina: morte celular por apoptose; Apócrina: exocitose pura; Holócrina: perda do ápice celular.",
      "Merócrina: exocitose pura sem perda citoplasmática (pâncreas/salivares); Apócrina: perda do ápice celular (glândula mamária); Holócrina: lise e morte celular total (glândula sebácea).",
      "Merócrina: glândula sebácea; Apócrina: tireoide folicular; Holócrina: pâncreas exócrino.",
      "Merócrina: perda total da membrana; Apócrina: difusão gasosa simples; Holócrina: exocitose por vesículas de clatrina."
    ],
    answer: 1,
    explanation: "Merócrina libera vesículas por exocitose pura sem dano celular; Apócrina perde uma porção apical do citoplasma com a secreção lipídica; Holócrina acumula produto até a célula inteira morrer e se desintegrar virando a secreção (sebo)."
  },
  {
    phase: 2,
    topic: "Estudo Dirigido: Tecido Epitelial",
    question: "O epitélio de transição (urotélio) possui grande plasticidade adaptativa. O que ocorre com suas células superficiais ('em cúpula' / guarda-chuva) quando a bexiga se enche de urina?",
    options: [
      "As células sofrem necrose e são substituídas por fibras de colágeno denso modelado.",
      "As células adquirem cílios móveis de queratina para propelir a urina até os cálices renais.",
      "O epitélio aumenta de 2 para 20 camadas através de rápida proliferação mitótica de osteoblastos.",
      "As células superficiais em cúpula achatam-se e o epitélio se estira, reduzindo a espessura aparente sem romper a barreira impermeável."
    ],
    answer: 3,
    explanation: "Na bexiga cheia e distendida, as células superficiais volumosas 'em cúpula' achatam-se e as camadas deslizam entre si, adelgaçando o epitélio e mantendo a impermeabilidade química contra a urina hipertônica."
  },
  {
    phase: 2,
    topic: "Estudo Dirigido: Tecido Epitelial",
    question: "Em uma cicatriz cirúrgica com intensa síntese de colágeno, qual célula conjuntiva é a principal protagonista e quais suas características morfológicas ativas?",
    options: [
      "Plasmócito: célula produtora de anticorpos IgE com núcleo em roda de carroça.",
      "Mastócito: célula esférica com grânulos metacromáticos de heparina e histamina.",
      "Fibroblasto: célula fusiforme com citoplasma basófilo rico em RER, Golgi desenvolvido e núcleo eucromático ativo.",
      "Adipócito unilocular: célula com vacúolo lipídico gigante que sintetiza colágeno por termogênese."
    ],
    answer: 2,
    explanation: "O fibroblasto é a célula chave da síntese de matriz na cicatrização. Em estado ativo é fusiforme ou estrelado, com RER e Golgi exuberantes (citoplasma basófilo) e núcleo claro eucromático com nucléolo evidente."
  },

  // ==========================================
  // ESTUDO DIRIGIDO: TECIDO CONJUNTIVO (10 QUESTÕES)
  // ==========================================
  {
    phase: 3,
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    question: "Diferente do tecido epitelial (altamente celular e avascular), o tecido conjuntivo é caracterizado histologicamente por:",
    options: [
      "Células esparsas distribuídas em uma abundante matriz extracelular (MEC) composta por fibras e substância fundamental amorfa.",
      "Células justapostas aderidas por zônulas de oclusão e ausência total de substância fundamental amorfa.",
      "Predomínio de células poliédricas e completa ausência de vascularização em todos os seus subtipos.",
      "Matriz acelular impermeável formada exclusivamente por queratina hidrofóbica."
    ],
    answer: 0,
    explanation: "O tecido conjuntivo possui células amplamente separadas por uma abundante Matriz Extracelular (MEC), formada por fibras proteicas (colágenas, reticulares, elásticas) e substância fundamental amorfa rica em água e proteoglicanos."
  },
  {
    phase: 3,
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    question: "Qual alternativa compara CORRETAMENTE o tecido adiposo unilocular (branco) com o multilocular (marrom)?",
    options: [
      "Unilocular: rico em termogenina mitocondrial que gera calor; Multilocular: gota lipídica única que empurra o núcleo para a borda.",
      "Unilocular: gota lipídica única e reserva energética; Multilocular: múltiplas gotículas, rico em mitocôndrias com termogenina (UCP-1) e termogênese.",
      "Unilocular: especializado na locomoção de espermatozoides; Multilocular: ausente em recém-nascidos e mamíferos.",
      "Ambos realizam apenas isolamento elétrico dos axônios motores no sistema nervoso periférico."
    ],
    answer: 1,
    explanation: "O adiposo unilocular armazena triglicerídeos em uma gota única volumosa (reserva e amortecimento). O multilocular contém múltiplas gotículas lipídicas e termogenina (UCP-1) mitocondrial, gerando calor direto por termogênese sem calafrios."
  },
  {
    phase: 3,
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    question: "Relacione a arquitetura das fibras de colágeno tipo I com a biomecânica e localização do tecido conjuntivo denso:",
    options: [
      "Denso Modelado: feixes colágenos entrelaçados em todas as direções na derme; Denso Não Modelado: feixes paralelos em tendões.",
      "Frouxo: predomínio maciço de grossos feixes de colágeno I rígidos; Denso Modelado: matriz gelatinosa rica em água e poucas fibras.",
      "Denso Modelado: feixes paralelos regulares resistentes à tração unidirecional (tendões); Denso Não Modelado: feixes entrelaçados resistentes a trações multidirecionais (derme).",
      "Ambos são tecidos avasculares desprovidos de fibroblastos e de substância fundamental."
    ],
    answer: 2,
    explanation: "Denso modelado tem feixes paralelos compactos na mesma direção das forças de tração uniaxial (tendões e ligamentos). Denso não modelado tem feixes grossos entrelaçados em malha tridimensional contra trações multidirecionais (derme profunda e cápsulas de órgãos)."
  },
  {
    phase: 3,
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    question: "Qual é o mecanismo celular que desencadeia a desgranulação maciça dos mastócitos na hipersensibilidade imediata (alergia tipo I)?",
    options: [
      "Fagocitose ativa de colágeno desnaturado por receptores Toll-like no núcleo celular.",
      "Bloqueio dos canais de potássio dependentes de voltagem com lise celular mecânica.",
      "Inibição da síntese de prostaglandinas e conversão em fibrócitos quiescentes.",
      "Ligação cruzada (cross-linking) de alérgenos a anticorpos IgE fixados em receptores Fc da membrana, induzindo desgranulação rápida de histamina."
    ],
    answer: 3,
    explanation: "Ao ocorrer nova exposição, o alérgeno liga-se simultaneamente a moléculas vizinhas de IgE presas a receptores Fc de alta afinidade na membrana do mastócito (cross-linking), disparando exocitose imediata de grânulos com histamina, heparina e proteases."
  },
  {
    phase: 3,
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    question: "Na síntese intracelular de colágeno pelo fibroblasto, qual é o papel essencial exercido pela Vitamina C (ácido ascórbico)?",
    options: [
      "Atua como cofator essencial para as enzimas prolil- e lisil-hidroxilases no RER, estabilizando a tripla hélice de pró-colágeno.",
      "Atua clivando os propeptídeos terminais no espaço extracelular para gerar tropocolágeno.",
      "Promove a oxigenação direta dos desmossomos basais do tecido conjuntivo.",
      "Inibe a tradução de colágeno nos polirribossomos para evitar fibrose pulmonar."
    ],
    answer: 0,
    explanation: "A Vitamina C é cofator indispensável para as hidroxilases no RER (mantendo o Fe2+ reduzido). Sem a hidroxilação de prolina e lisina, a molécula de pró-colágeno não forma pontes de hidrogênio intercatenárias estáveis e é destruída termicamente."
  },
  {
    phase: 3,
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    question: "Um paciente com carência grave e crônica de Vitamina C desenvolve sangramento gengival espontâneo, petéquias e dentes frouxos. Qual a patogênese do escorbuto?",
    options: [
      "Destruição autoimune dos mastócitos perivasculares com trombocitopenia severa.",
      "A ausência de Vitamina C impede a hidroxilação do colágeno, tornando-o termolábil e fragilizando capilares sanguíneos e o ligamento periodontal.",
      "Hipermineralização do osso alveolar que comprime as gengivas causando necrose isquêmica.",
      "Mutação no gene da termogenina com acúmulo patológico de adipócitos multiloculares na polpa dentária."
    ],
    answer: 1,
    explanation: "A falta de Vitamina C impede a formação de fibrilas normais de colágeno tipo I. Isso enfraquece a parede e a sustentação dos capilares sanguíneos (provocando petéquias e hemorragias) e causa rápida lise do ligamento periodontal (mobilidade e perda dentária)."
  },
  {
    phase: 3,
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    question: "Em relação à lâmina própria das mucosas e aos tendões, correlacione suas funções com as variedades de tecido conjuntivo correspondentes:",
    options: [
      "A lâmina própria possui feixes paralelos rígidos inextensíveis; os tendões têm matriz frouxa permeável para rápida difusão.",
      "Ambas as estruturas são formadas por tecido conjuntivo reticular com função hematopoética exclusiva.",
      "A lâmina própria (areolar frouxo) é flexível e permeável para difusão sob o epitélio; os tendões (denso modelado) têm feixes paralelos compactos para suportar fortes trações unidirecionais.",
      "A lâmina própria é composta por cartilagem elástica; os tendões são formados por mesênquima indiferenciado."
    ],
    answer: 2,
    explanation: "A lâmina própria é conjuntivo areolar (frouxo), permitindo flexibilidade, difusão metabólica e passagem celular sob o epitélio. Os tendões são de conjuntivo denso modelado, com colágeno I paralelo e inextensível para transmitir força muscular aos ossos."
  },
  {
    phase: 3,
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    question: "Os macrófagos originam-se de monócitos da medula óssea. Quais nomes especiais eles recebem quando residem no fígado, no sistema nervoso central e no tecido ósseo?",
    options: [
      "Fígado: Células de Langerhans; SNC: Astrócitos protoplasmáticos; Tecido Ósseo: Osteoblastos.",
      "Fígado: Hepatócitos sinusoidais; SNC: Células de Schwann; Tecido Ósseo: Condrócitos lacunares.",
      "Fígado: Células parietais; SNC: Ependimócitos; Tecido Ósseo: Células osteoprogenitoras.",
      "Fígado: Células de Kupffer; SNC: Micróglia; Tecido Ósseo: Osteoclastos."
    ],
    answer: 3,
    explanation: "No fígado recebem o nome de Células de Kupffer; no SNC chamam-se Micróglia; no tecido ósseo fundem-se em Osteoclastos (células gigantes multinucleadas reabsortivas de matriz)."
  },
  {
    phase: 3,
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    question: "Qual é o papel biológico desempenhado pelas glicoproteínas multiadesivas (como fibronectina e laminina) na matriz extracelular do tecido conjuntivo?",
    options: [
      "Atuam como pontes moleculares ligando integrinas celulares a fibras colágenas e proteoglicanos, mediando adesão e mecanotransdução.",
      "Catalisam a quebra imediata de ácido hialurônico para desidratar a matriz conjuntiva.",
      "Formam a barreira hematoencefálica através de junções de oclusão impermeáveis aos íons sódio.",
      "Secretam anticorpos IgG de alta afinidade contra bactérias encapsuladas no interstício."
    ],
    answer: 0,
    explanation: "Glicoproteínas multiadesivas possuem sítios específicos para colágenos, proteoglicanos e integrinas de membrana, conectando fisicamente o citoesqueleto da célula à matriz extracelular e mediando sinais mecânicos e adesão."
  },
  {
    phase: 3,
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    question: "Onde o tecido conjuntivo mucoso (rico em substância fundamental amorfa gelatinosa e ácido hialurônico com esparsas fibras colágenas) é classicamente encontrado no corpo humano?",
    options: [
      "Na camada reticular da derme adulta e nas suturas dos ossos planos do crânio.",
      "No cordão umbilical do feto (Gelatina de Wharton) e como resquício na polpa dentária jovem.",
      "No interior das trabéculas ósseas amarelas e na cápsula fibrosa do baço.",
      "Nos discos intervertebrais idosos e na cartilagem articular do quadril."
    ],
    answer: 1,
    explanation: "O tecido conjuntivo mucoso é um tecido fetal gelatinoso rico em ácido hialurônico e fibroblastos estrelados, encontrado tipicamente no cordão umbilical (Gelatina de Wharton) e na polpa dentária jovem."
  }
];

/* ==========================================================================
   4. FLASHCARDS DATABASE (ESTILO ANKI)
   ========================================================================== */
const flashcardsData = [
  {
    category: "celula",
    topic: "Teoria Celular",
    prompt: "Quais são os 3 postulados clássicos fundamentais da Teoria Celular?",
    answer: "1) Todos os seres vivos são constituídos por células; 2) A célula é a menor unidade funcional e estrutural da vida; 3) Toda célula nasce exclusivamente de outra célula pré-existente (Omnis cellula e cellula).",
    analogy: "Mnemônico: TODOS são células, ela é a UNIDADE viva, e ninguém nasce do nada (BIOGÊNESE)!"
  },
  {
    category: "epitelial",
    topic: "Tecido Epitelial",
    prompt: "Como o tecido epitelial consegue oxigênio e nutrientes se ele não tem vasos sanguíneos (é avascular)?",
    answer: "Ele recebe tudo por DIFUSÃO a partir dos capilares sanguíneos situados no tecido conjuntivo adjacente, que fica logo abaixo da lâmina basal.",
    analogy: "Pensa num morador de condomínio fechado que recebe a comida pedindo por delivery na portaria (lâmina basal)!"
  },
  {
    category: "epitelial",
    topic: "Junções Celulares",
    prompt: "Qual a função da Junção de Oclusão (Zonula occludens)?",
    answer: "Promover o selamento hermético das membranas no ápice celular, impedindo que moléculas, ácidos ou bactérias passem entre as células (vedação transcelular).",
    analogy: "É o zíper à prova d'água das células epiteliais."
  },
  {
    category: "epitelial",
    topic: "Junções Celulares",
    prompt: "O que diferencia um Desmossomo de um Hemidesmossomo?",
    answer: "O Desmossomo liga UMA CÉLULA A OUTRA CÉLULA vizinha (com caderinas e filamentos de queratina). O Hemidesmossomo liga A CÉLULA À LÂMINA BASAL (com integrinas).",
    analogy: "Desmossomo = Aperto de mão entre irmãs. Hemidesmossomo = Âncora jogada no fundo do barco (lâmina basal)."
  },
  {
    category: "glandular",
    topic: "Epitélio Glandular",
    prompt: "Diferencie Secreção Merócrina, Apócrina e Holócrina:",
    answer: "• Merócrina: Libera por exocitose sem perder citoplasma (ex: pâncreas, salivares);\n• Apócrina: Perde o ápice do citoplasma na secreção (ex: mamária em lactação);\n• Holócrina: A célula morre inteira e se desintegra virando a secreção (ex: sebácea).",
    analogy: "Mero produto (Merócrina), Ápice quebrado (Apócrina), Holocausto mortal da célula (Holócrina)!"
  },
  {
    category: "glandular",
    topic: "Epitélio Glandular",
    prompt: "O que difere uma glândula Endócrina Cordonal de uma Folicular?",
    answer: "Cordonal: células em cordões paralelos ao redor de vasos (ex: paratireoide, adrenal). Folicular: células em esferas ocas que armazenam hormônio no centro (colóide) (ex: tireoide).",
    analogy: "Cordão = Fila indiana de células. Folicular = Roda de ciranda com um lago no meio."
  },
  {
    category: "conjuntivo",
    topic: "Tecido Conjuntivo",
    prompt: "Qual é a diferença entre Fibroblasto e Fibrócito?",
    answer: "Fibroblasto é a célula JOVEM, metabolicamente ATIVA, rica em RER e sintetizando matriz e fibras vigorosamente. Fibrócito é a célula MADURA, menor, fusiforme e em estado de repouso/quiescência.",
    analogy: "Fibroblasto = Estagiário animado carregando cimento. Fibrócito = Engenheiro descansando na cadeira."
  },
  {
    category: "conjuntivo",
    topic: "Tecido Adiposo",
    prompt: "Por que a gordura branca (unilocular) tem aspecto em 'anel de sinete' ao microscópio óptico comum?",
    answer: "Porque a grande gota única de triglicerídeos é dissolvida pelos solventes químicos (xilol) na preparação da lâmina, deixando um espaço em branco com o núcleo empurrado na borda.",
    analogy: "Parece um anel de casamento com brilhante: o aro fino é o citoplasma e a pedra é o núcleo na quina!"
  },
  {
    category: "cartilagem",
    topic: "Tecido Cartilaginoso",
    prompt: "Por que a Cartilagem Articular NÃO possui pericôndrio?",
    answer: "Porque o pericôndrio é fibroso e causaria atrito áspero se estivesse na superfície articular de movimento. A cartilagem articular precisa ser perfeitamente polida e é nutrida pelo LÍQUIDO SINOVIAL.",
    analogy: "Pensa numa pista de patinação no gelo: não pode ter carpete áspero em cima!"
  },
  {
    category: "cartilagem",
    topic: "Tecido Cartilaginoso",
    prompt: "O que são 'Grupos Isogênicos' na cartilagem hialina?",
    answer: "São agrupamentos de 2 a 8 condrócitos alojados bem próximos que se originaram das divisões mitóticas recentes de um mesmo condroblasto original.",
    analogy: "São irmãos gêmeos dividindo o mesmo quarto antes de terem dinheiro para construir suas próprias casas!"
  },
  {
    category: "cartilagem",
    topic: "Tecido Cartilaginoso",
    prompt: "Quais são as duas cartilagens do corpo humano que NÃO possuem pericôndrio?",
    answer: "1) Cartilagem Articular das articulações sinoviais móveis; 2) Fibrocartilagem (cartilagem fibrosa dos discos intervertebrais e sínfise púbica).",
    analogy: "Grave na mente: ARTICULAR e FIBROSA são livres de pericôndrio!"
  },
  {
    category: "osseo",
    topic: "Tecido Ósseo",
    prompt: "Qual é a principal composição química da matriz óssea mineralizada (inorgânica)?",
    answer: "Cristais de Hidroxiapatita [Ca10(PO4)6(OH)2], ricos em fosfato de cálcio hidratado, além de bicarbonato, magnésio e potássio.",
    analogy: "É o concreto armado do osso: o colágeno I é o vergalhão de aço e a hidroxiapatita é a brita mineral."
  },
  {
    category: "osseo",
    topic: "Tecido Ósseo",
    prompt: "O que são as 'Lacunas de Howship'?",
    answer: "São depressões ou cavidades de erosão escavadas na superfície do osso onde os OSTEOCLASTOS se instalam para degradar e reabsorver a matriz com ácido e colagenase.",
    analogy: "É a cratera que a retroescavadeira (osteoclasto) deixa quando cava o asfalto!"
  },
  {
    category: "osseo",
    topic: "Tecido Ósseo",
    prompt: "Como os osteócitos se comunicam dentro da matriz calcificada impenetrável?",
    answer: "Eles emitem dezenas de prolongamentos citoplasmáticos que viajam por finíssimos CANALÍCULOS ósseos e tocam as células vizinhas através de JUNÇÕES GAP.",
    analogy: "É uma rede de cabos de fibra óptica passando por tubulações de concreto no meio do osso!"
  },
  {
    category: "osseo",
    topic: "Tecido Ósseo",
    prompt: "Diferencie Ossificação Intramembranosa de Endocondral:",
    answer: "• Intramembranosa: O osso se forma direto dentro de membranas de conjuntivo embrionário (ossos do crânio, mandíbula);\n• Endocondral: O osso é construído sobre o molde prévio de uma cartilagem hialina que vai sendo calcificada e substituída (ossos longos).",
    analogy: "Intramembranosa = Construção direta na terra vazia. Endocondral = Demolir uma maquete de gesso para botar alvenaria por cima."
  },

  // ==========================================
  // FLASHCARDS: ESTUDO DIRIGIDO (21 QUESTÕES)
  // ==========================================
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Epitelial",
    prompt: "O que caracteriza o tecido epitelial quanto a células, MEC e vascularização?",
    answer: "Células poliédricas intimamente justapostas com mínima matriz extracelular (MEC escassa) e total ausência de vasos sanguíneos (tecido avascular), nutrindo-se por difusão do tecido conjuntivo.",
    analogy: "Muralha de tijolos sem cimento sobrando, recebendo mantimentos via delivery da cidade vizinha (lâmina própria)!"
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Epitelial",
    prompt: "Quais são os 3 folhetos embrionários que originam epitélios e dê um exemplo de cada?",
    answer: "• Ectoderme: Epiderme da pele e córnea;\n• Mesoderme: Endotélio vascular e mesotélios serosos (pleura, pericárdio, peritônio);\n• Endoderme: Revestimento interno do trato gastrointestinal e respiratório.",
    analogy: "Ecto = Casca externa; Meso = Tubos do meio e cavidades; Endo = Forro do estômago e pulmão."
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Epitelial",
    prompt: "Quais os principais componentes moleculares e funções da Membrana Basal?",
    answer: "Componentes: Colágeno tipo IV, Laminina, Perlecan (heparam sulfato) e Entactina/Nidogênio.\nFunções: Suporte mecânico, adesão celular, filtro macromolecular seletivo e guia para regeneração.",
    analogy: "É o carpete com velcro (laminina) e malha de segurança (colágeno IV) onde o epitélio se apoia."
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Epitelial",
    prompt: "Diferencie Junção de Oclusão (Zonula occludens) de Junção de Adesão (Zonula adherens):",
    answer: "• Oclusão: Veda o espaço intercelular com claudinas/ocludinas, bloqueando fluxo paracelular e mantendo polaridade apical/basolateral;\n• Adesão: Ancora feixes de filamentos de actina via caderinas e cateninas para resistência mecânica.",
    analogy: "Oclusão = Zíper vedante impermeável. Adesão = Cinto de segurança ligado ao citoesqueleto de actina."
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Epitelial",
    prompt: "Qual a função dos Desmossomos e das Junções Comunicantes (GAP)?",
    answer: "• Desmossomos: Botões de adesão forte ancorados a queratina (tonofilamentos), essenciais contra atrito (abundantes na epiderme);\n• Junções GAP: Canais cilíndricos de conexons (6 conexinas) para troca direta de íons e acoplamento elétrico.",
    analogy: "Desmossomo = Rebite de lataria de carro de rali. GAP = Tubo telefônico entre apartamentos vizinhos."
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Epitelial",
    prompt: "Diferencie Microvilosidades de Cílios quanto ao citoesqueleto e função:",
    answer: "• Microvilosidades: Feixes paralelos de ACTINA imóveis que aumentam a área de absorção (borda em escova nos enterócitos e rins);\n• Cílios: Axonema de MICROTÚBULOS (arranjo 9+2) com dineína motora para batimento ativo e transporte de muco (traqueia e tubas uterinas).",
    analogy: "Microvilosidade = Pêlos de toalha para puxar água (absorver). Cílio = Remos de barco batendo em sincronia."
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Epitelial",
    prompt: "Como se classificam os epitélios de revestimento por camadas e morfologia superficial?",
    answer: "• Camadas: Simples (1 camada), Estratificado (>= 2 camadas), Pseudoestratificado (1 camada com núcleos em alturas desiguais);\n• Superfície: Pavimentoso (achatado), Cúbico (quadrado), Prismático/Cilíndrico (alto) e De Transição.",
    analogy: "Conte os andares do prédio e olhe a forma das janelas da cobertura!"
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Epitelial",
    prompt: "Como se formam as glândulas e o que diferencia glândula Exócrina de Endócrina?",
    answer: "Formam-se por proliferação e invaginação do epitélio no conjuntivo.\n• Exócrinas: Mantêm ducto para a superfície/luz do órgão;\n• Endócrinas: Perdem o ducto e liberam hormônios diretamente nos capilares sanguíneos.",
    analogy: "Exócrina tem chaminé/cano para fora. Endócrina joga na rede de esgoto/sangue do prédio."
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Epitelial",
    prompt: "Diferencie secreção Merócrina, Apócrina e Holócrina com exemplos:",
    answer: "• Merócrina: Exocitose pura sem perda celular (pâncreas e salivares);\n• Apócrina: Liberação junto com o ápice do citoplasma (leite lipídico mamário);\n• Holócrina: A célula se enche de produto, morre e se desintegra virando o sebo (glândula sebácea).",
    analogy: "Mero produto (Merócrina), Ápice descartado (Apócrina), Holocausto da célula (Holócrina)!"
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Epitelial",
    prompt: "O que é o Urotélio (epitélio de transição) e como suas células se adaptam à bexiga cheia?",
    answer: "Epitélio estratificado exclusivo das vias urinárias. Na bexiga vazia as células superficiais são convexas 'em cúpula'; na bexiga cheia elas se achatam como escamas, reduzindo o número aparente de camadas sem perder a impermeabilidade.",
    analogy: "É uma bexiga de festa: quando você enche, a borracha afina mas nunca deixa o ar vazar!"
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Epitelial",
    prompt: "Qual célula conjuntiva protagoniza a cicatrização e quais suas características ativas?",
    answer: "O Fibroblasto. Em estado ativo é fusiforme ou estrelado, com citoplasma basófilo repleto de RER e Golgi para síntese maciça de procolágeno, e núcleo grande eucromático com nucléolo evidente.",
    analogy: "É o mestre de obras ativado na reforma: ferramentas na mão (RER) e plantas abertas (núcleo claro)."
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    prompt: "Quais os componentes fundamentais do tecido conjuntivo e como ele se difere do epitélio?",
    answer: "Composto por Células (fixas e transitórias) e abundante Matriz Extracelular (Fibras colágenas/reticulares/elásticas + Substância Fundamental Amorfa). Diferente do epitélio celular e avascular, o conjuntivo tem células esparsas e muita MEC vascularizada.",
    analogy: "Epitélio = Ônibus lotado de gente. Conjuntivo = Parque espaçoso com pouca gente e muito gramado (MEC)."
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    prompt: "Diferencie Tecido Adiposo Unilocular de Multilocular (Termogenina/UCP-1):",
    answer: "• Unilocular (branco): Gota lipídica única gigante, núcleo periférico achatado, função de reserva energética e isolamento;\n• Multilocular (marrom): Múltiplas gotículas, núcleo central, rico em mitocôndrias com termogenina (UCP-1) que dissipa gradiente para gerar calor puro.",
    analogy: "Unilocular = Tanque de gasolina reserva. Multilocular = Lareira/aquecedor do bebê."
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    prompt: "Compare Conjuntivo Frouxo, Denso Não Modelado e Denso Modelado:",
    answer: "• Frouxo: Equilíbrio células/matriz, flexível, na lâmina própria sob epitélios;\n• Denso Não Modelado: Grossos feixes de colágeno I entrelaçados em várias direções, resiste a forças multidirecionais (derme profunda);\n• Denso Modelado: Feixes paralelos compactos de colágeno I, resiste a tração extrema unidirecional (tendões).",
    analogy: "Frouxo = Algodão doce maleável. Denso não modelado = Pneu trançado. Denso modelado = Cabo de aço esticado."
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    prompt: "Como ocorre a ativação dos mastócitos na hipersensibilidade imediata (alergia tipo I)?",
    answer: "O alérgeno se liga simultaneamente a anticorpos IgE fixados a receptores Fc de alta afinidade na membrana do mastócito (cross-linking), provocando exocitose maciça de grânulos com histamina, heparina e proteases.",
    analogy: "O alérgeno aperta dois botões de alarme vizinhos (IgE) ao mesmo tempo, disparando o alarme da bomba (histamina)!"
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    prompt: "Qual o papel fundamental da Vitamina C na síntese de colágeno pelo fibroblasto?",
    answer: "Atua como cofator redutor essencial (mantém Fe2+) para as enzimas prolil- e lisil-hidroxilases no RER. A hidroxilação de prolina e lisina é indispensável para formar pontes de hidrogênio que estabilizam a tripla hélice de pró-colágeno.",
    analogy: "Sem vitamina C, a trança de colágeno desmancha e é jogada fora pelo controle de qualidade!"
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    prompt: "Explique a fisiopatologia molecular do Escorbuto (sangramento gengival e dentes frouxos):",
    answer: "A carência de Vitamina C inibe a hidroxilação do colágeno, tornando-o termolábil e degradado. A falta de colágeno I enfraquece as paredes dos capilares sanguíneos (petéquias e sangramento gengival) e lisa o ligamento periodontal (dentes soltos).",
    analogy: "Sem reboco bom (colágeno), os canos estouram (hemorragia) e as colunas bambeiam (dentes frouxos)!"
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    prompt: "Correlacione o tecido conjuntivo areolar (frouxo) e o denso modelado com lâmina própria e tendões:",
    answer: "• Lâmina própria: É de conjuntivo areolar frouxo, permitindo difusão rápida de nutrientes/O2 para o epitélio avascular e mobilidade de leucócitos;\n• Tendões: São de conjuntivo denso modelado, com feixes paralelos rígidos e inextensíveis para transmitir 100% da força muscular aos ossos.",
    analogy: "Lâmina própria = Rodovia aberta para suprimentos. Tendão = Cabo de tração que puxa o guindaste."
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    prompt: "Qual a origem dos macrófagos e seus nomes específicos no fígado, SNC e osso?",
    answer: "Originam-se de monócitos da medula óssea que migram por diapedese aos tecidos (Sistema Fagocítico Mononuclear).\n• Fígado: Células de Kupffer;\n• Sistema Nervoso Central: Micróglia;\n• Tecido Ósseo: Osteoclastos (células gigantes de reabsorção).",
    analogy: "O policial (monócito) muda de uniforme dependendo da cidade onde atua: Kupffer no fígado, Micróglia no cérebro e Osteoclasto no osso!"
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    prompt: "Qual a função das glicoproteínas multiadesivas (Fibronectina e Laminina) na MEC?",
    answer: "Atuam como pontes moleculares com sítios de ancoragem para colágeno, proteoglicanos e integrinas da membrana celular, mediando a adesão estrutural da célula à matriz e a mecanotransdução de sinais.",
    analogy: "São os grampos moleculares de dupla face que prendem a célula no chão da matriz!"
  },
  {
    category: "estudo-dirigido",
    topic: "Estudo Dirigido: Tecido Conjuntivo",
    prompt: "O que é o tecido conjuntivo mucoso e onde ele é classicamente encontrado no corpo humano?",
    answer: "Tecido conjuntivo gelatinoso com predomínio de substância fundamental amorfa rica em Ácido Hialurônico e fibroblastos estrelados esparsos. Encontrado classicamente no CORDÃO UMBILICAL fetal (Gelatina de Wharton) e na polpa dentária jovem.",
    analogy: "A Gelatina de Wharton é o travesseiro de hidrogel que protege as artérias do cordão umbilical de serem esmagadas."
  }
];

/* ==========================================================================
   5. MNEMONICS & EXAM CHEATS DATABASE
   ========================================================================== */
const mnemonicsData = [
  {
    badge: "Macetes de Células Ósseas",
    phrase: "BLASTO Botou, CLASTO Comeu, CITO Cuidou!",
    target: "Osteoblasto vs Osteoclasto vs Osteócito",
    explanation: "OsteoBLASTO = Constrói/Bota matriz nova. OsteoCLASTO = Corrói/Come e reabsorve osso. OsteóCITO = Célula calma que cuida e monitora a matriz em repouso."
  },
  {
    badge: "Macetes de Glândulas Exócrinas",
    phrase: "MERO Suor, APICE Voa, HOLOCAUSTO Total!",
    target: "Merócrina vs Apócrina vs Holócrina",
    explanation: "MEROcrina = Sai mero produto por exocitose sem dano. APOcrina = O ápice citoplasmático voa junto com a secreção. HOLOcrina = Holocausto da célula (ela morre e vira secreção)."
  },
  {
    badge: "Macetes dos Canais Ósseos",
    phrase: "HAVERS é Vertical (Haste), VOLKMANN é na Horizontal (Via transversal)!",
    target: "Canais de Havers vs Canais de Volkmann",
    explanation: "O 'H' de Havers lembra 'Haste' vertical (longitudinal ao osso longo). O 'V' de Volkmann lembra uma 'Via transversal' que fura de lado para interligar os canais."
  },
  {
    badge: "Macetes das Zonas de Crescimento Ósseo",
    phrase: "Re-Pro-Hi-Cal-Oss: A Fábrica da Fise!",
    target: "As 5 Zonas do Disco Epifisário de Crescimento",
    explanation: "1. Repouso (Quieto) -> 2. Proliferação (Pilhas de moedas) -> 3. Hipertrofia (Células gordinhas) -> 4. Calcificação (Morte celular) -> 5. Ossificação (Vaso entra e osso nasce)."
  },
  {
    badge: "Macetes de Coloração H&E",
    phrase: "Ácido com Básico se atrai: H com N e E com C!",
    target: "Hematoxilina e Eosina",
    explanation: "Hematoxilina (básica/azul) adora Núcleo (ácido/DNA) -> Basofilia. Eosina (ácida/rosa) adora Citoplasma e Colágeno (básicos/proteínas) -> Acidofilia."
  },
  {
    badge: "Macetes de Cartilagens sem Pericôndrio",
    phrase: "Articulação e Fibrocartilagem: 'Pericôndrio aqui NÃO entra!'",
    target: "Exceções do Pericôndrio",
    explanation: "Cartilagem articular precisa ser lisa e deslizar sem atrito (nutrida pelo líquido sinovial). Fibrocartilagem é puro colágeno I denso de disco intervertebral e não tem pericôndrio."
  },
  {
    badge: "Macetes dos Desmossomos",
    phrase: "Desmo = Célula com Célula. Hemi = Célula com Lâmina!",
    target: "Desmossomo vs Hemidesmossomo",
    explanation: "Desmossomo completo une duas células epiteliais irmãs. O HEMIdesmossomo é a metade que ancora o pé da célula na Lâmina Basal via integrinas."
  },
  {
    badge: "Macetes dos Folhetos Embrionários",
    phrase: "ECTO (Fora/Pele e Nervos), ENDO (Dentro/Tubos e Vísceras), MESO (O Meio que sustenta e bate)",
    target: "Origem Embrionária dos Tecidos",
    explanation: "Ectoderme dá origem à epiderme e sistema nervoso; Endoderme ao revestimento digestório e respiratório; Mesoderme dá origem aos tecidos conjuntivos, cartilagens, ossos, músculos e endotélio."
  }
];

/* ==========================================================================
   6. DICHOTOMOUS DIAGNOSTIC TREE (DETETIVE DE LÂMINAS)
   ========================================================================== */
const diagnosticTree = {
  root: {
    question: "Passo 1: Olhando a lâmina, como estão distribuídas as células e a matriz extracelular (MEC)?",
    choices: [
      {
        title: "Células coladas umas nas outras (justapostas), formando camadas contínuas com quase nenhuma matriz entre elas.",
        subtitle: "Aspecto de parede de tijolos fechada.",
        next: "epitelial_branch"
      },
      {
        title: "Células bem espaçadas, mergulhadas em bastante matriz extracelular (MEC abundante ou mineralizada).",
        subtitle: "Aspecto aberto com fibras, gel ou canais circulares rígidos.",
        next: "conjuntivo_branch"
      }
    ]
  },
  epitelial_branch: {
    question: "Passo 2: Quantas camadas de células você observa sobre a lâmina basal?",
    choices: [
      {
        title: "Apenas UMA única camada de células (todos os núcleos alinhados na mesma altura).",
        subtitle: "Epitélio simples.",
        next: "epitelial_simples"
      },
      {
        title: "Parece ter várias camadas, mas TODAS as células tocam a base e os núcleos estão em alturas diferentes, com cílios no topo!",
        subtitle: "Comum na traqueia e vias respiratórias.",
        result: {
          title: "Tecido Epitelial Pseudoestratificado Colunar Ciliado (com células caliciformes)",
          location: "Traqueia, brônquios e cavidade nasal.",
          slideKey: "traqueia",
          points: [
            "Núcleos dispostos em alturas desencontradas dando falsa impressão de estratificação.",
            "Presença nítida de cílios apicais móveis (escovinha no topo).",
            "Células caliciformes intercaladas com citoplasma claro produtor de muco."
          ]
        }
      },
      {
        title: "VÁRIAS camadas reais de células sobrepostas (as de cima são achatadas e descamando).",
        subtitle: "Epitélio estratificado pavimentoso.",
        next: "epitelial_estratificado"
      }
    ]
  },
  epitelial_simples: {
    question: "Passo 3: Qual é o formato das células dessa camada única?",
    choices: [
      {
        title: "Achatadas como escamas de peixe com núcleos salientes finos.",
        subtitle: "Epitélio simples pavimentoso.",
        result: {
          title: "Epitélio Simples Pavimentoso (Endotélio / Alvéolos)",
          location: "Vasos sanguíneos (endotélio), capilares, alvéolos pulmonares e cápsula de Bowman nos rins.",
          slideKey: "pele",
          points: [
            "Espessura ultrafina ideal para difusão acelerada de gases e água.",
            "Células muito delgadas vistas de perfil como linhas."
          ]
        }
      },
      {
        title: "Células quadradas com largura e altura iguais (cúbicas) com núcleos esféricos centrais.",
        subtitle: "Revestimento tubular renal ou folículos tireoidianos.",
        result: {
          title: "Epitélio Simples Cúbico",
          location: "Túbulos contorcidos renais e superfície do ovário.",
          slideKey: "glandula",
          points: [
            "Especializado em transporte iônico ativo, secreção e excreção.",
            "Núcleos perfeitamente redondos no centro de cada cubo celular."
          ]
        }
      }
    ]
  },
  epitelial_estratificado: {
    question: "Passo 3: Há uma grossa camada superior acelular rósea de queratina sobre as células?",
    choices: [
      {
        title: "SIM! Uma espessa capa de queratina anucleada descamante por cima (pele seca).",
        subtitle: "Proteção contra ressecamento e invasão.",
        result: {
          title: "Epitélio Estratificado Pavimentoso Queratinizado (Pele Grossa / Epiderme)",
          location: "Epiderme da pele (palma da mão, planta do pé).",
          slideKey: "pele",
          points: [
            "Camada córnea externa de queratina compactada sem núcleos.",
            "Camada espinhosa com desmossomos evidentes conferindo coesão.",
            "Camada basal mitoticamente ativa apoiada na derme."
          ]
        }
      },
      {
        title: "NÃO! As células achatadas do topo ainda possuem núcleos visíveis e a superfície é úmida.",
        subtitle: "Epitélio estratificado pavimentoso não-queratinizado.",
        result: {
          title: "Epitélio Estratificado Pavimentoso Não-Queratinizado",
          location: "Esôfago, cavidade oral, faringe e vagina.",
          slideKey: "pele",
          points: [
            "Resiste a atrito mecânico constante em ambientes úmidos.",
            "Núcleos preservados até a camada mais superficial."
          ]
        }
      }
    ]
  },
  conjuntivo_branch: {
    question: "Passo 2: Qual é o estado físico e arquitetura da matriz extracelular?",
    choices: [
      {
        title: "Rígida, mineralizada, com anéis concêntricos (sistemas de Havers/ósteons) e canais vasculares.",
        subtitle: "Tecido ósseo maduro.",
        result: {
          title: "Tecido Ósseo Compacto (Lamelar / Sistema de Havers)",
          location: "Córtex dos ossos longos (diáfise de fêmur, tíbia) e tábuas cranianas.",
          slideKey: "osso_compacto",
          points: [
            "Ósteons típicos com canal central de Havers cercado por lamelas circulares.",
            "Osteócitos alojados em pequenas lacunas escuras interligados por finos canalículos.",
            "Canais de Volkmann perfurando horizontalmente."
          ]
        }
      },
      {
        title: "Matriz vítrea/gelatinosa homogênea basófila (roxa/azulada) com condrócitos em lacunas e grupos isogênicos.",
        subtitle: "Cartilagem hialina.",
        result: {
          title: "Tecido Cartilaginoso Hialino",
          location: "Anéis da traqueia, superfícies articulares móveis e extremidades das costelas.",
          slideKey: "cartilagem_hialina",
          points: [
            "Matriz rica em colágeno tipo II homogêneo (aspecto vítreo).",
            "Condrócitos em duplas ou quartetos (grupos isogênicos) dentro de lacunas.",
            "Delimitada externamente pelo pericôndrio (quando não articular)."
          ]
        }
      },
      {
        title: "Células gigantes arredondadas com o interior vazio/branco ('favos de mel' ou 'anel de sinete') e núcleo na quina.",
        subtitle: "Tecido adiposo unilocular.",
        result: {
          title: "Tecido Adiposo Unilocular (Gordura Branca / Amarela)",
          location: "Hipoderme (tecido subcutâneo), em volta de rins e mesentério.",
          slideKey: "tecido_adiposo",
          points: [
            "Gotícula única de triglicerídeo dissolvida pelo processamento histológico.",
            "Núcleo comprimido e achatado contra a membrana plasmática.",
            "Altíssima vascularização ao redor para liberação de ácidos graxos."
          ]
        }
      },
      {
        title: "Massa glandular formada por ácinos glandulares mucosos claros e ácinos serosos escuros com semiluas.",
        subtitle: "Glândula salivar mista.",
        result: {
          title: "Glândula Salivar Mista com Semiluas Serosas de Giannuzzi",
          location: "Glândula submandibular humana.",
          slideKey: "glandula",
          points: [
            "Ácinos serosos basófilos escuros (secreção fluida de amilase).",
            "Ácinos mucosos pálidos (secreção espessa de muco).",
            "Semiluas serosas abraçando o ápice dos túbulos mucosos."
          ]
        }
      }
    ]
  }
};

/* ==========================================================================
   7. VIRTUAL MICROSCOPE CANVAS ENGINE
   ========================================================================== */
class VirtualMicroscope {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.slideKey = "traqueia";
    this.zoom = 10;
    this.focus = 50; // 50 is perfect sharpness
    this.light = 85;
    this.pinsVisible = true;
    this.pinsOverlay = document.getElementById("pins-overlay");
    this.slideInfoCard = document.getElementById("slide-info-card");
  }

  init() {
    this.render();
  }

  setSlide(key) {
    this.slideKey = key;
    this.render();
    this.updateSlideInfo();
  }

  setZoom(zoom) {
    this.zoom = zoom;
    audio.playMicroscopeClick();
    this.render();
    this.updateMagnificationText();
  }

  setFocus(focusVal) {
    this.focus = focusVal;
    // Calculate blur: distance from 50 (sweet spot)
    const diff = Math.abs(this.focus - 50);
    const blurPx = (diff / 50) * 8; // 0 to 8px blur
    if (this.canvas) {
      this.canvas.style.filter = `blur(${blurPx.toFixed(1)}px) brightness(${(this.light / 80).toFixed(2)})`;
    }
    const readout = document.getElementById("focus-readout");
    if (readout) {
      if (diff < 6) {
        readout.textContent = "Nítido ⭐";
        readout.style.color = "var(--accent-emerald)";
      } else if (diff < 20) {
        readout.textContent = "Aceitável";
        readout.style.color = "var(--accent-amber)";
      } else {
        readout.textContent = "Desfocado";
        readout.style.color = "var(--accent-rose)";
      }
    }
  }

  setLight(lightVal) {
    this.light = lightVal;
    const diff = Math.abs(this.focus - 50);
    const blurPx = (diff / 50) * 8;
    if (this.canvas) {
      this.canvas.style.filter = `blur(${blurPx.toFixed(1)}px) brightness(${(this.light / 80).toFixed(2)})`;
    }
    const readout = document.getElementById("light-readout");
    if (readout) readout.textContent = `${this.light}%`;
  }

  setPinsVisible(visible) {
    this.pinsVisible = visible;
    if (this.pinsOverlay) {
      this.pinsOverlay.style.display = visible ? "block" : "none";
    }
  }

  updateMagnificationText() {
    const el = document.getElementById("total-magnification");
    if (el) {
      el.textContent = `${this.zoom * 10}x (Ocular 10x × Obj ${this.zoom}x)`;
    }
  }

  render() {
    if (!this.ctx) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.ctx.clearRect(0, 0, width, height);

    // Render slide specific canvas artwork
    switch (this.slideKey) {
      case "traqueia":
        this.renderTraqueia(width, height);
        break;
      case "pele":
        this.renderPele(width, height);
        break;
      case "glandula":
        this.renderGlandula(width, height);
        break;
      case "cartilagem_hialina":
        this.renderCartilagemHialina(width, height);
        break;
      case "osso_compacto":
        this.renderOssoCompacto(width, height);
        break;
      case "tecido_adiposo":
        this.renderTecidoAdiposo(width, height);
        break;
      default:
        this.renderTraqueia(width, height);
    }

    this.renderPins();
  }

  /* --- SLIDE 1: TRAQUEIA (PSEUDOESTRATIFICADO CILIADO) --- */
  renderTraqueia(w, h) {
    const ctx = this.ctx;
    // Background lamina propria (conjuntivo) - eosinophilic pink
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#fce7f3");
    bgGrad.addColorStop(0.45, "#fbcfe8");
    bgGrad.addColorStop(0.7, "#f472b6");
    bgGrad.addColorStop(1, "#ec4899");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Lumen space (top white/clear)
    ctx.fillStyle = "#faf5ff";
    ctx.beginPath();
    ctx.rect(0, 0, w, h * 0.28);
    ctx.fill();

    // Cilia layer on apical surface
    ctx.strokeStyle = "#be185d";
    ctx.lineWidth = 1.5;
    for (let x = 10; x < w - 10; x += 3.5) {
      const cy = h * 0.28;
      const cHeight = 18 + Math.sin(x * 0.05) * 4;
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.quadraticCurveTo(x + 4, cy - cHeight * 0.5, x + 2, cy - cHeight);
      ctx.stroke();
    }

    // Basal Membrane (thick pink line)
    ctx.strokeStyle = "#db2777";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.58);
    ctx.lineTo(w, h * 0.58);
    ctx.stroke();

    // Epithelial Columnar Cells & Goblet Cells
    const numCells = 36;
    for (let i = 0; i < numCells; i++) {
      const cx = (w / numCells) * i + 8;
      const isGoblet = i % 5 === 2;

      if (isGoblet) {
        // Goblet Cell (Célula Caliciforme - pálida em taça)
        ctx.fillStyle = "rgba(243, 232, 255, 0.9)";
        ctx.beginPath();
        ctx.moveTo(cx - 8, h * 0.3);
        ctx.lineTo(cx + 8, h * 0.3);
        ctx.quadraticCurveTo(cx + 12, h * 0.42, cx + 5, h * 0.56);
        ctx.lineTo(cx - 5, h * 0.56);
        ctx.quadraticCurveTo(cx - 12, h * 0.42, cx - 8, h * 0.3);
        ctx.fill();
        ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Goblet basal flat nucleus
        ctx.fillStyle = "#4c1d95";
        ctx.beginPath();
        ctx.ellipse(cx, h * 0.54, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Pseudoestratified nuclei (dispersed at different heights)
        const nY = h * 0.34 + ((i * 17) % 7) * 16;
        ctx.fillStyle = "#5b21b6"; // Hematoxilina roxa
        ctx.beginPath();
        ctx.ellipse(cx, nY, 7, 12, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Nucleolus
        ctx.fillStyle = "#312e81";
        ctx.beginPath();
        ctx.arc(cx - 1, nY - 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Connective tissue capillaries in Lamina Propria (bottom)
    ctx.fillStyle = "#fda4af";
    for (let c = 0; c < 5; c++) {
      const capX = 80 + c * 120;
      const capY = h * 0.75 + (c % 2) * 40;
      ctx.beginPath();
      ctx.ellipse(capX, capY, 26, 16, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Red blood cells (hemácias)
      ctx.fillStyle = "#ef4444";
      for (let r = -2; r <= 2; r++) {
        ctx.beginPath();
        ctx.arc(capX + r * 7, capY + (r % 2) * 4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* --- SLIDE 2: PELE GROSSA (ESTRATIFICADO PAVIMENTOSO QUERATINIZADO) --- */
  renderPele(w, h) {
    const ctx = this.ctx;
    // Stratum Corneum (Camada Córnea - rosa forte ondulada descamante)
    const corneumGrad = ctx.createLinearGradient(0, 0, 0, h * 0.24);
    corneumGrad.addColorStop(0, "#fda4af");
    corneumGrad.addColorStop(1, "#f43f5e");
    ctx.fillStyle = corneumGrad;
    ctx.fillRect(0, 0, w, h * 0.22);

    // Peeling flakes
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      const fx = (i * 45) % w;
      const fy = 10 + (i * 12) % (h * 0.2);
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + 30, fy + 4);
      ctx.stroke();
    }

    // Stratum Granulosum (Grânulos basófilos de queratohialina)
    ctx.fillStyle = "#6d28d9";
    ctx.fillRect(0, h * 0.22, w, 24);
    ctx.fillStyle = "#312e81";
    for (let g = 0; g < w; g += 6) {
      ctx.fillRect(g, h * 0.22 + 4 + (g % 5) * 3, 3, 3);
    }

    // Stratum Spinosum (Espinhoso - poliédricas com desmossomos)
    const spinosumGrad = ctx.createLinearGradient(0, h * 0.26, 0, h * 0.6);
    spinosumGrad.addColorStop(0, "#f472b6");
    spinosumGrad.addColorStop(1, "#ec4899");
    ctx.fillStyle = spinosumGrad;
    ctx.fillRect(0, h * 0.26, w, h * 0.36);

    // Polyhedral cells with round nuclei
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 18; col++) {
        const cx = col * 38 + (row % 2) * 18;
        const cy = h * 0.28 + row * 26;
        ctx.fillStyle = "#581c87";
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dermal Papillae (Ondulações da derme e estrato basal)
    ctx.fillStyle = "#fce7f3"; // Derme papilar
    ctx.beginPath();
    ctx.moveTo(0, h * 0.62);
    for (let x = 0; x <= w; x += 40) {
      const peakY = (x / 40) % 2 === 0 ? h * 0.54 : h * 0.64;
      ctx.lineTo(x, peakY);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#831843";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Basal stratum cells (colunares na base da papila)
    for (let x = 0; x < w; x += 16) {
      const by = h * 0.54 + Math.sin(x * 0.08) * 20;
      ctx.fillStyle = "#3b0764";
      ctx.beginPath();
      ctx.ellipse(x, by, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* --- SLIDE 3: GLÂNDULA SUBMANDIBULAR (MISTA & GIANNUZZI) --- */
  renderGlandula(w, h) {
    const ctx = this.ctx;
    // Interstitial connective tissue background
    ctx.fillStyle = "#fdf2f8";
    ctx.fillRect(0, 0, w, h);

    // Draw Mixed Acini grid
    const aciniPositions = [
      { x: 120, y: 120, r: 60, type: "serous" },
      { x: 300, y: 130, r: 70, type: "mixed" },
      { x: 500, y: 140, r: 65, type: "serous" },
      { x: 160, y: 320, r: 75, type: "mixed" },
      { x: 340, y: 340, r: 65, type: "mucous" },
      { x: 520, y: 320, r: 70, type: "mixed" },
      { x: 220, y: 520, r: 70, type: "serous" },
      { x: 420, y: 500, r: 75, type: "mixed" }
    ];

    aciniPositions.forEach(ac => {
      if (ac.type === "serous") {
        // Dark basophilic serous acinus (roxo-escuro, lúmen quase invisível)
        ctx.fillStyle = "#7c3aed";
        ctx.beginPath();
        ctx.arc(ac.x, ac.y, ac.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4c1d95";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Round basal nuclei
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          const nx = ac.x + Math.cos(angle) * (ac.r * 0.65);
          const ny = ac.y + Math.sin(angle) * (ac.r * 0.65);
          ctx.fillStyle = "#312e81";
          ctx.beginPath();
          ctx.arc(nx, ny, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (ac.type === "mucous") {
        // Pale mucous acinus (azul/esbranquiçado muito pálido)
        ctx.fillStyle = "#f5f3ff";
        ctx.beginPath();
        ctx.arc(ac.x, ac.y, ac.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#c4b5fd";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Flattened basal nuclei
        for (let i = 0; i < 7; i++) {
          const angle = (i * Math.PI * 2) / 7;
          const nx = ac.x + Math.cos(angle) * (ac.r * 0.75);
          const ny = ac.y + Math.sin(angle) * (ac.r * 0.75);
          ctx.fillStyle = "#5b21b6";
          ctx.beginPath();
          ctx.ellipse(nx, ny, 7, 3, angle + Math.PI / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (ac.type === "mixed") {
        // Mixed acinus: mucous core + Semilua Serosa de Giannuzzi
        ctx.fillStyle = "#ede9fe";
        ctx.beginPath();
        ctx.arc(ac.x, ac.y, ac.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#a78bfa";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Crescent-shaped serous demilune of Giannuzzi capping top/side
        ctx.fillStyle = "#6d28d9";
        ctx.beginPath();
        ctx.arc(ac.x, ac.y, ac.r, Math.PI * 1.0, Math.PI * 2.0);
        ctx.quadraticCurveTo(ac.x, ac.y - ac.r * 0.2, ac.x - ac.r, ac.y);
        ctx.fill();

        // Giannuzzi serous nuclei
        for (let i = 0; i < 4; i++) {
          const angle = Math.PI * 1.15 + (i * Math.PI * 0.7) / 3;
          const gx = ac.x + Math.cos(angle) * (ac.r * 0.78);
          const gy = ac.y + Math.sin(angle) * (ac.r * 0.78);
          ctx.fillStyle = "#1e1b4b";
          ctx.beginPath();
          ctx.arc(gx, gy, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Striated salivary duct (Ducto estriado com lúmen amplo)
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.75, 45, 0, Math.PI * 2);
    ctx.fill();
    // Duct Lumen
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.75, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  /* --- SLIDE 4: CARTILAGEM HIALINA (PERICÔNDRIO & ISOGÊNICOS) --- */
  renderCartilagemHialina(w, h) {
    const ctx = this.ctx;
    // Basophilic translucent matrix background (azul/violeta vítreo)
    const matGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 2);
    matGrad.addColorStop(0, "#ddd6fe");
    matGrad.addColorStop(0.6, "#c4b5fd");
    matGrad.addColorStop(1, "#a78bfa");
    ctx.fillStyle = matGrad;
    ctx.fillRect(0, 0, w, h);

    // Perichondrium band (Pericôndrio no topo e na base - acidófilo rosa colágeno I)
    const periGrad = ctx.createLinearGradient(0, 0, 0, 70);
    periGrad.addColorStop(0, "#e11d48");
    periGrad.addColorStop(1, "#f43f5e");
    ctx.fillStyle = periGrad;
    ctx.fillRect(0, 0, w, 75);

    // Perichondrium elongated chondrogenic cells & fibroblasts
    for (let f = 20; f < w; f += 40) {
      ctx.fillStyle = "#4c0519";
      ctx.beginPath();
      ctx.ellipse(f, 35, 12, 3, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Chondroblasts in transition
      ctx.beginPath();
      ctx.ellipse(f + 15, 62, 10, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Isogenous Groups (Grupos Isogênicos de Condrócitos)
    const isogenousGroups = [
      { x: 140, y: 220, count: 2 },
      { x: 320, y: 180, count: 4 },
      { x: 500, y: 240, count: 3 },
      { x: 220, y: 360, count: 4 },
      { x: 420, y: 380, count: 2 },
      { x: 150, y: 510, count: 3 },
      { x: 350, y: 530, count: 4 },
      { x: 530, y: 480, count: 2 }
    ];

    isogenousGroups.forEach(grp => {
      // Territorial Matrix (Halo basófilo escuro e rico em GAGs ao redor do grupo)
      ctx.fillStyle = "rgba(109, 40, 217, 0.4)";
      ctx.beginPath();
      ctx.arc(grp.x, grp.y, 44, 0, Math.PI * 2);
      ctx.fill();

      // Condrócitos in Lacunae (Condroplastos)
      for (let c = 0; c < grp.count; c++) {
        const angle = (c * Math.PI * 2) / grp.count;
        const cx = grp.x + Math.cos(angle) * 16;
        const cy = grp.y + Math.sin(angle) * 16;

        // Clear lacuna space
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Chondrocyte cytoplasm (slightly shrunken)
        ctx.fillStyle = "#c084fc";
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fill();

        // Central nucleus
        ctx.fillStyle = "#3b0764";
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  /* --- SLIDE 5: OSSO COMPACTO (SISTEMA DE HAVERS / ÓSTEONS) --- */
  renderOssoCompacto(w, h) {
    const ctx = this.ctx;
    // Ground bone brownish-amber background
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(0, 0, w, h);

    // 3 Major Haversian Systems (Ósteons)
    const osteons = [
      { x: 200, y: 220, r: 150 },
      { x: 480, y: 250, r: 160 },
      { x: 310, y: 490, r: 155 }
    ];

    osteons.forEach(ost => {
      // Concentric Lamellae (Lamelas concêntricas de matriz óssea mineralizada)
      const numRings = 7;
      for (let ring = numRings; ring >= 1; ring--) {
        const rad = (ost.r / numRings) * ring;
        ctx.strokeStyle = "rgba(180, 83, 9, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ost.x, ost.y, rad, 0, Math.PI * 2);
        ctx.stroke();

        // Osteocytes in lacunae along lamellar rings
        const numCells = ring * 6;
        for (let c = 0; c < numCells; c++) {
          const angle = (c * Math.PI * 2) / numCells + (ring % 2) * 0.2;
          const ox = ost.x + Math.cos(angle) * rad;
          const oy = ost.y + Math.sin(angle) * rad;

          // Black lacuna (osteoplasto)
          ctx.fillStyle = "#451a03";
          ctx.beginPath();
          ctx.ellipse(ox, oy, 4, 2, angle + Math.PI / 2, 0, Math.PI * 2);
          ctx.fill();

          // Radiating canaliculi (finas teias de aranha de comunicação)
          ctx.strokeStyle = "rgba(120, 53, 15, 0.45)";
          ctx.lineWidth = 0.6;
          for (let k = -2; k <= 2; k++) {
            const radAngle = angle + k * 0.15;
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ox + Math.cos(radAngle) * 9, oy + Math.sin(radAngle) * 9);
            ctx.stroke();
          }
        }
      }

      // Central Havers Canal (Canal de Havers com lúmen escuro para vasos)
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.arc(ost.x, ost.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Volkmann Canal connecting the two top Havers canals horizontally
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(osteons[0].x, osteons[0].y);
    ctx.lineTo(osteons[1].x, osteons[1].y);
    ctx.stroke();
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(osteons[0].x, osteons[0].y);
    ctx.lineTo(osteons[1].x, osteons[1].y);
    ctx.stroke();
  }

  /* --- SLIDE 6: TECIDO ADIPOSO UNILOCULAR (GORDURA BRANCA) --- */
  renderTecidoAdiposo(w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = "#fdf4ff";
    ctx.fillRect(0, 0, w, h);

    // Honeycomb / Signet-ring cells network
    const cellSize = 54;
    const cols = Math.ceil(w / cellSize) + 1;
    const rows = Math.ceil(h / cellSize) + 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * cellSize + (r % 2) * (cellSize * 0.5);
        const cy = r * cellSize * 0.85;

        // Giant cleared lipid droplet (quase branco com borda rosa de citoplasma)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy, cellSize * 0.44, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f472b6";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Eccentric flattened nucleus (Anel de sinete)
        const nAngle = (c * 13 + r * 7) % Math.PI * 2;
        const nx = cx + Math.cos(nAngle) * (cellSize * 0.42);
        const ny = cy + Math.sin(nAngle) * (cellSize * 0.42);
        ctx.fillStyle = "#6b21a8"; // Basofilia do núcleo comprimido
        ctx.beginPath();
        ctx.ellipse(nx, ny, 6, 2.5, nAngle, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Interstitial capillary between adipocytes
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(50, 40);
    ctx.bezierCurveTo(200, 180, 400, 220, 600, 500);
    ctx.stroke();
  }

  /* --- PINS / LABELS INTERACTIVITY --- */
  renderPins() {
    if (!this.pinsOverlay) return;
    this.pinsOverlay.innerHTML = "";
    if (!this.pinsVisible) return;

    const pins = this.getSlidePins();
    pins.forEach((pin, index) => {
      const el = document.createElement("div");
      el.className = "pin-marker";
      el.style.left = `${pin.x}%`;
      el.style.top = `${pin.y}%`;
      el.innerHTML = `
        <div class="pin-point" title="${pin.title}">${index + 1}</div>
        <div class="pin-label">${pin.label}</div>
      `;
      el.addEventListener("click", () => {
        audio.playClick();
        showToast(`📍 ${pin.label}: ${pin.desc}`);
      });
      this.pinsOverlay.appendChild(el);
    });
  }

  getSlidePins() {
    switch (this.slideKey) {
      case "traqueia":
        return [
          { x: 30, y: 22, label: "Cílios Apicais", title: "Cílios", desc: "Projeções móveis com microtúbulos que varrem muco em direção à faringe." },
          { x: 52, y: 38, label: "Célula Caliciforme", title: "Célula Caliciforme", desc: "Glândula unicelular que produz e secreta muco protetor." },
          { x: 70, y: 58, label: "Lâmina Basal", title: "Lâmina Basal", desc: "Apoio de colágeno e laminina onde todas as células se ancoram." },
          { x: 35, y: 78, label: "Lâmina Própria (Vasos)", title: "Lâmina Própria", desc: "Tecido conjuntivo frouxo rico em capilares para nutrir o epitélio." }
        ];
      case "pele":
        return [
          { x: 45, y: 12, label: "Camada Córnea", title: "Camada Córnea", desc: "Células mortas anucleadas cheias de queratina impermeabilizante." },
          { x: 60, y: 23, label: "Estrato Granuloso", title: "Estrato Granuloso", desc: "Grânulos basófilos de queratohialina que iniciam a queratinização." },
          { x: 35, y: 40, label: "Estrato Espinhoso", title: "Estrato Espinhoso", desc: "Células poliédricas cheias de desmossomos contra atrito." },
          { x: 50, y: 65, label: "Derme Papilar", title: "Derme", desc: "Tecido conjuntivo que nutre o epitélio e ancora a pele." }
        ];
      case "glandula":
        return [
          { x: 24, y: 19, label: "Ácino Seroso", title: "Ácino Seroso", desc: "Escuro, basófilo, secreta líquido aquoso rico em enzimas (amilase)." },
          { x: 54, y: 52, label: "Ácino Mucoso", title: "Ácino Mucoso", desc: "Pálido, citoplasma claro com mucina espessa lubrificante." },
          { x: 48, y: 20, label: "Semilua de Giannuzzi", title: "Semilua Serosa", desc: "Células serosas em formato de meia-lua abraçando o ácino mucoso." },
          { x: 50, y: 76, label: "Ducto Estriado", title: "Ducto Salivar", desc: "Canal com lúmen central amplo que modifica e drena a saliva." }
        ];
      case "cartilagem_hialina":
        return [
          { x: 40, y: 8, label: "Pericôndrio", title: "Pericôndrio", desc: "Capa de conjuntivo denso vascularizada que nutre e produz condroblastos." },
          { x: 50, y: 30, label: "Grupo Isogênico", title: "Grupo Isogênico", desc: "Células irmãs na mesma vizinhança originadas da mesma mitose." },
          { x: 35, y: 60, label: "Condrócito em Lacuna", title: "Condroplasto", desc: "Célula cartilaginosa madura alojada em sua cavidade protegida." },
          { x: 65, y: 55, label: "Matriz Territorial", title: "Matriz Territorial", desc: "Halo hiperbasófilo rico em sulfato de condroitina ao redor dos condrócitos." }
        ];
      case "osso_compacto":
        return [
          { x: 31, y: 34, label: "Canal de Havers", title: "Canal de Havers", desc: "Canal central do ósteon onde correm vasos sanguíneos e nervos." },
          { x: 52, y: 38, label: "Canal de Volkmann", title: "Canal de Volkmann", desc: "Túnel transversal que comunica os canais de Havers entre si." },
          { x: 26, y: 48, label: "Lamelas Concêntricas", title: "Lamelas Ósseas", desc: "Anéis de colágeno I e hidroxiapatita que formam o ósteon." },
          { x: 42, y: 22, label: "Osteócito & Canalículos", title: "Canalículos", desc: "Célula óssea em sua lacuna emitindo prolongamentos por canalículos." }
        ];
      case "tecido_adiposo":
        return [
          { x: 40, y: 35, label: "Gota Lipídica Única", title: "Adipócito", desc: "Espaço vazio deixado após o xilol dissolver os triglicerídeos." },
          { x: 46, y: 44, label: "Núcleo em Anel de Sinete", title: "Núcleo Periférico", desc: "Núcleo achatado na borda comprimido pelo estoque de gordura." },
          { x: 60, y: 70, label: "Capilar Sanguíneo", title: "Capilar", desc: "Vaso no conjuntivo para transporte veloz de energia aos tecidos." }
        ];
      default:
        return [];
    }
  }

  updateSlideInfo() {
    if (!this.slideInfoCard) return;
    const infoMap = {
      traqueia: {
        title: "Traqueia (Epitélio Pseudoestratificado Ciliado)",
        desc: "Amostra clássica do sistema respiratório. Note os cílios na borda livre, as células caliciformes claras produtoras de muco e a lâmina própria vascularizada abaixo da lâmina basal.",
        tags: ["Pseudoestratificado", "Ciliado", "Caliciforme", "Avascular"]
      },
      pele: {
        title: "Pele Grossa (Estratificado Pavimentoso Queratinizado)",
        desc: "Amostra de pele da palma da mão ou planta do pé. Destaque para a espessa camada córnea de queratina pura (anucleada) e os desmossomos mantendo as células espinhosas coesas.",
        tags: ["Estratificado", "Queratinizado", "Desmossomos", "Proteção Mecânica"]
      },
      glandula: {
        title: "Glândula Submandibular (Glândula Salivar Mista)",
        desc: "Apresenta unidades secretoras mistas com ácinos serosos escuros, mucosos claros e a clássica Semilua Serosa de Giannuzzi, além de ductos estriados.",
        tags: ["Glândula Exócrina", "Semilua de Giannuzzi", "Merócrina", "Mista"]
      },
      cartilagem_hialina: {
        title: "Cartilagem Hialina (Traqueia / Costelas)",
        desc: "Matriz basófila vítrea rica em colágeno tipo II e sulfato de condroitina. Observe o pericôndrio fibroso externo e os grupos isogênicos de condrócitos em suas lacunas.",
        tags: ["Colágeno Tipo II", "Avascular", "Grupos Isogênicos", "Pericôndrio"]
      },
      osso_compacto: {
        title: "Osso Compacto Maduro (Desgaste / Sistemas de Havers)",
        desc: "Visualização por desgaste revelando os sistemas de Havers (ósteons). Observe os canais de Havers centrais, as lamelas concêntricas e os canalículos comunicantes.",
        tags: ["Ósteons", "Canal de Havers", "Volkmann", "Canalículos"]
      },
      tecido_adiposo: {
        title: "Tecido Adiposo Unilocular (Gordura Branca)",
        desc: "Células esféricas gigantes onde a gordura unilocular ocupava quase todo o volume, empurrando o citoplasma e o núcleo para a periferia celular em 'anel de sinete'.",
        tags: ["Unilocular", "Anel de Sinete", "Isolamento Térmico", "Reserva de Energia"]
      }
    };

    const info = infoMap[this.slideKey] || infoMap.traqueia;
    const badge = document.getElementById("current-slide-badge");
    if (badge) badge.textContent = info.title.split("(")[0].trim();

    if (this.slideInfoCard) {
      this.slideInfoCard.innerHTML = `
        <h4>🔍 Diagnóstico da Lâmina: ${info.title}</h4>
        <p>${info.desc}</p>
        <div class="slide-features-tags">
          ${info.tags.map(t => `<span class="feature-tag">${t}</span>`).join("")}
        </div>
      `;
    }
  }
}

/* ==========================================================================
   7.5. ESTUDO DIRIGIDO DATABASE (21 QUESTÕES OFICIAIS & GABARITOS)
   ========================================================================== */
const estudoDirigidoData = [
  // --- TECIDO EPITELIAL (11 QUESTÕES) ---
  {
    id: "ed-epi-1",
    module: "epitelial",
    moduleLabel: "Tecido Epitelial",
    number: 1,
    title: "Organização Celular e Avascularidade do Epitélio",
    question: "O que caracteriza o tecido epitelial em termos de arranjo celular e matriz extracelular (MEC)? Como essa organização se relaciona com a sua função e nutrição?",
    gabarito: "O tecido epitelial é caracterizado por células poliédricas justapostas com escassa substância intercelular (matriz extracelular mínima) e ausência de vascularização sanguínea direta (avascular).\n\n• Relação com a Função: O arranjo celular coeso e contínuo permite ao tecido atuar como barreira física seletiva de revestimento, proteção contra atrito, contenção de patógenos, além de impermeabilização e absorção.\n• Relação com a Nutrição: Por ser totalmente avascular, a nutrição, oxigenação e eliminação de metabólitos das células epiteliais ocorrem exclusivamente por DIFUSÃO a partir dos capilares sanguíneos presentes no tecido conjuntivo subjacente (lâmina própria), atravessando a membrana basal.",
    keyPoints: ["Células poliédricas justapostas", "MEC escassa", "Avascular", "Nutrição por difusão do tecido conjuntivo", "Barreira seletiva e proteção"],
    source: "Estudo Dirigido – Tecido Epitelial (Questão 1)"
  },
  {
    id: "ed-epi-2",
    module: "epitelial",
    moduleLabel: "Tecido Epitelial",
    number: 2,
    title: "Origem Embrionária dos Três Folhetos Germinativos",
    question: "Quais são os três folhetos embrionários a partir dos quais o tecido epitelial pode se originar? Dê um exemplo de epitélio derivado de cada um.",
    gabarito: "O tecido epitelial é singular no organismo humano por apresentar origens embrionárias a partir dos três folhetos germinativos fundamentais:\n\n1. Ectoderme: Origina a epiderme da pele, epitélio da córnea, anexos cutâneos (pelos, unhas, glândulas sudoríparas e sebáceas) e mucosa bucal.\n2. Mesoderme: Origina o endotélio (revestimento interno dos vasos sanguíneos e linfáticos) e o mesotélio (revestimento das cavidades celômicas serosas: pleura, pericárdio e peritônio), além do epitélio tubular do aparelho urinário.\n3. Endoderme: Origina o epitélio de revestimento interno do trato gastrointestinal (estômago, intestinos) e de suas glândulas anexas (fígado, pâncreas), bem como o epitélio do sistema respiratório (traqueia, brônquios e alvéolos).",
    keyPoints: ["Ectoderme (epiderme)", "Mesoderme (endotélio e mesotélio)", "Endoderme (trato gastrointestinal e respiratório)"],
    source: "Estudo Dirigido – Tecido Epitelial (Questão 2)"
  },
  {
    id: "ed-epi-3",
    module: "epitelial",
    moduleLabel: "Tecido Epitelial",
    number: 3,
    title: "Membrana Basal e Lâmina Própria",
    question: "Descreva a estrutura e a função da lâmina própria e da membrana basal. Quais são os principais componentes moleculares da membrana basal?",
    gabarito: "• Membrana Basal: É uma lâmina acelular delgada situada na interface entre o epitélio e o conjuntivo subjacente. Ao microscópio eletrônico, divide-se em Lâmina Basal (lâmina lúcida + lâmina densa, sintetizadas pelas próprias células epiteliais) e Lâmina Reticular (produzida pelos fibroblastos conjuntivos).\n  - Componentes Moleculares: Colágeno tipo IV (em rede tridimensional não fibrilar), glicoproteínas adesivas (Laminina e Entactina/Nidogênio), proteoglicanos ricos em heparam sulfato (Perlecan) e fibras de ancoragem (Colágeno tipo VII e Colágeno tipo III reticular).\n  - Funções: Suporte e ancoragem mecânica do epitélio, filtro molecular seletivo para passagem de nutrientes e solutos, regulação da proliferação/polaridade celular e guia durante processos de regeneração e cicatrização tecidual.\n\n• Lâmina Própria: É a camada de tecido conjuntivo frouxo que apoia e sustenta as membranas mucosas (ex: tubo digestório, vias respiratórias e geniturinárias). É ricamente vascularizada e inervada, provendo nutrição, oxigênio, defesa imunológica celular e sustentação estrutural para o epitélio.",
    keyPoints: ["Colágeno tipo IV", "Laminina e Perlecan", "Suporte e ancoragem", "Filtro seletivo", "Lâmina própria (nutrição e suporte mucoso)"],
    source: "Estudo Dirigido – Tecido Epitelial (Questão 3)"
  },
  {
    id: "ed-epi-4",
    module: "epitelial",
    moduleLabel: "Tecido Epitelial",
    number: 4,
    title: "Junções de Oclusão vs. Junções de Adesão",
    question: "Explique o papel das junções de oclusão (zonula occludens) e das junções de adesão (zonula adherens) na manutenção da integridade e polaridade do tecido epitelial.",
    gabarito: "• Zônula de Oclusão (Zonula Occludens): Localizada na porção mais apical da membrana lateral, forma uma faixa contínua de vedação onde as proteínas transmembrana (claudinas e ocludinas) unem intimamente as bicamadas lipídicas das células vizinhas.\n  - Papel: Veda hermeticamente o espaço intercelular, impedindo o fluxo paracelular indiscriminado de fluidos, íons e macromoléculas. Além disso, impede a difusão lateral de proteínas e lipídios entre a membrana apical e a basolateral, mantendo a polaridade funcional da célula epitelial.\n\n• Zônula de Adesão (Zonula Adherens): Situada imediatamente abaixo da zônula de oclusão, consiste em uma faixa de ancoragem mediada por caderinas (glicoproteínas dependentes de cálcio) conectadas, através de cateninas e actinina, aos filamentos de actina do citoesqueleto.\n  - Papel: Garante forte resistência à separação mecânica das células vizinhas e estabiliza a porção apical do epitélio.",
    keyPoints: ["Zônula de oclusão (claudinas/ocludinas, selamento e polaridade)", "Zônula de adesão (caderinas e actina, resistência mecânica)"],
    source: "Estudo Dirigido – Tecido Epitelial (Questão 4)"
  },
  {
    id: "ed-epi-5",
    module: "epitelial",
    moduleLabel: "Tecido Epitelial",
    number: 5,
    title: "Desmossomos e Junções Comunicantes (GAP)",
    question: "Qual é a função dos desmossomos e das junções comunicantes (GAP) no tecido epitelial? Em que tipos de epitélio eles são mais abundantes?",
    gabarito: "• Desmossomos (Mácula de Adesão):\n  - Função: São pontos de fixação intercelular ('botões de pressão') extremamente fortes formados por desmogleínas e desmocolinas conectadas a placas densas intracelulares, nas quais se inserem filamentos intermediários de queratina (tonofilamentos). Distribuem forças mecânicas e cisalhantes por todo o epitélio.\n  - Abundância: São mais abundantes em epitélios submetidos a forte estresse mecânico, tração e atrito, principalmente o epitélio estratificado pavimentoso da epiderme, colo uterino e esôfago.\n\n• Junções Comunicantes (Junções GAP):\n  - Função: São formadas por agrupamentos de canais cilíndricos chamados conexons (cada um composto por 6 conexinas). Alinham-se entre células adjacentes formando poros hidrofílicos que permitem a passagem direta de íons, segundos mensageiros (cAMP, Ca2+) e metabólitos de baixo peso molecular (< 1-1,5 kDa).\n  - Abundância: São cruciais para o acoplamento elétrico e metabólico coordenado, presentes em epitélios que demandam atividade fisiológica coordenada (epitélios de absorção, transporte iônico e durante a morfogênese embrionária).",
    keyPoints: ["Desmossomos (queratina, resistência mecânica, epiderme)", "Junções GAP (conexinas/conexons, acoplamento iônico e metabólico)"],
    source: "Estudo Dirigido – Tecido Epitelial (Questão 5)"
  },
  {
    id: "ed-epi-6",
    module: "epitelial",
    moduleLabel: "Tecido Epitelial",
    number: 6,
    title: "Microvilosidades vs. Cílios (Citoesqueleto e Função)",
    question: "Diferencie microvilosidades de cílios quanto à sua estrutura interna de citoesqueleto e função. Dê exemplos de locais onde cada um é encontrado.",
    gabarito: "• Microvilosidades:\n  - Citoesqueleto: Projeções digitiformes estáticas da membrana sustentadas internamente por um feixe longitudinal paralelo de 20 a 30 filamentos de actina, unidos por vilina e fimbrina e ancorados na trama terminal apical.\n  - Função: Aumentam consideravelmente a área de superfície apical da célula para potencializar a absorção e transporte de substâncias.\n  - Exemplos: Células absortivas intestinais (enterócitos, formando a 'borda em escova') e túbulos contorcidos proximais dos rins.\n\n• Cílios:\n  - Citoesqueleto: Estruturas alongadas e móveis sustentadas por um axonema de microtúbulos no arranjo característico de 9 pares periféricos e 1 par central (9+2), associados a braços da proteína motora dineína ciliar e ancorados a um corpúsculo basal (arranjo 9 trincas).\n  - Função: Realizam batimento ciliar métrico e coordenado com consumo de ATP, promovendo o deslocamento unidirecional de muco, fluidos e partículas retidas na superfície epitelial.\n  - Exemplos: Epitélio respiratório (traqueia e brônquios - escada mucociliar) e tubas uterinas (transporte do ovócito/zigoto).",
    keyPoints: ["Microvilosidades (filamentos de actina, absorção, enterócitos)", "Cílios (microtúbulos 9+2, dineína, motilidade, epitélio respiratório e tubas)"],
    source: "Estudo Dirigido – Tecido Epitelial (Questão 6)"
  },
  {
    id: "ed-epi-7",
    module: "epitelial",
    moduleLabel: "Tecido Epitelial",
    number: 7,
    title: "Classificação Morfológica dos Epitélios de Revestimento",
    question: "Como os epitélios de revestimento são classificados de acordo com o número de camadas celulares e a morfologia das células da camada superficial?",
    gabarito: "A classificação baseia-se em dois critérios combinados:\n\n1. Quanto ao Número de Camadas de Células:\n  • Simples: Formado por uma única camada de células sobre a membrana basal.\n  • Estratificado: Formado por duas ou mais camadas sobrepostas de células.\n  • Pseudoestratificado: Formado por uma única camada celular onde todas as células tocam a membrana basal, mas nem todas atingem o ápice; como os núcleos se dispõem em diferentes alturas, geram a falsa aparência de estratificação.\n\n2. Quanto à Morfologia da Camada Mais Superficial:\n  • Pavimentoso (Escamoso): Células achatadas, delgadas, com núcleos elípticos achatados.\n  • Cúbico: Células com altura, largura e profundidade semelhantes, com núcleo esférico central.\n  • Prismático (Cilíndrico ou Colunar): Células altas, onde a altura supera a largura, com núcleos ovoides geralmente na região basal.\n  • De Transição: Células superficiais globosas com grande capacidade de mudar de forma conforme a distensão do órgão.",
    keyPoints: ["Camadas: Simples, Estratificado, Pseudoestratificado", "Forma superficial: Pavimentoso, Cúbico, Prismático/Cilíndrico, Transição"],
    source: "Estudo Dirigido – Tecido Epitelial (Questão 7)"
  },
  {
    id: "ed-epi-8",
    module: "epitelial",
    moduleLabel: "Tecido Epitelial",
    number: 8,
    title: "Origem e Classificação das Glândulas (Exócrina vs. Endócrina)",
    question: "Descreva o processo de formação das glândulas a partir do epitélio de revestimento e diferencie glândulas exócrinas de glândulas endócrinas.",
    gabarito: "• Formação Glandular: As glândulas se originam durante a embriogênese a partir da proliferação celular do epitélio de revestimento, que sofre invaginação (brotação) e penetra no tecido conjuntivo subjacente com invasão vascular e diferenciação secretora.\n\n• Diferenciação:\n  - Glândulas Exócrinas: Mantêm a conexão com o epitélio de origem através de um ducto excretor tubular, pelo qual eliminam sua secreção diretamente na superfície externa do corpo ou na luz de órgãos ocos (ex: glândulas salivares, sudoríparas, lacrimais e pâncreas exócrino).\n  - Glândulas Endócrinas: Perdem completamente a conexão ductal com a superfície durante o desenvolvimento (o cordão celular conecta se degenera). As células secretoras reorganizam-se em cordões ou folículos circundados por rica rede de capilares sanguíneos, para onde liberam seus produtos (hormônios) diretamente na corrente sanguínea para distribuição sistêmica (ex: tireoide, paratireoides, hipófise, adrenais).",
    keyPoints: ["Invaginação epitelial no conjuntivo", "Exócrinas (mantêm ducto, vertem em superfícies/luz)", "Endócrinas (perdem ducto, vertem hormônios no sangue)"],
    source: "Estudo Dirigido – Tecido Epitelial (Questão 8)"
  },
  {
    id: "ed-epi-9",
    module: "epitelial",
    moduleLabel: "Tecido Epitelial",
    number: 9,
    title: "Mecanismos de Secreção (Merócrina, Apócrina e Holócrina)",
    question: "Quais são os três principais tipos de secreção glandular com base no modo como o produto é liberado pela célula epitelial? Dê um exemplo para cada tipo.",
    gabarito: "Com base na integridade celular durante a liberação do produto, distinguem-se:\n\n1. Secreção Merócrina (ou Écrina):\n  - Mecanismo: O produto secretor é armazenado em vesículas citoplasmáticas e liberado no ápice por exocitose pura, sem nenhuma perda de citoplasma ou dano à integridade da membrana plasmática celular.\n  - Exemplos: Pâncreas exócrino (ácinos pancreáticos), glândulas salivares e a maioria das glândulas sudoríparas écrinas.\n\n2. Secreção Apócrina:\n  - Mecanismo: O produto secretor é acumulado na porção apical do citoplasma e eliminado juntamente com um fragmento da membrana plasmática e uma porção do citoplasma apical da célula, que se destaca.\n  - Exemplos: Porção lipídica do leite na glândula mamária em lactação e glândulas sudoríparas axilares/perineais apócrinas.\n\n3. Secreção Holócrina:\n  - Mecanismo: O produto lipídico acumula-se intensamente no citoplasma; a célula sofre degeneração progressiva, morte celular por apoptose e se desintegra por completo, tornando-se ela própria a secreção liberada.\n  - Exemplo: Glândulas sebáceas da pele.",
    keyPoints: ["Merócrina (exocitose sem perda citoplasmática, pâncreas/salivares)", "Apócrina (eliminação com ápice celular, mamária)", "Holócrina (morte e desintegração total da célula, sebácea)"],
    source: "Estudo Dirigido – Tecido Epitelial (Questão 9)"
  },
  {
    id: "ed-epi-10",
    module: "epitelial",
    moduleLabel: "Tecido Epitelial",
    number: 10,
    title: "Epitélio de Transição (Urotélio) e Adaptação à Distensão",
    question: "O que é o epitélio de transição (urotélio), quais são suas características estruturais adaptativas e onde ele é encontrado no organismo?",
    gabarito: "• Definição e Localização: O epitélio de transição (ou Urotélio) é um epitélio estratificado especializado exclusivo das vias excretoras do sistema urinário: cálices renais, pelve renal, ureteres, bexiga urinária e porção proximal da uretra.\n\n• Características Estruturais e Adaptações:\n  - Notável capacidade de distensão elástica e acomodação volumétrica sem ruptura das junções celulares.\n  - Na bexiga vazia (relaxada), o epitélio parece espesso (composto por cerca de 6 a 8 camadas) e as células da camada superficial são volumosas, globosas e convexas, descritas como células 'em cúpula', 'em guarda-chuva' ou 'dome cells'.\n  - Na bexiga cheia (distendida pela urina), as células deslizam sobre si mesmas, o epitélio estira-se adelgaçando-se aparentemente para 2 a 3 camadas e as células superficiais achatam-se como escamas.\n  - A membrana apical possui placas densas assimétricas rígidas de uropontina/uroplaquina que conferem impermeabilidade química excepcional, impedindo que a urina hipertônica e tóxica desidrate os tecidos subjacentes ou lese o conjuntivo.",
    keyPoints: ["Urotélio exclusivo das vias urinárias", "Células em cúpula / guarda-chuva", "Distensão elástica com achatamento celular", "Barreira osmótica e química impermeável"],
    source: "Estudo Dirigido – Tecido Epitelial (Questão 10)"
  },
  {
    id: "ed-epi-11",
    module: "epitelial",
    moduleLabel: "Tecido Epitelial",
    number: 11,
    title: "Cicatrização Tecidual e Atividade dos Fibroblastos",
    question: "Em uma biópsia de tecido em processo de cicatrização após uma incisão cirúrgica, observa-se grande proliferação celular e intensa produção de matriz rica em colágeno. Qual é a principal célula responsável por essa síntese e quais são suas características morfológicas ativas?",
    gabarito: "• Célula Protagonista: O Fibroblasto (e em feridas em contração, os Miofibroblastos).\n\n• Características Morfológicas e Funcionais Ativas:\n  - Morfologia Celular: Célula alongada, fusiforme ou estrelada com amplos prolongamentos citoplasmáticos que se insinuam entre as fibras da matriz.\n  - Citoplasma: Abundante e fortemente basófilo (devido ao grande desenvolvimento do Retículo Endoplasmático Rugoso - RER - repleto de polirribossomos para a intensa síntese das cadeias polipeptídicas do procolágeno) e Complexo de Golgi juxtanuclear muito desenvolvido para glicosilação e empacotamento secretor.\n  - Núcleo: Grande, ovoide ou elíptico, volumoso e eucromático (cromatina frouxa e pouco corada, indicando alta atividade transcricional de RNAm) com um ou mais nucléolos proeminentes.\n  - Fisiologia na Cicatrização: Sob estímulo de fatores de crescimento (TGF-beta, PDGF, FGF), migra para o leito da lesão, prolifera e sintetiza colágeno tipo III e I, glicosaminoglicanos e proteoglicanos constituintes do tecido de granulação, remodelando a ferida cirúrgica.",
    keyPoints: ["Fibroblasto", "Fusiforme / estrelado", "RER abundante e basofilia citoplasmática", "Núcleo eucromático volumoso com nucléolo evidente", "Síntese de colágeno e matriz cicatricial"],
    source: "Estudo Dirigido – Tecido Epitelial (Questão 11)"
  },

  // --- TECIDO CONJUNTIVO (10 QUESTÕES) ---
  {
    id: "ed-conj-1",
    module: "conjuntivo",
    moduleLabel: "Tecido Conjuntivo",
    number: 1,
    title: "Componentes Fundamentais e Proporção da MEC no Conjuntivo",
    question: "Quais são os componentes fundamentais que constituem o tecido conjuntivo e qual a proporção relativa entre eles que o diferencia do tecido epitelial?",
    gabarito: "• Componentes Fundamentais: O tecido conjuntivo é composto por:\n  1. Células: Residentes/fixas (fibroblastos, adipócitos, mastócitos, macrófagos) e Transitórias/imigrantes (plasmócitos, linfócitos, neutrófilos, eosinófilos);\n  2. Matriz Extracelular (MEC): Formada por Fibras Proteicas (colágenas, reticulares e elásticas) e Substância Fundamental Amorfa (SFA) altamente hidratada.\n\n• Proporção Relativa e Diferença do Epitélio: No tecido epitelial, há predomínio quase absoluto de células poliédricas justapostas com matriz extracelular residual (escassa) e ausência de vascularização. No tecido conjuntivo, ao contrário, a Matriz Extracelular é extremamente abundante e volumosa, separando amplamente as células. O conjuntivo fornece sustentação arquitetural, preenchimento de espaços, trocas metabólicas e rica vascularização.",
    keyPoints: ["Células (fixas e transitórias)", "Matriz Extracelular abundante (Fibras + SFA)", "Separação celular ampla (oposto ao epitélio justaposto)"],
    source: "Estudo Dirigido – Tecido Conjuntivo (Questão 1)"
  },
  {
    id: "ed-conj-2",
    module: "conjuntivo",
    moduleLabel: "Tecido Conjuntivo",
    number: 2,
    title: "Adiposo Unilocular (Branco) vs. Multilocular (Marrom)",
    question: "Diferencie o tecido adiposo unilocular (branco/comum) do multilocular (marrom/pardo) quanto à morfologia celular, vascularização e função fisiológica.",
    gabarito: "• Tecido Adiposo Unilocular (Branco/Amarelo/Comum):\n  - Morfologia: Células esféricas grandes (50-150 um) que contêm uma ÚNICA gota lipídica volumosa de triglicerídeos que ocupa quase todo o citoplasma, empurrando e achatando o núcleo e organelas na periferia celular (aspecto em anel de sinete).\n  - Vascularização: Moderada.\n  - Função: Principal reserva energética a longo prazo do organismo, isolamento térmico subcutâneo (panículo adiposo), amortecimento mecânico contra choques e secreção de adipocinas e hormônios (leptina).\n\n• Tecido Adiposo Multilocular (Pardo/Marrom):\n  - Morfologia: Células menores e poliédricas com MÚLTIPLAS gotículas lipídicas dispersas no citoplasma e núcleo esférico centralizado. Apresenta citoplasma repleto de mitocôndrias volumosas com cristas numerosas.\n  - Vascularização: Extremamente rica em capilares sanguíneos (que associados aos citocromos mitocondriais conferem a coloração avermelhada/parda).\n  - Função: Especializado na TERMOGÊNESE sem calafrios (produção direta de calor). As mitocôndrias possuem a proteína transmembrana Termogenina (UCP-1 / proteína desacopladora), que dissipa o gradiente de prótons mitocondrial na forma de calor em vez de sintetizar ATP. Abundante em recém-nascidos e animais hibernantes.",
    keyPoints: ["Unilocular: gota única grande, núcleo periférico, reserva energética", "Multilocular: múltiplas gotículas, núcleo central, rico em mitocôndrias", "Termogenina (UCP-1) e termogênese sem calafrios"],
    source: "Estudo Dirigido – Tecido Conjuntivo (Questão 2)"
  },
  {
    id: "ed-conj-3",
    module: "conjuntivo",
    moduleLabel: "Tecido Conjuntivo",
    number: 3,
    title: "Conjuntivo Frouxo vs. Denso (Modelado e Não Modelado)",
    question: "Compare o tecido conjuntivo frouxo com o tecido conjuntivo denso (modelado e não modelado) em relação à composição de fibras colágenas, resistência mecânica e localização no corpo.",
    gabarito: "• Tecido Conjuntivo Frouxo (Areolar):\n  - Composição: Proporção equilibrada entre células, fibras delgadas (colágenas e elásticas) e abundante substância fundamental amorfa.\n  - Resistência: Flexível e pouco resistente a grandes trações mecânicas.\n  - Localização: Abaixo dos epitélios (lâmina própria), circundando vasos sanguíneos e preenchendo espaços entre feixes musculares.\n\n• Tecido Conjuntivo Denso Não Modelado:\n  - Composição: Predomínio maciço de grossos feixes de fibras de colágeno tipo I entrelaçados sem orientação definida em uma rede tridimensional; poucas células e escassa SFA.\n  - Resistência: Alta resistência a forças de tração exercidas em MÚLTIPLAS DIREÇÕES.\n  - Localização: Derme reticular profunda da pele, cápsulas de órgãos ocos e sólidos (fígado, baço, rins), submucosa do trato gastrointestinal e periósteo.\n\n• Tecido Conjuntivo Denso Modelado (Tendinoso):\n  - Composição: Feixes espessos de colágeno tipo I dispostos em arranjo estritamente PARALELO, alinhados no mesmo eixo biomecânico, com fibroblastos comprimidos (tendinócitos).\n  - Resistência: Resistência máxima e quase inextensível a forças de tração exercidas em UMA ÚNICA DIREÇÃO.\n  - Localização: Tendões musculares, ligamentos e aponeuroses.",
    keyPoints: ["Frouxo: equilíbrio celular/matriz, flexível, lâmina própria", "Denso Não Modelado: feixes entrelaçados, tração multidirecional, derme", "Denso Modelado: feixes paralelos regulares, tração unidirecional, tendões"],
    source: "Estudo Dirigido – Tecido Conjuntivo (Questão 3)"
  },
  {
    id: "ed-conj-4",
    module: "conjuntivo",
    moduleLabel: "Tecido Conjuntivo",
    number: 4,
    title: "Mastócitos e Hipersensibilidade Imediata (Tipo I)",
    question: "Descreva a origem, características morfológicas e o papel dos mastócitos nas reações alérgicas imediatas (hipersensibilidade tipo I).",
    gabarito: "• Origem: Originam-se de células-tronco hematopoéticas da medula óssea; entram na circulação como progenitores agranulares e migram para o tecido conjuntivo perivascular, onde se diferenciam completamente.\n\n• Características Morfológicas: Células ovoides grandes (20-30 um) com núcleo esférico central e citoplasma totalmente preenchido por numerosos grânulos basófilos metacromáticos (coram-se em púrpura/violeta com azul de toluidina devido aos proteoglicanos sulfatados).\n  - Conteúdo dos Grânulos: Histamina, Heparina (anticoagulante), Fator Quimiotático de Eosinófilos (ECF-A), Fator Quimiotático de Neutrófilos e proteases neutras.\n\n• Papel na Hipersensibilidade Tipo I:\n  1. Sensibilização: Em um primeiro contato com um alérgeno, plasmócitos secretam anticorpos IgE, que se fixam pelos seus fragmentos Fc a receptores de altíssima afinidade (Fc-epsilon-RI) presentes na membrana plasmática dos mastócitos.\n  2. Reexposição e Desgranulação: Ao ocorrer nova exposição, o alérgeno se liga a moléculas vizinhas de IgE ligadas à membrana do mastócito, promovendo ligamento cruzado (cross-linking).\n  3. Resposta Aguda: Esse cross-linking dispara a fosforilação intracelular e exocitose explosiva dos grânulos pré-formados (liberando histamina, que causa vasodilatação imediata, aumento de permeabilidade vascular com extravasamento de plasma e edema, contração da musculatura lisa bronquiolar e prurido) e síntese 'de novo' de leucotrienos e prostaglandinas (reação anafilática).",
    keyPoints: ["Origem medular hematopoética", "Grânulos metacromáticos de histamina e heparina", "Receptores Fc de alta afinidade para IgE", "Cross-linking por alérgeno e desgranulação aguda", "Vasodilatação, edema e broncoespasmo"],
    source: "Estudo Dirigido – Tecido Conjuntivo (Questão 4)"
  },
  {
    id: "ed-conj-5",
    module: "conjuntivo",
    moduleLabel: "Tecido Conjuntivo",
    number: 5,
    title: "Síntese Intracelular do Colágeno e Papel da Vitamina C",
    question: "Quais são as etapas intracelulares da síntese do colágeno realizadas pelos fibroblastos e qual a importância fundamental da Vitamina C (ácido ascórbico) nesse processo?",
    gabarito: "• Etapas Intracelulares nos Fibroblastos:\n  1. Transcrição gênica no núcleo e tradução de cadeias alfa individuais precursoras (pré-pró-colágeno) nos polirribossomos aderidos ao Retículo Endoplasmático Rugoso (RER).\n  2. Clivagem do peptídeo sinalizador hidrofóbico no lúmen do RER.\n  3. Hidroxilação de resíduos específicos de prolina e lisina, catalisada pelas enzimas prolil-hidroxilase e lisil-hidroxilase.\n  4. Glicosilação de resíduos selecionados de hidroxilisina com glicose e galactose no RER.\n  5. Montagem da Tripla Hélice: Três cadeias alfa enrolam-se em configuração helicoidal, mantendo peptídeos terminais globulares não helicoidais solúveis (molécula de Pró-colágeno).\n  6. Transferência para o Complexo de Golgi, empacotamento em vesículas secretoras e transporte à membrana plasmática para exocitose no meio extracelular.\n\n• Papel Fundamental da Vitamina C (Ácido Ascórbico): O ácido ascórbico atua como cofator redutor obrigatório para as enzimas prolil- e lisil-hidroxilases, mantendo o íon ferro no seu estado funcional reduzido (Fe2+). Sem a hidroxilação, as cadeias não formam pontes de hidrogênio intercatenárias estáveis, a tripla hélice de pró-colágeno não se estabiliza em temperatura corporal (37 °C) e sofre degradação intracelular prematura por proteases, impedindo a montagem extracelular de fibrilas colágenas.",
    keyPoints: ["RER (tradução do pré-pró-colágeno)", "Hidroxilação de prolina e lisina", "Vitamina C como cofator essencial das hidroxilases", "Montagem da tripla hélice de pró-colágeno", "Complexo de Golgi e exocitose"],
    source: "Estudo Dirigido – Tecido Conjuntivo (Questão 5)"
  },
  {
    id: "ed-conj-6",
    module: "conjuntivo",
    moduleLabel: "Tecido Conjuntivo",
    number: 6,
    title: "Fisiopatologia Molecular do Escorbuto",
    question: "Um paciente com dieta severamente deficiente em vegetais frescos e frutas cítricas desenvolve sangramento gengival, petéquias cutâneas, fraqueza e mobilidade dentária anormal. Explique a patogênese dessa condição (escorbuto) a nível molecular e tecidual no conjuntivo.",
    gabarito: "• Patogênese Molecular:\n  - O escorbuto decorre da hipovitaminose C crônica. Na ausência de ácido ascórbico, as enzimas prolil- e lisil-hidroxilases tornam-se inativas nos fibroblastos.\n  - As cadeias alfa de pró-colágeno sintetizadas não sofrem hidroxilação adequada de prolina e lisina. Consequentemente, as moléculas de pró-colágeno são termolábeis, desnaturam-se e não conseguem formar as pontes de hidrogênio necessárias para manter a tripla hélice estável.\n  - A maioria das moléculas anormais é destruída por autofagia/proteólise intracelular, diminuindo drasticamente a deposição de colágeno maduro na matriz extracelular.\n\n• Manifestações Teciduais no Conjuntivo:\n  - Fragilidade Capilar e Hemorragias: O tecido conjuntivo perivascular e a membrana basal dos vasos dependem criticamente do colágeno para suportar a pressão hidrostática intravascular. Com a fraqueza colágena, pequenas tensões mecânicas rompem capilares e vênulas, provocando petéquias cutâneas, equimoses e sangramentos gengivais espontâneos.\n  - Frouxidão e Perda Dentária: O ligamento periodontal é composto por densos feixes de fibras de colágeno tipo I com altíssima taxa de renovação metabólica (turnover rápido). Sem síntese de novo colágeno, o ligamento degenera rapidamente e não consegue mais fixar o dente ao alvéolo ósseo, resultando em mobilidade patológica e perda dentária.\n  - Cicatrização Deficiente: Feridas não cicatrizam e cicatrizes antigas podem reabrir por perda da coesão do colágeno dérmico.",
    keyPoints: ["Deficiência de Vitamina C", "Falha de hidroxilação e colágeno instável", "Fragilidade capilar (petéquias e sangramento gengival)", "Degeneração do ligamento periodontal (perda de dentes)", "Comprometimento cicatricial"],
    source: "Estudo Dirigido – Tecido Conjuntivo (Questão 6)"
  },
  {
    id: "ed-conj-7",
    module: "conjuntivo",
    moduleLabel: "Tecido Conjuntivo",
    number: 7,
    title: "Conjuntivo Areolar vs. Denso Modelado (Biomecânica de Tendões e Lâmina Própria)",
    question: "Em termos de organização histológica, diferencie o tecido conjuntivo areolar (frouxo) do tecido conjuntivo denso modelado, correlacionando suas estruturas com a biomecânica de tendões e da lâmina própria.",
    gabarito: "• Tecido Conjuntivo Areolar (Frouxo):\n  - Organização: Apresenta matriz extracelular frouxa com fibras colágenas, elásticas e reticulares entrelaçadas de forma aberta e tridimensional, imersas em abundante substância fundamental amorfa gelatinosa e rica em ácido hialurônico.\n  - Relação Biomecânica na Lâmina Própria: Essa conformação aberta e elástica é ideal para a lâmina própria das mucosas, pois permite deformabilidade e deslizamento mecânico sem rasgar durante o peristaltismo ou a passagem de ar/alimentos. Sua alta permeabilidade e rica vascularização viabilizam a difusão rápida de oxigênio/nutrientes para o epitélio avascular e facilitam a migração imediata de leucócitos no combate a patógenos invasores.\n\n• Tecido Conjuntivo Denso Modelado:\n  - Organização: Altamente compactado, desprovido de espaços abertos, formado quase exclusivamente por grossos feixes de fibras de colágeno tipo I orientados em uma única direção paralela rigorosa, com fibroblastos inativos (tendinócitos) espremidos entre os feixes.\n  - Relação Biomecânica nos Tendões: Essa ultraestrutura paralela e maciça confere resistência tênsil extraordinária contra trações uniaxiais. O tendão é mecanicamente inextensível, permitindo que 100% da força gerada pela contração das fibras musculares esqueléticas seja transmitida instantaneamente e com eficiência aos ossos para produzir a alavanca do movimento articular.",
    keyPoints: ["Areolar (frouxo, matriz aberta/flexível, difusão e lâmina própria)", "Denso modelado (feixes paralelos compactos, tração uniaxial extrema, tendões)"],
    source: "Estudo Dirigido – Tecido Conjuntivo (Questão 7)"
  },
  {
    id: "ed-conj-8",
    module: "conjuntivo",
    moduleLabel: "Tecido Conjuntivo",
    number: 8,
    title: "Origem dos Macrófagos e Nomes Específicos nos Tecidos",
    question: "Qual a origem celular dos macrófagos do tecido conjuntivo e quais nomes especiais eles recebem quando residem no fígado, no sistema nervoso central e no tecido ósseo?",
    gabarito: "• Origem Celular: Os macrófagos originam-se a partir de células precursoras hematopoéticas da medula óssea que se diferenciam em monócitos circulantes no sangue periférico. Ao receberem sinais inflamatórios ou quimiotáticos basais, os monócitos atravessam a parede dos vasos sanguíneos (por diapedese), penetram no tecido conjuntivo e sofrem maturação morfológica e funcional, transformando-se em macrófagos. Integram o Sistema Fagocítico Mononuclear (SFM).\n\n• Denominações Específicas nos Órgãos:\n  1. Fígado: Células de Kupffer (situadas na luz dos capilares sinusoides hepáticos, responsáveis por fagocitar bactérias e hemácias envelhecidas);\n  2. Sistema Nervoso Central: Micróglia (única célula glial com origem mesodérmica/monocítica, responsável pela defesa imunológica e vigilância sináptica no encéfalo e medula);\n  3. Tecido Ósseo: Osteoclastos (células gigantes multinucleadas especializadas na reabsorção da matriz óssea mineralizada, formadas pela fusão de múltiplos monócitos/macrófagos).",
    keyPoints: ["Origem em monócitos sanguíneos da medula óssea", "Sistema Fagocítico Mononuclear", "Fígado: Células de Kupffer", "SNC: Micróglia", "Osso: Osteoclastos"],
    source: "Estudo Dirigido – Tecido Conjuntivo (Questão 8)"
  },
  {
    id: "ed-conj-9",
    module: "conjuntivo",
    moduleLabel: "Tecido Conjuntivo",
    number: 9,
    title: "Substância Fundamental Amorfa e Glicoproteínas Multiadesivas",
    question: "Descreva a composição molecular da substância fundamental amorfa (SFA) e explique a função das glicoproteínas multiadesivas (como fibronectina e laminina) na conexão entre células e matriz.",
    gabarito: "• Composição Molecular da Substância Fundamental Amorfa (SFA):\n  - É um gel aquoso transparente, altamente hidratado e viscoso que preenche os espaços entre as células e as fibras conjuntivas. Seus três componentes químicos essenciais são:\n    1. Glicosaminoglicanos (GAGs): Cadeias polissacarídicas longas e não ramificadas formadas por dissacarídeos repetidos. Apresentam elevada densidade de cargas negativas (sulfato e carboxila), atraindo grande quantidade de água e cátions (Na+), formando uma matriz resistente a forças de compressão. Subdividem-se em não sulfatados (Ácido Hialurônico) e sulfatados (Condroitim sulfato, Dermatan sulfato, Heparam sulfato e Ceratan sulfato).\n    2. Proteoglicanos: Moléculas gigantes formadas por um eixo proteico central ao qual se ligam covalentemente dezenas de cadeias de GAGs sulfatados (aspecto de escova de lavar garrafas, ex: Agrecan, Decorina).\n    3. Glicoproteínas Multiadesivas: Proteínas globulares com cadeias ramificadas de carboidratos que atuam como pontes de ligação.\n\n• Função das Glicoproteínas Multiadesivas (Fibronectina e Laminina):\n  - São moléculas com múltiplos domínios de ligação específicos e simultâneos. Elas possuem sítios que reconhecem e se ligam a fibras de colágeno, sítios de ligação para proteoglicanos/heparina e sítios de ligação celular (geralmente com a sequência de aminoácidos RGD - Arginina-Glicina-Aspartato).\n  - Esses sítios ligam-se aos receptores transmembrana da família das Integrinas presentes na superfície celular. Dessa forma, as glicoproteínas multiadesivas ancoram fisicamente a célula à matriz extracelular, estabilizam os tecidos contra deslocamentos e transduzem sinais mecânicos do meio externo diretamente para o citoesqueleto interno de actina (mecanotransdução).",
    keyPoints: ["SFA: GAGs (ácido hialurônico, condroitim sulfato), Proteoglicanos e Glicoproteínas multiadesivas", "Fibronectina e Laminina como pontes moleculares", "Ligação a colágeno, proteoglicanos e integrinas de membrana", "Adesão, ancoragem e mecanotransdução"],
    source: "Estudo Dirigido – Tecido Conjuntivo (Questão 9)"
  },
  {
    id: "ed-conj-10",
    module: "conjuntivo",
    moduleLabel: "Tecido Conjuntivo",
    number: 10,
    title: "Tecido Conjuntivo Mesenquimal e Tecido Mucoso (Gelatina de Wharton)",
    question: "O que são o tecido conjuntivo mesenquimal e o tecido conjuntivo mucoso? Onde o tecido conjuntivo mucoso é classicamente encontrado no corpo humano?",
    gabarito: "• Tecido Conjuntivo Mesenquimal:\n  - É o tecido conjuntivo indiferenciado do embrião derivado principalmente do mesoderma. É formado por células mesenquimais de formato estrelado ou fusiforme com prolongamentos citoplasmáticos que se tocam formando uma rede frouxa.\n  - Apresenta abundante substância fundamental amorfa muito fluida e delgadas fibras reticulares primitivas. Trata-se de um tecido pluripotente (células-tronco multipotentes) que dá origem a todos os tipos de tecido conjuntivo adulto (propriamente dito, cartilaginoso, ósseo, adiposo, hematopoético) e também ao tecido muscular e endotélio vascular.\n\n• Tecido Conjuntivo Mucoso:\n  - É um tecido conjuntivo especializado de consistência gelatinosa frouxa que possui predomínio exuberante de substância fundamental amorfa rica em Ácido Hialurônico e glicoproteínas, com poucas e finas fibras colágenas e fibroblastos estrelados esparsos.\n  - Localização Clássica no Corpo Humano: É encontrado tipicamente no CORDÃO UMBILICAL fetal, onde recebe o nome clássico de Gelatina de Wharton (envolvendo e protegendo as duas artérias e a veia umbilical contra dobras e compressões mecânicas durante a gestação). Também pode ser encontrado como vestígio na polpa dentária jovem de dentes em formação.",
    keyPoints: ["Mesenquimal: tecido embrionário pluripotente, origina todos os conjuntivos", "Mucoso: consistência gelatinosa, rico em ácido hialurônico", "Gelatina de Wharton no cordão umbilical", "Polpa dentária jovem"],
    source: "Estudo Dirigido – Tecido Conjuntivo (Questão 10)"
  }
];

/* ==========================================================================
   8. APPLICATION CONTROLLER & EVENT LISTENERS
   ========================================================================== */
let microscope = null;

document.addEventListener("DOMContentLoaded", () => {
  loadStoredXP();
  initNavigation();
  initSummariesTab();
  initEstudoDirigido();
  initMicroscopeTab();
  initGameArena();
  initDiagnosticTree();
  initFlashcards();
  initMnemonics();
  initAudioAndTheme();
});

// Toast notification helper
function showToast(msg) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>💬</span> <div>${msg}</div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// XP & Gamification
function addXP(amount) {
  state.xp += amount;
  localStorage.setItem("histologia_xp", state.xp);
  updateXPUI();
}

function loadStoredXP() {
  const saved = localStorage.getItem("histologia_xp");
  if (saved) state.xp = parseInt(saved, 10) || 0;
  updateXPUI();
}

function updateXPUI() {
  const xpEl = document.getElementById("user-xp");
  const rankEl = document.getElementById("user-rank");
  if (!xpEl || !rankEl) return;

  xpEl.textContent = `${state.xp} XP`;
  if (state.xp >= 1200) state.rank = "Lorde da Histologia 👑";
  else if (state.xp >= 700) state.rank = "Mestre das Lâminas 🔬";
  else if (state.xp >= 300) state.rank = "Investigador Jr. 🔍";
  else state.rank = "Novato 🐣";

  rankEl.textContent = state.rank;
}

// Top Nav Tabs
function initNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      audio.playClick();
      const targetId = tab.getAttribute("data-tab");
      switchTab(targetId);
    });
  });
}

function switchTab(targetId) {
  state.currentTab = targetId;
  document.querySelectorAll(".nav-tab").forEach(t => {
    t.classList.toggle("active", t.getAttribute("data-tab") === targetId);
  });
  document.querySelectorAll(".tab-content").forEach(c => {
    c.classList.toggle("active", c.id === targetId);
  });

  if (targetId === "tab-microscopio" && microscope) {
    microscope.render();
  }
}

// Theme & Audio Controls
function initAudioAndTheme() {
  const audioBtn = document.getElementById("audio-toggle-btn");
  const audioIcon = document.getElementById("audio-icon");
  if (audioBtn) {
    audioBtn.addEventListener("click", () => {
      state.audioEnabled = !state.audioEnabled;
      audioIcon.textContent = state.audioEnabled ? "🔊" : "🔇";
      showToast(state.audioEnabled ? "Efeitos sonoros ativados!" : "Sons mutados.");
    });
  }

  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const html = document.documentElement;
      const themes = ["dark", "he", "light"];
      let nextIdx = (themes.indexOf(state.currentTheme) + 1) % themes.length;
      state.currentTheme = themes[nextIdx];
      html.setAttribute("data-theme", state.currentTheme);
      audio.playClick();
      showToast(`Tema visual alterado para: ${state.currentTheme.toUpperCase()}`);
    });
  }
}

/* ==========================================================================
   9. SUMMARIES TAB CONTROLLER
   ========================================================================== */
function initSummariesTab() {
  renderSummaries(summariesData);

  // Search input
  const searchInput = document.getElementById("summary-search-input");
  const clearBtn = document.getElementById("summary-search-clear");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      const q = e.target.value.toLowerCase().trim();
      clearBtn.style.display = q ? "block" : "none";
      filterSummaries(q);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearBtn.style.display = "none";
      renderSummaries(summariesData);
    });
  }

  // Lecture filter pills
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(p => {
    p.addEventListener("click", () => {
      audio.playClick();
      pills.forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      const filter = p.getAttribute("data-filter");
      if (filter === "all") {
        renderSummaries(summariesData);
      } else {
        const filtered = summariesData.filter(s => s.id === filter);
        renderSummaries(filtered);
      }
    });
  });
}

function filterSummaries(query) {
  if (!query) {
    renderSummaries(summariesData);
    return;
  }
  const filtered = summariesData.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(query);
    const analogyMatch = item.analogy.toLowerCase().includes(query);
    const trapMatch = item.trap.toLowerCase().includes(query);
    const subMatch = item.subsections.some(sub =>
      sub.heading.toLowerCase().includes(query) ||
      sub.points.some(pt => pt.toLowerCase().includes(query))
    );
    return titleMatch || analogyMatch || trapMatch || subMatch;
  });
  renderSummaries(filtered);
}

function renderSummaries(data) {
  const container = document.getElementById("summaries-container");
  if (!container) return;
  if (!data.length) {
    container.innerHTML = `
      <div class="summary-card" style="text-align:center; padding: 40px;">
        <h3>Nenhum tópico encontrado para sua busca.</h3>
        <p style="color:var(--text-secondary);">Tente buscar por "Havers", "desmossomo", "cartilagem", "merócrina", "ácino" ou "epitélio".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(item => `
    <article class="summary-card" id="${item.id}">
      <div class="summary-card-header">
        <div class="summary-card-title-group">
          <span class="summary-card-badge">${item.lectureBadge}</span>
          <h3 class="summary-card-title">${item.title}</h3>
        </div>
      </div>

      <!-- Teen Everyday Analogy -->
      <div class="analogy-box">
        <div class="analogy-title">💡 Pensa Assim (Explicado para 15 anos):</div>
        <p class="analogy-text">${item.analogy}</p>
      </div>

      <!-- Subsections grid -->
      <div class="summary-subsections">
        ${item.subsections.map(sub => `
          <div class="subsection-block">
            <h4>${sub.heading}</h4>
            <ul>
              ${sub.points.map(pt => `<li>${pt}</li>`).join("")}
            </ul>
          </div>
        `).join("")}
      </div>

      <!-- Exam Trap Callout -->
      <div class="exam-trap-box">
        <div class="trap-icon">⚠️</div>
        <div>
          <p><strong>PEGADINHA DE PROVA:</strong> ${item.trap}</p>
        </div>
      </div>

      <!-- Clinical Correlation -->
      <div class="clinical-box">
        <div class="clin-icon">🩺</div>
        <div>
          <p><strong>APLICAÇÃO CLÍNICA & FISIOTERAPIA:</strong> ${item.clinical}</p>
        </div>
      </div>
    </article>
  `).join("");
}

/* ==========================================================================
   10. VIRTUAL MICROSCOPE TAB CONTROLLER
   ========================================================================== */
function initMicroscopeTab() {
  const canvas = document.getElementById("microscope-canvas");
  if (!canvas) return;
  microscope = new VirtualMicroscope("microscope-canvas");
  microscope.init();

  // Slide Select
  const slideSelect = document.getElementById("slide-select");
  if (slideSelect) {
    slideSelect.addEventListener("change", e => {
      audio.playClick();
      microscope.setSlide(e.target.value);
    });
  }

  // Objectives (4x, 10x, 40x, 100x)
  const objBtns = document.querySelectorAll(".obj-btn");
  objBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      objBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const zoom = parseInt(btn.getAttribute("data-zoom"), 10);
      microscope.setZoom(zoom);
    });
  });

  // Focus Slider
  const focusSlider = document.getElementById("focus-slider");
  if (focusSlider) {
    focusSlider.addEventListener("input", e => {
      microscope.setFocus(parseInt(e.target.value, 10));
    });
  }

  // Light Slider
  const lightSlider = document.getElementById("light-slider");
  if (lightSlider) {
    lightSlider.addEventListener("input", e => {
      microscope.setLight(parseInt(e.target.value, 10));
    });
  }

  // Toggle Pins
  const togglePins = document.getElementById("toggle-pins");
  if (togglePins) {
    togglePins.addEventListener("change", e => {
      microscope.setPinsVisible(e.target.checked);
    });
  }
}

/* ==========================================================================
   11. BATTLE ARENA (GAME ENGINE)
   ========================================================================== */
function initGameArena() {
  // Mode selection buttons
  const campaignBtn = document.getElementById("mode-campaign-btn");
  const blitzBtn = document.getElementById("mode-blitz-btn");
  const clinicBtn = document.getElementById("mode-clinic-btn");
  const estudoBtn = document.getElementById("mode-estudo-btn");

  if (campaignBtn) campaignBtn.addEventListener("click", () => startGame("campaign"));
  if (blitzBtn) blitzBtn.addEventListener("click", () => startGame("blitz"));
  if (clinicBtn) clinicBtn.addEventListener("click", () => startGame("clinic"));
  if (estudoBtn) estudoBtn.addEventListener("click", () => startGame("estudo-dirigido"));

  // HUD back button
  const backBtn = document.getElementById("hud-back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      audio.playClick();
      endGame(false);
    });
  }

  // Next question button
  const nextBtn = document.getElementById("next-question-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      audio.playClick();
      advanceQuestion();
    });
  }

  // Results screen buttons
  const restartBtn = document.getElementById("restart-game-btn");
  const backMenuBtn = document.getElementById("back-to-menu-btn");
  if (restartBtn) restartBtn.addEventListener("click", () => startGame(state.game.mode));
  if (backMenuBtn) backMenuBtn.addEventListener("click", showGameMenu);
}

function showGameMenu() {
  if (state.game.timerInterval) clearInterval(state.game.timerInterval);
  document.getElementById("game-screen-menu").style.display = "block";
  document.getElementById("game-screen-play").style.display = "none";
  document.getElementById("game-screen-result").style.display = "none";
}

function startGame(mode) {
  state.game.mode = mode;
  state.game.score = 0;
  state.game.lives = mode === "blitz" ? 99 : 3;
  state.game.combo = 1;
  state.game.currentQuestionIndex = 0;
  state.game.correctAnswersCount = 0;
  state.game.totalAnswered = 0;

  // Filter questions based on mode
  if (mode === "clinic") {
    state.game.activeQuestions = gameQuestions.filter(q => q.topic.includes("Caso Clínico"));
  } else if (mode === "estudo-dirigido") {
    state.game.activeQuestions = gameQuestions.filter(q => q.topic.includes("Estudo Dirigido"));
  } else {
    // Shuffle all questions
    state.game.activeQuestions = [...gameQuestions].sort(() => Math.random() - 0.5);
  }

  // Screen transition
  document.getElementById("game-screen-menu").style.display = "none";
  document.getElementById("game-screen-result").style.display = "none";
  document.getElementById("game-screen-play").style.display = "block";

  // HUD timer setup for blitz
  const timerContainer = document.getElementById("hud-timer-container");
  if (mode === "blitz") {
    state.game.timer = 60;
    timerContainer.style.display = "block";
    document.getElementById("hud-timer-val").textContent = state.game.timer;
    if (state.game.timerInterval) clearInterval(state.game.timerInterval);
    state.game.timerInterval = setInterval(() => {
      state.game.timer--;
      document.getElementById("hud-timer-val").textContent = state.game.timer;
      if (state.game.timer <= 0) {
        clearInterval(state.game.timerInterval);
        endGame(true);
      }
    }, 1000);
  } else {
    timerContainer.style.display = "none";
  }

  updateHUD();
  loadQuestion();
}

function updateHUD() {
  document.getElementById("hud-score-val").textContent = state.game.score;
  const heartsEl = document.getElementById("hud-hearts");
  if (state.game.mode === "blitz") {
    heartsEl.innerHTML = "⚡ Modo Blitz";
  } else {
    heartsEl.innerHTML = "❤️".repeat(Math.max(0, state.game.lives));
  }

  const comboEl = document.getElementById("hud-combo-badge");
  if (state.game.combo > 1) {
    comboEl.style.display = "inline-block";
    comboEl.textContent = `🔥 ${state.game.combo}x COMBO`;
  } else {
    comboEl.style.display = "none";
  }

  // Progress bar
  const total = state.game.activeQuestions.length;
  const current = state.game.currentQuestionIndex;
  const pct = total > 0 ? (current / total) * 100 : 0;
  document.getElementById("game-progress-bar").style.width = `${pct}%`;

  // Phase name
  const q = state.game.activeQuestions[state.game.currentQuestionIndex];
  document.getElementById("hud-phase-name").textContent = q ? q.topic : "Arena";
}

function loadQuestion() {
  const feedbackBox = document.getElementById("answer-feedback");
  feedbackBox.style.display = "none";

  const q = state.game.activeQuestions[state.game.currentQuestionIndex];
  if (!q) {
    endGame(true);
    return;
  }

  document.getElementById("question-topic-pill").textContent = q.topic;
  document.getElementById("question-text").textContent = q.question;
  document.getElementById("question-meta").textContent = `Pergunta ${state.game.currentQuestionIndex + 1} de ${state.game.activeQuestions.length}`;

  const optionsGrid = document.getElementById("options-grid");
  optionsGrid.innerHTML = "";

  const letters = ["A", "B", "C", "D"];
  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `
      <span class="option-letter">${letters[idx]}</span>
      <span class="option-label">${opt}</span>
    `;
    btn.addEventListener("click", () => handleAnswer(idx, btn));
    optionsGrid.appendChild(btn);
  });

  updateHUD();
}

function handleAnswer(selectedIndex, selectedBtn) {
  const q = state.game.activeQuestions[state.game.currentQuestionIndex];
  const allBtns = document.querySelectorAll(".option-btn");
  allBtns.forEach(b => (b.disabled = true));

  state.game.totalAnswered++;
  const feedbackBox = document.getElementById("answer-feedback");
  const feedbackTitle = document.getElementById("feedback-title");
  const feedbackExp = document.getElementById("feedback-explanation");

  if (selectedIndex === q.answer) {
    // Correct answer!
    audio.playCorrect();
    selectedBtn.classList.add("correct");
    const points = 100 * state.game.combo;
    state.game.score += points;
    state.game.combo++;
    state.game.correctAnswersCount++;
    addXP(25);

    feedbackTitle.className = "feedback-title correct";
    feedbackTitle.textContent = `Correto! 🎉 (+${points} pontos)`;
    feedbackExp.textContent = q.explanation;
  } else {
    // Wrong answer
    audio.playWrong();
    selectedBtn.classList.add("wrong");
    allBtns[q.answer].classList.add("correct"); // Show correct one
    state.game.combo = 1;
    state.game.lives--;

    feedbackTitle.className = "feedback-title wrong";
    feedbackTitle.textContent = "Ops! Resposta Incorreta ❌";
    feedbackExp.textContent = q.explanation;
  }

  feedbackBox.style.display = "flex";
  updateHUD();

  if (state.game.lives <= 0 && state.game.mode !== "blitz") {
    setTimeout(() => endGame(false), 1800);
  }
}

function advanceQuestion() {
  state.game.currentQuestionIndex++;
  if (state.game.currentQuestionIndex >= state.game.activeQuestions.length) {
    endGame(true);
  } else {
    loadQuestion();
  }
}

function endGame(victory) {
  if (state.game.timerInterval) clearInterval(state.game.timerInterval);

  document.getElementById("game-screen-play").style.display = "none";
  document.getElementById("game-screen-result").style.display = "block";

  const total = Math.max(1, state.game.totalAnswered);
  const accuracy = Math.round((state.game.correctAnswersCount / total) * 100);

  document.getElementById("res-score").textContent = state.game.score;
  document.getElementById("res-accuracy").textContent = `${accuracy}%`;
  document.getElementById("res-xp").textContent = `+${state.game.correctAnswersCount * 25}`;

  const titleEl = document.getElementById("result-title");
  const iconEl = document.getElementById("result-icon");
  const adviceEl = document.getElementById("result-advice");

  if (victory && accuracy >= 70) {
    audio.playLevelUp();
    iconEl.textContent = "🏆";
    titleEl.textContent = "Gabaritou o Módulo!";
    adviceEl.innerHTML = `<strong>Impressionante!</strong> Você demonstrou domínio completo dos conceitos e está pronto para gabaritar a prova prática e teórica!`;
  } else {
    iconEl.textContent = "💪";
    titleEl.textContent = "Bom Treino! Continue Firme!";
    adviceEl.innerHTML = `<strong>Dica do Professor:</strong> Dê uma olhada nos cards da <em>Aba de Resumos</em> e use os <em>Flashcards</em> para fixar os pontos em que você teve dúvida!`;
  }
}

/* ==========================================================================
   12. DICHOTOMOUS DIAGNOSTIC TREE CONTROLLER
   ========================================================================== */
function initDiagnosticTree() {
  const decisionCard = document.getElementById("decision-card");
  if (!decisionCard) return;
  renderDiagnosticStep("root");

  const restartBtn = document.getElementById("decision-restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      audio.playClick();
      renderDiagnosticStep("root");
    });
  }

  const diagRestartBtn = document.getElementById("diag-restart-btn");
  if (diagRestartBtn) {
    diagRestartBtn.addEventListener("click", () => {
      audio.playClick();
      renderDiagnosticStep("root");
    });
  }

  const diagViewMicroBtn = document.getElementById("diag-view-microscope-btn");
  if (diagViewMicroBtn) {
    diagViewMicroBtn.addEventListener("click", () => {
      audio.playClick();
      if (microscope && diagViewMicroBtn.dataset.slideKey) {
        microscope.setSlide(diagViewMicroBtn.dataset.slideKey);
        const sel = document.getElementById("slide-select");
        if (sel) sel.value = diagViewMicroBtn.dataset.slideKey;
      }
      switchTab("tab-microscopio");
    });
  }
}

function renderDiagnosticStep(nodeKey) {
  state.diagnostic.currentNode = nodeKey;
  const node = diagnosticTree[nodeKey];
  const decisionCard = document.getElementById("decision-card");
  const diagnosisBox = document.getElementById("diagnosis-box");

  if (!node || !decisionCard || !diagnosisBox) return;

  decisionCard.style.display = "block";
  diagnosisBox.style.display = "none";

  document.getElementById("decision-question-text").textContent = node.question;
  const choicesContainer = document.getElementById("decision-choices-container");
  choicesContainer.innerHTML = "";

  node.choices.forEach(choice => {
    const card = document.createElement("div");
    card.className = "choice-card";
    card.innerHTML = `
      <div class="choice-content">
        <h4>${choice.title}</h4>
        <p>${choice.subtitle}</p>
      </div>
      <div class="choice-arrow">→</div>
    `;

    card.addEventListener("click", () => {
      audio.playClick();
      if (choice.result) {
        showDiagnosisResult(choice.result);
      } else if (choice.next) {
        renderDiagnosticStep(choice.next);
      }
    });

    choicesContainer.appendChild(card);
  });
}

function showDiagnosisResult(result) {
  const decisionCard = document.getElementById("decision-card");
  const diagnosisBox = document.getElementById("diagnosis-box");
  if (!decisionCard || !diagnosisBox) return;

  decisionCard.style.display = "none";
  diagnosisBox.style.display = "block";
  audio.playCorrect();

  document.getElementById("diag-title").textContent = result.title;
  document.getElementById("diag-location").innerHTML = `<strong>Onde é encontrado:</strong> ${result.location}`;

  const charList = document.getElementById("diag-characteristics");
  charList.innerHTML = `
    <ul>
      ${result.points.map(pt => `<li><span>✓</span> ${pt}</li>`).join("")}
    </ul>
  `;

  const viewBtn = document.getElementById("diag-view-microscope-btn");
  if (viewBtn) {
    viewBtn.dataset.slideKey = result.slideKey;
  }
}

/* ==========================================================================
   13. FLASHCARDS CONTROLLER (ESTILO ANKI)
   ========================================================================== */
function initFlashcards() {
  state.flashcards.filteredList = [...flashcardsData];
  renderFlashcard();

  const card = document.getElementById("active-flashcard");
  if (card) {
    card.addEventListener("click", () => {
      audio.playClick();
      card.classList.toggle("flipped");
    });
  }

  // Category filter
  const catSelect = document.getElementById("flashcard-category-select");
  if (catSelect) {
    catSelect.addEventListener("change", e => {
      audio.playClick();
      const cat = e.target.value;
      state.flashcards.category = cat;
      if (cat === "all") {
        state.flashcards.filteredList = [...flashcardsData];
      } else {
        state.flashcards.filteredList = flashcardsData.filter(f => f.category === cat);
      }
      state.flashcards.currentIndex = 0;
      renderFlashcard();
    });
  }

  // Navigation
  const prevBtn = document.getElementById("fc-prev-btn");
  const nextBtn = document.getElementById("fc-next-btn");
  const shuffleBtn = document.getElementById("fc-shuffle-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      audio.playClick();
      state.flashcards.currentIndex =
        (state.flashcards.currentIndex - 1 + state.flashcards.filteredList.length) %
        state.flashcards.filteredList.length;
      renderFlashcard();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      audio.playClick();
      advanceFlashcard();
    });
  }

  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      audio.playClick();
      state.flashcards.filteredList.sort(() => Math.random() - 0.5);
      state.flashcards.currentIndex = 0;
      renderFlashcard();
      showToast("🔀 Flashcards embaralhados!");
    });
  }

  // Rating buttons (Anki style)
  const btnHard = document.getElementById("fc-btn-hard");
  const btnMed = document.getElementById("fc-btn-med");
  const btnEasy = document.getElementById("fc-btn-easy");

  if (btnHard) {
    btnHard.addEventListener("click", () => {
      audio.playClick();
      showToast("Marcado como difícil. Vamos rever com frequência!");
      advanceFlashcard();
    });
  }
  if (btnMed) {
    btnMed.addEventListener("click", () => {
      audio.playClick();
      addXP(10);
      advanceFlashcard();
    });
  }
  if (btnEasy) {
    btnEasy.addEventListener("click", () => {
      audio.playCorrect();
      addXP(20);
      showToast("Mandou bem! +20 XP de fixação!");
      advanceFlashcard();
    });
  }
}

function advanceFlashcard() {
  const card = document.getElementById("active-flashcard");
  if (card) card.classList.remove("flipped");
  setTimeout(() => {
    state.flashcards.currentIndex =
      (state.flashcards.currentIndex + 1) % state.flashcards.filteredList.length;
    renderFlashcard();
  }, 150);
}

function renderFlashcard() {
  const card = document.getElementById("active-flashcard");
  if (card) card.classList.remove("flipped");

  const list = state.flashcards.filteredList;
  const idx = state.flashcards.currentIndex;
  const item = list[idx];

  const counter = document.getElementById("flashcard-counter");
  if (counter) counter.textContent = `${idx + 1} / ${list.length}`;

  if (!item) return;

  document.getElementById("fc-front-topic").textContent = item.topic;
  document.getElementById("fc-front-text").textContent = item.prompt;

  document.getElementById("fc-back-text").textContent = item.answer;
  const analogyEl = document.getElementById("fc-back-analogy");
  if (analogyEl) {
    analogyEl.innerHTML = `💡 <em>Analogia/Mnemônico:</em> ${item.analogy}`;
  }
}

/* ==========================================================================
   14. MNEMONICS TAB CONTROLLER
   ========================================================================== */
function initMnemonics() {
  const grid = document.getElementById("mnemonics-grid");
  if (!grid) return;

  grid.innerHTML = mnemonicsData.map(m => `
    <div class="mnemonic-card">
      <span class="mnemonic-badge">${m.badge}</span>
      <h3 class="mnemonic-phrase">"${m.phrase}"</h3>
      <div class="mnemonic-target">🎯 <strong>Alvo:</strong> ${m.target}</div>
      <div class="mnemonic-explanation">
        ${m.explanation}
      </div>
    </div>
  `).join("");
}

/* ==========================================================================
   15. ESTUDO DIRIGIDO CONTROLLER (21 QUESTÕES)
   ========================================================================== */
let edCurrentFilter = "all";
let edSearchQuery = "";

function initEstudoDirigido() {
  const container = document.getElementById("estudo-dirigido-container");
  if (!container) return;

  renderEstudoDirigido();

  // Filter pills
  const filterPills = document.querySelectorAll("[data-ed-filter]");
  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      audio.playClick();
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      edCurrentFilter = pill.getAttribute("data-ed-filter");
      renderEstudoDirigido();
    });
  });

  // Search input
  const searchInput = document.getElementById("ed-search-input");
  const clearBtn = document.getElementById("ed-search-clear");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      edSearchQuery = e.target.value.trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = edSearchQuery ? "block" : "none";
      renderEstudoDirigido();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      audio.playClick();
      if (searchInput) searchInput.value = "";
      edSearchQuery = "";
      clearBtn.style.display = "none";
      renderEstudoDirigido();
    });
  }

  // Quiz launcher button
  const startQuizBtn = document.getElementById("ed-start-quiz-btn");
  if (startQuizBtn) {
    startQuizBtn.addEventListener("click", () => {
      audio.playClick();
      switchTab("tab-game");
      startGame("estudo-dirigido");
    });
  }
}

function renderEstudoDirigido() {
  const container = document.getElementById("estudo-dirigido-container");
  if (!container) return;

  let list = estudoDirigidoData;

  // Filter by category
  if (edCurrentFilter === "epitelial") {
    list = list.filter(item => item.module === "epitelial");
  } else if (edCurrentFilter === "conjuntivo") {
    list = list.filter(item => item.module === "conjuntivo");
  }

  // Filter by search query
  if (edSearchQuery) {
    list = list.filter(item => {
      const q = item.question.toLowerCase();
      const g = item.gabarito.toLowerCase();
      const t = item.title.toLowerCase();
      const kp = item.keyPoints.join(" ").toLowerCase();
      return q.includes(edSearchQuery) || g.includes(edSearchQuery) || t.includes(edSearchQuery) || kp.includes(edSearchQuery);
    });
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
        <p style="font-size: 2rem; margin-bottom: 8px;">🔍</p>
        <h3>Nenhuma questão encontrada</h3>
        <p>Tente buscar por outro termo ou limpe o campo de busca.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((item, idx) => `
    <div class="estudo-card ${idx === 0 && !edSearchQuery ? 'open' : ''}" id="${item.id}" data-id="${item.id}">
      <div class="estudo-header" onclick="window.toggleEstudoCard('${item.id}')">
        <div class="estudo-header-left">
          <div class="estudo-meta-row">
            <span class="ed-number-badge">Questão ${item.number}</span>
            <span class="ed-module-pill ${item.module}">${item.moduleLabel}</span>
          </div>
          <h3 class="estudo-title">${item.title}</h3>
        </div>
        <button class="estudo-toggle-btn" aria-label="Expandir ou recolher resposta" title="Ver gabarito">
          ▼
        </button>
      </div>

      <div class="estudo-content">
        <div class="estudo-question-box">
          <strong>Pergunta Oficial:</strong><br>
          ${item.question}
        </div>

        <div class="estudo-gabarito-box">
          <div class="gabarito-header">
            <span class="gabarito-badge">⭐ Gabarito Oficial Comentado</span>
          </div>
          <div class="gabarito-text">${item.gabarito}</div>
        </div>

        <div class="estudo-keypoints">
          <span class="keypoints-label">🎯 Pontos-chave de Prova:</span>
          ${item.keyPoints.map(kp => `<span class="keypoint-chip">${kp}</span>`).join("")}
        </div>

        <div class="estudo-footer-actions">
          <button class="estudo-quiz-btn" onclick="window.startEstudoQuizQuestion()">
            🎯 Praticar esta Pergunta no Jogo
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function toggleEstudoCard(id) {
  audio.playClick();
  const card = document.getElementById(id);
  if (card) {
    card.classList.toggle("open");
  }
}

function startEstudoQuizQuestion() {
  audio.playClick();
  switchTab("tab-game");
  startGame("estudo-dirigido");
}

window.toggleEstudoCard = toggleEstudoCard;
window.startEstudoQuizQuestion = startEstudoQuizQuestion;

