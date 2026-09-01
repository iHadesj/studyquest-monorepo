/**
 * Cena WebGL do cérebro. Este módulo é o único que importa o three, e só é
 * carregado por import() dinâmico — o bundle principal nunca o toca.
 *
 * Regras de desempenho seguidas aqui:
 * - nenhum evento de ponteiro passa pelo React (zero re-render ao interagir);
 * - o rAF para quando a aba está oculta ou o elemento sai da viewport;
 * - devicePixelRatio limitado, sem pós-processamento (o glow é CSS);
 * - importações nomeadas, para o three entrar no chunk só com o que se usa.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';

export type BrainOptions = {
  /** Cores em hex, vindas dos tokens de tema. */
  colorA: string;
  colorB: string;
  colorC: string;
  /** Menos pontos em telas pequenas. */
  quality?: 'alta' | 'baixa';
};

export type BrainHandle = {
  setPaused: (paused: boolean) => void;
  dispose: () => void;
};

/** Textura de ponto: disco suave gerado em runtime, sem asset externo. */
function makeDotTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.75)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

/**
 * Anatomia por metaballs.
 *
 * Deformar uma esfera só produz um ovo com sulcos. Aqui a forma nasce da união
 * suave de volumes posicionados onde os lobos ficam de verdade — é isso que dá
 * a silhueta: testa projetada, lobo temporal descolado, occipital atrás e o
 * cerebelo embaixo dele.
 *
 * Eixos: +z frente, +y cima, +x direita.
 */
type Blob = readonly [x: number, y: number, z: number, r: number];

/** Um hemisfério; o outro é o espelho em x. */
const HEMISFERIO: Blob[] = [
  [0.22, 0.05, 0.76, 0.26], // polo frontal
  [0.32, 0.22, 0.54, 0.4], // lobo frontal superior
  [0.3, -0.08, 0.57, 0.32], // lobo frontal inferior (orbital)
  [0.28, 0.06, 0.18, 0.38], // região central / ínsula
  [0.36, 0.34, 0.1, 0.4], // lobo parietal
  [0.32, 0.26, -0.32, 0.36], // parietal posterior
  [0.26, 0.02, -0.72, 0.32], // lobo occipital
  [0.46, -0.26, 0.3, 0.3], // temporal anterior
  [0.5, -0.24, -0.02, 0.3], // temporal médio
  [0.44, -0.16, -0.34, 0.28], // temporal posterior
  [0.24, -0.46, -0.62, 0.3], // cerebelo
];

/** Estruturas da linha média, sem espelho. */
const MEDIANO: Blob[] = [
  [0, -0.42, -0.24, 0.15], // tronco encefálico
  [0, -0.7, -0.3, 0.12], // bulbo
];

const BLOBS: Blob[] = [
  ...HEMISFERIO,
  ...HEMISFERIO.map(([x, y, z, r]) => [-x, y, z, r] as Blob),
  ...MEDIANO,
];

const LIMIAR = 0.62;
const ORIGEM_Y = -0.02;

function campo(px: number, py: number, pz: number) {
  let s = 0;
  for (let i = 0; i < BLOBS.length; i++) {
    const b = BLOBS[i];
    const dx = px - b[0];
    const dy = py - b[1];
    const dz = pz - b[2];
    s += Math.exp(-(dx * dx + dy * dy + dz * dz) / (b[3] * b[3]));
  }
  return s;
}

/**
 * Distância do centro até a superfície numa direção: caminha para fora até o
 * campo cair abaixo do limiar e refina a travessia por bisseção.
 */
function raioAte(dx: number, dy: number, dz: number) {
  const PASSO = 0.02;
  let dentro = 0.02;
  let fora = -1;

  for (let t = 0.05; t < 1.7; t += PASSO) {
    if (campo(dx * t, ORIGEM_Y + dy * t, dz * t) >= LIMIAR) {
      dentro = t;
    } else if (dentro > 0.02) {
      fora = t;
      break;
    }
  }
  if (fora < 0) fora = dentro + PASSO;

  let lo = dentro;
  let hi = fora;
  for (let i = 0; i < 10; i++) {
    const mid = (lo + hi) / 2;
    if (campo(dx * mid, ORIGEM_Y + dy * mid, dz * mid) >= LIMIAR) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Giros e sulcos: deslocamento radial de alta frequência sobre a superfície. */
function aplicarGiros(px: number, py: number, pz: number) {
  const g =
    Math.sin(11.0 * px + 4.0 * py) * Math.cos(9.5 * pz + 3.0 * py) +
    0.7 * Math.sin(15.0 * pz - 6.5 * px) +
    0.55 * Math.cos(13.0 * py + 7.5 * pz) +
    0.4 * Math.sin(21.0 * px + 17.0 * pz) * Math.cos(19.0 * py);

  const len = Math.hypot(px, py, pz) || 1;
  const amp = 0.034 * g;
  return [
    px + (px / len) * amp,
    py + (py / len) * amp,
    pz + (pz / len) * amp,
  ] as const;
}


export function createBrain(
  canvas: HTMLCanvasElement,
  opts: BrainOptions
): BrainHandle {
  const parent = canvas.parentElement!;
  const baixa = opts.quality === 'baixa';

  const POINTS = baixa ? 1600 : 3200;
  const LINK_TRIES = baixa ? 6000 : 12000;
  const LINK_MAX = baixa ? 1200 : 2600;
  const LINK_DIST = 0.19;
  const SIGNALS = baixa ? 18 : 36;

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: window.devicePixelRatio < 1.5,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 3.35);

  const group = new Group();
  scene.add(group);

  // ------------------------------------------------------------ geometria --
  const positions = new Float32Array(POINTS * 3);
  const colors = new Float32Array(POINTS * 3);

  const cA = new Color(opts.colorA);
  const cB = new Color(opts.colorB);
  const cC = new Color(opts.colorC);
  const tmp = new Color();

  // Direções distribuídas por espiral de Fibonacci; para cada uma, acha onde a
  // superfície do campo está. É o que amarra os pontos à anatomia em vez de a
  // uma esfera.
  const golden = Math.PI * (3 - Math.sqrt(5));
  let maiorRaio = 0;

  for (let i = 0; i < POINTS; i++) {
    const sy = 1 - (i / (POINTS - 1)) * 2;
    const sr = Math.sqrt(Math.max(0, 1 - sy * sy));
    const th = golden * i;
    const dx = Math.cos(th) * sr;
    const dy = sy;
    const dz = Math.sin(th) * sr;

    const r = raioAte(dx, dy, dz);
    let px = dx * r;
    let py = ORIGEM_Y + dy * r;
    let pz = dz * r;

    // Fissura longitudinal: afasta os hemisférios e aprofunda a ranhura, mas
    // só acima do tronco — embaixo o cérebro é contínuo.
    const portao = Math.min(1, Math.max(0, (py + 0.12) / 0.25));
    const sulco = Math.exp(-(px * px) / 0.01) * portao;
    px += (px >= 0 ? 1 : -1) * 0.035 * sulco;
    py -= 0.075 * sulco;

    [px, py, pz] = aplicarGiros(px, py, pz);

    positions[i * 3] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;
    maiorRaio = Math.max(maiorRaio, Math.hypot(px, py, pz));

    // Gradiente por altura, com um toque da terceira cor na frente.
    const t = (py + 0.85) / 1.7;
    tmp.copy(cA).lerp(cB, Math.min(1, Math.max(0, t)));
    tmp.lerp(cC, Math.max(0, pz) * 0.35);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }

  // Normaliza para o volume ocupar sempre o mesmo espaço na câmera,
  // independente de ajustes nos blobs.
  const escala = 1.12 / (maiorRaio || 1);
  for (let i = 0; i < positions.length; i++) positions[i] *= escala;

  const pointsGeo = new BufferGeometry();
  pointsGeo.setAttribute('position', new BufferAttribute(positions, 3));
  pointsGeo.setAttribute('color', new BufferAttribute(colors, 3));

  const dotTexture = makeDotTexture();
  const pointsMat = new PointsMaterial({
    size: baixa ? 0.038 : 0.033,
    map: dotTexture,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  });
  group.add(new Points(pointsGeo, pointsMat));

  // ------------------------------------------------------------- conexões --
  // Pares aleatórios filtrados por distância: O(tentativas), sem estrutura
  // espacial, e visualmente indistinguível de um k-vizinhos de verdade.
  const linkPos: number[] = [];
  const linkCol: number[] = [];
  const linkPairs: Array<[number, number]> = [];

  for (let n = 0; n < LINK_TRIES && linkPairs.length < LINK_MAX; n++) {
    const a = (Math.random() * POINTS) | 0;
    const b = (Math.random() * POINTS) | 0;
    if (a === b) continue;
    const dx = positions[a * 3] - positions[b * 3];
    const dy = positions[a * 3 + 1] - positions[b * 3 + 1];
    const dz = positions[a * 3 + 2] - positions[b * 3 + 2];
    if (dx * dx + dy * dy + dz * dz > LINK_DIST * LINK_DIST) continue;

    linkPairs.push([a, b]);
    for (const idx of [a, b]) {
      linkPos.push(
        positions[idx * 3],
        positions[idx * 3 + 1],
        positions[idx * 3 + 2]
      );
      linkCol.push(colors[idx * 3], colors[idx * 3 + 1], colors[idx * 3 + 2]);
    }
  }

  const linesGeo = new BufferGeometry();
  linesGeo.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(linkPos), 3)
  );
  linesGeo.setAttribute(
    'color',
    new BufferAttribute(new Float32Array(linkCol), 3)
  );
  const linesMat = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  group.add(new LineSegments(linesGeo, linesMat));

  // -------------------------------------------------------------- sinais ---
  // Pulsos viajando pelas conexões: é o que dá a sensação de "pensando".
  const sigPos = new Float32Array(SIGNALS * 3);
  const sigState = Array.from({ length: SIGNALS }, () => {
    const pair = linkPairs[(Math.random() * linkPairs.length) | 0] ?? [0, 0];
    return { a: pair[0], b: pair[1], t: Math.random(), speed: 0.4 + Math.random() * 0.9 };
  });

  const sigGeo = new BufferGeometry();
  sigGeo.setAttribute('position', new BufferAttribute(sigPos, 3));
  const sigMat = new PointsMaterial({
    size: 0.075,
    map: dotTexture,
    color: new Color(opts.colorB),
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: true,
  });
  group.add(new Points(sigGeo, sigMat));

  // --------------------------------------------------------------- input ---
  let targetYaw = 0;
  let targetPitch = 0;
  // Vista inicial em 3/4, ligeiramente de cima: é o ângulo em que a silhueta
  // do cérebro se lê (lobo frontal, temporal e cerebelo). De frente, qualquer
  // volume desses vira um ovo.
  const VISTA_INICIAL = -1.15;
  let spin = VISTA_INICIAL;
  let yaw = VISTA_INICIAL;
  let pitch = 0.14;
  let dragging = false;
  let lastX = 0;

  const onPointerMove = (e: PointerEvent) => {
    const r = parent.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    targetYaw = nx * 0.45;
    targetPitch = 0.14 + ny * 0.3;
    if (dragging) {
      spin += (e.clientX - lastX) * 0.006;
      lastX = e.clientX;
    }
  };
  const onPointerDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onPointerUp = (e: PointerEvent) => {
    dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
  };
  const onLeave = () => {
    targetYaw = 0;
    targetPitch = 0.14;
  };

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('pointerleave', onLeave);

  // ---------------------------------------------------------------- loop ---
  const resize = () => {
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(parent);

  let raf = 0;
  let running = false;
  let pausedByCaller = false;
  let last = performance.now();

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    spin += dt * 0.12;
    yaw += (targetYaw + spin - yaw) * 0.06;
    pitch += (targetPitch - pitch) * 0.06;
    group.rotation.y = yaw;
    group.rotation.x = pitch;
    // Respiração sutil, para não parecer um objeto congelado.
    const breathe = 1 + Math.sin(now / 1400) * 0.012;
    group.scale.setScalar(breathe);

    for (let i = 0; i < SIGNALS; i++) {
      const s = sigState[i];
      s.t += dt * s.speed;
      if (s.t >= 1) {
        s.t = 0;
        const pair = linkPairs[(Math.random() * linkPairs.length) | 0];
        if (pair) {
          s.a = pair[0];
          s.b = pair[1];
        }
        s.speed = 0.4 + Math.random() * 0.9;
      }
      const t = s.t;
      sigPos[i * 3] =
        positions[s.a * 3] + (positions[s.b * 3] - positions[s.a * 3]) * t;
      sigPos[i * 3 + 1] =
        positions[s.a * 3 + 1] +
        (positions[s.b * 3 + 1] - positions[s.a * 3 + 1]) * t;
      sigPos[i * 3 + 2] =
        positions[s.a * 3 + 2] +
        (positions[s.b * 3 + 2] - positions[s.a * 3 + 2]) * t;
    }
    sigGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  };

  const start = () => {
    if (running || pausedByCaller) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  // Só anima o que está visível e com a aba em foco.
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { threshold: 0.05 }
  );
  io.observe(parent);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  return {
    setPaused(paused) {
      pausedByCaller = paused;
      if (paused) stop();
      else start();
    },
    dispose() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onLeave);
      pointsGeo.dispose();
      linesGeo.dispose();
      sigGeo.dispose();
      pointsMat.dispose();
      linesMat.dispose();
      sigMat.dispose();
      dotTexture.dispose();
      renderer.dispose();
    },
  };
}

