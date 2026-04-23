'use client'

import { useEffect, useRef } from 'react'

// Animated WebGL gradient mesh. Signature background effect.
// Renders flowing aurora-like gradients that slowly morph and breathe

const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;
  uniform float u_time;
  uniform vec2 u_resolution;

  // Simplex-ish noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.08;

    // Multiple noise layers for organic movement
    float n1 = snoise(uv * 1.5 + vec2(t * 0.3, t * 0.2));
    float n2 = snoise(uv * 2.5 + vec2(-t * 0.2, t * 0.35));
    float n3 = snoise(uv * 0.8 + vec2(t * 0.15, -t * 0.1));

    // Cyan:      approx oklch(0.78 0.13 198)
    // Orange:    approx oklch(0.72 0.16 55)
    // Lavender:  approx oklch(0.68 0.13 290)

    vec3 cyan     = vec3(0.25, 0.78, 0.86);
    vec3 orange   = vec3(0.98, 0.62, 0.25);
    vec3 lavender = vec3(0.60, 0.48, 0.80);
    vec3 deep     = vec3(0.04, 0.06, 0.10);

    float blend1 = smoothstep(-0.3, 0.6, n1) * smoothstep(0.0, 0.7, 1.0 - uv.y + uv.x * 0.3);
    float blend2 = smoothstep(-0.2, 0.5, n2) * smoothstep(0.0, 0.8, uv.y + (1.0 - uv.x) * 0.2);
    float blend3 = smoothstep(-0.1, 0.7, n3) * smoothstep(0.2, 0.9, uv.x * 0.5 + uv.y * 0.5);

    vec3 color = deep;
    color = mix(color, cyan,     blend1 * 0.07);
    color = mix(color, orange,   blend2 * 0.05);
    color = mix(color, lavender, blend3 * 0.04);

    // Subtle vignette
    float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5) * 1.2);
    color *= 0.85 + vignette * 0.15;

    gl_FragColor = vec4(color, 1.0);
  }
`

export default function GradientMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) return

    // Create shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vs, VERTEX_SHADER)
    gl.compileShader(vs)

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fs, FRAGMENT_SHADER)
    gl.compileShader(fs)

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.warn('WebGL shader failed, falling back to CSS background')
      return
    }

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    // Full-screen quad
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const resLoc = gl.getUniformLocation(program, 'u_resolution')

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5) // Cap for performance
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)

    const startTime = performance.now()
    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000
      gl.uniform1f(timeLoc, elapsed)
      gl.uniform2f(resLoc, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  )
}
