/*
  Réseau d'agents en WebGL (Three.js) — pièce maîtresse du hero.
  Au centre : l'orchestrateur (la photo, en HTML par-dessus le canvas).
  Anneau 1 : 5 agents. Anneau 2 : outils et sources. Nuage externe : données.
  Des signaux remontent en continu des données vers le centre ; quelques sources « en alerte » envoient des signaux ambre.
*/
import * as THREE from 'three'

const CYAN = new THREE.Color('#38bdf8')
const CYAN_2 = new THREE.Color('#22d3ee')
const ICE = new THREE.Color('#cfefff')
const AMBER = new THREE.Color('#f5a524')

// Générateur pseudo-aléatoire déterministe : le réseau est identique à chaque visite.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Packet {
  path: number[]
  seg: number
  t: number
  speed: number
  alert: boolean
}

interface Node {
  pos: THREE.Vector3
  parent: number // -1 = centre
  layer: 0 | 1 | 2 | 3
  alert: boolean
}

const revealGLSL = /* glsl */ `
  uniform float uProgress;
  uniform float uScatter;
  float revealScale(float r) {
    float t = clamp((uProgress * 1.6 - r * 0.09), 0.0, 1.0);
    return 1.0 - pow(2.0, -10.0 * t);
  }
  vec3 placed(vec3 p) {
    float r = length(p);
    vec3 dir = r > 0.0001 ? p / r : vec3(0.0);
    vec3 q = p * revealScale(r);
    return q + dir * uScatter * (0.6 + r * 0.45);
  }
`

export interface NetworkOptions {
  reducedMotion: boolean
  onPulse?: () => void
}

export class AgentNetwork {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private group = new THREE.Group()
  private nodes: Node[] = []
  private uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uScatter: { value: 0 },
    uFade: { value: 1 },
    uPixelRatio: { value: 1 },
  }
  private packets: Packet[] = []
  private packetGeo!: THREE.BufferGeometry
  private pointer = new THREE.Vector2()
  private pointerEased = new THREE.Vector2()
  private raf = 0
  private running = false
  private last = 0
  private elapsed = 0
  private lastPulse = 0
  private ro: ResizeObserver

  private canvas: HTMLCanvasElement
  private opts: NetworkOptions

  constructor(canvas: HTMLCanvasElement, opts: NetworkOptions) {
    this.canvas = canvas
    this.opts = opts
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x000000, 0)
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    this.camera.position.set(0, 0, 15.5)
    this.scene.add(this.group)
    this.group.rotation.set(0.32, -0.4, 0.08)

    this.buildNodes()
    this.buildPoints()
    this.buildLines()
    this.buildPackets()
    this.updatePackets(0, 0)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(canvas)
    this.resize()

    if (opts.reducedMotion) {
      this.uniforms.uProgress.value = 1
      this.render()
    }
  }

  private buildNodes() {
    const rand = mulberry32(943)
    const onSphere = (rMin: number, rMax: number, flatten = 0.62) => {
      const u = rand() * 2 - 1
      const th = rand() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      const r = rMin + rand() * (rMax - rMin)
      return new THREE.Vector3(s * Math.cos(th) * r, u * r * flatten, s * Math.sin(th) * r)
    }
    const nearest = (p: THREE.Vector3, layer: number) => {
      let best = -1
      let bd = Infinity
      this.nodes.forEach((n, i) => {
        if (n.layer !== layer) return
        const d = n.pos.distanceToSquared(p)
        if (d < bd) {
          bd = d
          best = i
        }
      })
      return best
    }

    // Centre (non dessiné : c'est la photo)
    this.nodes.push({ pos: new THREE.Vector3(), parent: -1, layer: 0, alert: false })
    // 5 agents, répartis régulièrement
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3
      this.nodes.push({
        pos: new THREE.Vector3(Math.cos(a) * 2.1, Math.sin(a * 2) * 0.55, Math.sin(a) * 2.1),
        parent: 0,
        layer: 1,
        alert: false,
      })
    }
    // Outils / sources
    for (let i = 0; i < 26; i++) {
      const p = onSphere(3.1, 4.2)
      this.nodes.push({ pos: p, parent: nearest(p, 1), layer: 2, alert: false })
    }
    // Données
    for (let i = 0; i < 120; i++) {
      const p = onSphere(4.6, 7.4, 0.55)
      this.nodes.push({ pos: p, parent: nearest(p, 2), layer: 3, alert: false })
    }
    // Trois sources en alerte
    const outer = this.nodes.map((n, i) => (n.layer === 3 ? i : -1)).filter((i) => i >= 0)
    ;[outer[7], outer[41], outer[88]].forEach((i) => (this.nodes[i].alert = true))
  }

  private buildPoints() {
    const n = this.nodes.length - 1
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const size = new Float32Array(n)
    const seed = new Float32Array(n)
    this.nodes.slice(1).forEach((node, i) => {
      node.pos.toArray(pos, i * 3)
      const c = node.alert ? AMBER : node.layer === 1 ? ICE : node.layer === 2 ? CYAN_2 : CYAN
      c.toArray(col, i * 3)
      size[i] = node.layer === 1 ? 64 : node.layer === 2 ? 34 : node.alert ? 30 : 14 + (i % 5) * 2
      seed[i] = (i * 0.6180339) % 1
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        ${revealGLSL}
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float aSize;
        attribute float aSeed;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vDepth;
        void main() {
          vec3 p = placed(position);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float tw = 0.82 + 0.18 * sin(uTime * 1.7 + aSeed * 6.2831);
          gl_PointSize = aSize * tw * uPixelRatio * (9.0 / -mv.z) * revealScale(length(position));
          vColor = color;
          vDepth = smoothstep(24.0, 9.0, -mv.z);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uFade;
        varying vec3 vColor;
        varying float vDepth;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float core = smoothstep(0.16, 0.0, d);
          float glow = pow(smoothstep(0.5, 0.0, d), 2.4) * 0.55;
          float a = (core + glow) * (0.35 + 0.65 * vDepth) * uFade;
          if (a < 0.01) discard;
          gl_FragColor = vec4(vColor * (0.8 + core), a);
        }`,
    })
    this.group.add(new THREE.Points(geo, mat))
  }

  private buildLines() {
    const segs: number[] = []
    const alert: number[] = []
    const push = (a: THREE.Vector3, b: THREE.Vector3, al: number) => {
      segs.push(a.x, a.y, a.z, b.x, b.y, b.z)
      alert.push(al, al)
    }
    this.nodes.forEach((n) => {
      if (n.parent < 0) return
      push(n.pos, this.nodes[n.parent].pos, n.alert ? 1 : 0)
    })
    // Liens transverses entre outils voisins : le réseau respire moins « arbre »
    const tools = this.nodes.filter((n) => n.layer === 2)
    tools.forEach((a, i) => {
      const b = tools.filter((_, j) => j !== i).sort((x, y) => x.pos.distanceToSquared(a.pos) - y.pos.distanceToSquared(a.pos))[0]
      if (b) push(a.pos, b.pos, 0)
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3))
    geo.setAttribute('aAlert', new THREE.Float32BufferAttribute(alert, 1))
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        ${revealGLSL}
        attribute float aAlert;
        varying float vDepth;
        varying float vAlert;
        void main() {
          vec4 mv = modelViewMatrix * vec4(placed(position), 1.0);
          gl_Position = projectionMatrix * mv;
          vDepth = smoothstep(24.0, 9.0, -mv.z);
          vAlert = aAlert;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uFade;
        uniform float uProgress;
        varying float vDepth;
        varying float vAlert;
        void main() {
          vec3 c = mix(vec3(0.22, 0.74, 0.97), vec3(0.96, 0.65, 0.14), vAlert);
          float a = (0.07 + 0.2 * vDepth) * smoothstep(0.35, 1.0, uProgress) * uFade;
          gl_FragColor = vec4(c, a);
        }`,
    })
    this.group.add(new THREE.LineSegments(geo, mat))
  }

  private pathFrom(i: number) {
    const path = [i]
    while (this.nodes[path[path.length - 1]].parent >= 0) path.push(this.nodes[path[path.length - 1]].parent)
    return path
  }

  private spawnPacket(p?: Packet): Packet {
    const outer = this.nodes.length - 1 - Math.floor(Math.random() * 120)
    const pk = p ?? { path: [], seg: 0, t: 0, speed: 0, alert: false }
    // Les sources en alerte émettent plus souvent
    const alertNodes = this.nodes.map((n, i) => (n.alert ? i : -1)).filter((i) => i >= 0)
    const start = Math.random() < 0.12 ? alertNodes[Math.floor(Math.random() * alertNodes.length)] : outer
    pk.path = this.pathFrom(start)
    pk.seg = 0
    pk.t = p ? 0 : Math.random()
    pk.speed = 0.5 + Math.random() * 0.5
    pk.alert = this.nodes[start].alert
    return pk
  }

  private buildPackets() {
    const count = 64
    for (let i = 0; i < count; i++) this.packets.push(this.spawnPacket())
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    this.packetGeo = new THREE.BufferGeometry()
    this.packetGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    this.packetGeo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        ${revealGLSL}
        uniform float uPixelRatio;
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * vec4(placed(position), 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = 15.0 * uPixelRatio * (9.0 / -mv.z);
          vColor = color;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uFade;
        uniform float uProgress;
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = pow(smoothstep(0.5, 0.0, d), 3.0) * smoothstep(0.7, 1.0, uProgress) * uFade;
          gl_FragColor = vec4(vColor * 1.6, a);
        }`,
    })
    this.group.add(new THREE.Points(this.packetGeo, mat))
  }

  private updatePackets(dt: number, elapsed: number) {
    const pos = this.packetGeo.attributes.position as THREE.BufferAttribute
    const col = this.packetGeo.attributes.color as THREE.BufferAttribute
    const tmp = new THREE.Vector3()
    this.packets.forEach((pk, i) => {
      const a = this.nodes[pk.path[pk.seg]].pos
      const b = this.nodes[pk.path[pk.seg + 1]].pos
      const len = a.distanceTo(b)
      pk.t += (dt * pk.speed * 2.2) / Math.max(len, 0.5)
      if (pk.t >= 1) {
        pk.seg++
        pk.t = 0
        if (pk.seg >= pk.path.length - 1) {
          if (elapsed - this.lastPulse > 0.9) {
            this.lastPulse = elapsed
            this.opts.onPulse?.()
          }
          this.spawnPacket(pk)
        }
      }
      const s = this.nodes[pk.path[pk.seg]].pos
      const e = this.nodes[pk.path[Math.min(pk.seg + 1, pk.path.length - 1)]].pos
      const k = pk.t * pk.t * (3 - 2 * pk.t)
      tmp.lerpVectors(s, e, k).toArray(pos.array as Float32Array, i * 3)
      ;(pk.alert ? AMBER : ICE).toArray(col.array as Float32Array, i * 3)
    })
    pos.needsUpdate = true
    col.needsUpdate = true
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas
    if (!w || !h) return
    const pr = Math.min(window.devicePixelRatio, 1.75)
    this.renderer.setPixelRatio(pr)
    this.renderer.setSize(w, h, false)
    this.uniforms.uPixelRatio.value = pr
    this.camera.aspect = w / h
    // Sur écran étroit, on recule pour garder tout le réseau visible
    this.camera.position.z = w / h < 0.9 ? 19 : 15.5
    this.camera.updateProjectionMatrix()
    if (!this.running) this.render()
  }

  setPointer(x: number, y: number) {
    this.pointer.set(x, y)
  }

  setProgress(v: number) {
    this.uniforms.uProgress.value = v
    if (!this.running) this.render()
  }

  setScroll(v: number) {
    this.uniforms.uScatter.value = v * 2.2
    this.uniforms.uFade.value = 1 - v * 0.85
    if (!this.running) this.render()
  }

  start() {
    if (this.running || this.opts.reducedMotion) return
    this.running = true
    this.last = performance.now()
    const loop = () => {
      if (!this.running) return
      const now = performance.now()
      const dt = Math.min((now - this.last) / 1000, 0.05)
      this.last = now
      this.elapsed += dt
      const t = this.elapsed
      this.uniforms.uTime.value = t
      this.pointerEased.lerp(this.pointer, 0.04)
      this.group.rotation.y = -0.4 + t * 0.045 + this.pointerEased.x * 0.28
      this.group.rotation.x = 0.32 + this.pointerEased.y * 0.16
      this.updatePackets(dt, t)
      this.render()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  private render() {
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.stop()
    this.ro.disconnect()
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      ;(m.material as THREE.Material | undefined)?.dispose?.()
    })
    this.renderer.dispose()
  }
}
