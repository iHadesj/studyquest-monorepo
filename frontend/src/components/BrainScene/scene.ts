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
 * Deforma um ponto da esfera até uma silhueta de cérebro: elipsoide achatado,
 * sulcos, fissura entre os hemisférios e um bojo de cerebelo atrás e embaixo.
 */
function toBrain(x: number, y: number, z: number) {
  // Giros e sulcos: soma de senos em frequências diferentes, para a superfície
  // não ficar lisa como uma esfera.
  const fold =
    1 +
    0.115 * Math.sin(7.0 * x + 2.5 * y) * Math.cos(6.0 * z) +
    0.075 * Math.sin(10.0 * z + 2.0 * y) +
    0.055 * Math.cos(12.0 * y + 4.0 * x);

  // Um cérebro é mais comprido (frente-trás) do que largo, e mais largo do
  // que alto. A esfera precisa dessa proporção antes de qualquer outra coisa.
  let px = x * 0.84 * fold;
  let py = y * 0.8 * fold;
  let pz = z * 1.06 * fold;

  // Fissura longitudinal separando os hemisférios.
  const groove = Math.exp(-(px * px) / 0.02);
  px += (px >= 0 ? 1 : -1) * 0.06 * groove;
  py -= 0.05 * groove;

  // Lobo temporal: alarga e puxa para baixo a lateral, à frente do centro.
  const temporal = Math.exp(
    -((py + 0.3) * (py + 0.3)) / 0.05 - ((pz - 0.18) * (pz - 0.18)) / 0.3
  );
  px *= 1 + 0.28 * temporal;
  py -= 0.09 * temporal;

  // Fissura de Sylvius: o sulco diagonal que descola o lobo temporal do resto.
  // É esta reentrância — mais do que a silhueta — que faz a forma ler como
  // cérebro em vez de bolha.
  const faixa = py + 0.1 - 0.3 * pz;
  const syl = Math.exp(-(faixa * faixa) / 0.007);
  const rad = Math.hypot(px, py, pz) || 1;
  px -= (px / rad) * 0.12 * syl;
  py -= (py / rad) * 0.12 * syl;
  pz -= (pz / rad) * 0.12 * syl;

  // Base achatada e testa um pouco mais projetada.
  if (py < 0) py *= 0.86;
  pz *= 1 + 0.1 * Math.max(0, py);

  // Cerebelo: bojo denso atrás e embaixo.
  const cb = Math.exp(
    -((pz + 0.8) * (pz + 0.8)) / 0.07 - ((py + 0.4) * (py + 0.4)) / 0.045
  );
  py -= 0.15 * cb;
  pz -= 0.1 * cb;

  // Tronco encefálico: puxa o miolo de trás para baixo.
  const stem = Math.exp(
    -(px * px) / 0.025 -
      ((pz + 0.32) * (pz + 0.32)) / 0.06 -
      ((py + 0.5) * (py + 0.5)) / 0.06
  );
  py -= 0.24 * stem;

  return [px, py, pz] as const;
}

export function createBrain(
  canvas: HTMLCanvasElement,
  opts: BrainOptions
): BrainHandle {
  const parent = canvas.parentElement!;
  const baixa = opts.quality === 'baixa';

  const POINTS = baixa ? 1400 : 2600;
  const LINK_TRIES = baixa ? 5000 : 9000;
  const LINK_MAX = baixa ? 1100 : 2200;
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

  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < POINTS; i++) {
    const sy = 1 - (i / (POINTS - 1)) * 2;
    const sr = Math.sqrt(Math.max(0, 1 - sy * sy));
    const th = golden * i;
    const [px, py, pz] = toBrain(Math.cos(th) * sr, sy, Math.sin(th) * sr);

    positions[i * 3] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;

    // Gradiente por altura, com um toque da terceira cor na frente.
    const t = (py + 0.85) / 1.7;
    tmp.copy(cA).lerp(cB, Math.min(1, Math.max(0, t)));
    tmp.lerp(cC, Math.max(0, pz) * 0.35);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }

  const pointsGeo = new BufferGeometry();
  pointsGeo.setAttribute('position', new BufferAttribute(positions, 3));
  pointsGeo.setAttribute('color', new BufferAttribute(colors, 3));

  const dotTexture = makeDotTexture();
  const pointsMat = new PointsMaterial({
    size: baixa ? 0.036 : 0.03,
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
    opacity: 0.24,
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
  const VISTA_INICIAL = -0.62;
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

