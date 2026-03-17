'use client'

export default function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div
        className="absolute rounded-full"
        style={{
          width: '50vw',
          height: '50vw',
          top: '-15%',
          left: '-10%',
          background: 'radial-gradient(circle, oklch(0.72 0.10 15 / 0.05) 0%, transparent 70%)',
          animation: 'breathe 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '40vw',
          height: '40vw',
          bottom: '-10%',
          right: '-5%',
          background: 'radial-gradient(circle, oklch(0.68 0.13 290 / 0.04) 0%, transparent 70%)',
          animation: 'breathe 12s ease-in-out infinite 2s',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: '30vw',
          height: '30vw',
          top: '40%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, oklch(0.72 0.10 15 / 0.03) 0%, transparent 70%)',
          animation: 'breathe 8s ease-in-out infinite 4s',
        }}
      />
    </div>
  )
}
