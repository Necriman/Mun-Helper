import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const nodes = [
  { left: '19%', top: '38%', label: 'Tashkent' },
  { left: '36%', top: '27%', label: 'Samarkand' },
  { left: '54%', top: '42%', label: 'Bukhara' },
  { left: '68%', top: '31%', label: 'Fergana' },
  { left: '80%', top: '52%', label: 'Nukus' },
  { left: '44%', top: '64%', label: 'Upcoming' },
];

export default function DiplomaticReveal() {
  const layerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return undefined;

    let frame = 0;
    const target = { x: -200, y: -200 };
    const smooth = { x: -200, y: -200 };

    const setSpotlight = () => {
      smooth.x += (target.x - smooth.x) * 0.12;
      smooth.y += (target.y - smooth.y) * 0.12;
      layer.style.setProperty('--spot-x', `${smooth.x}px`);
      layer.style.setProperty('--spot-y', `${smooth.y}px`);
      frame = window.requestAnimationFrame(setSpotlight);
    };

    const move = (event) => {
      const rect = layer.getBoundingClientRect();
      target.x = event.clientX - rect.left;
      target.y = event.clientY - rect.top;
    };

    const drift = (time) => {
      const rect = layer.getBoundingClientRect();
      target.x = rect.width * 0.5 + Math.cos(time * 0.00045) * rect.width * 0.22;
      target.y = rect.height * 0.48 + Math.sin(time * 0.00045) * rect.height * 0.18;
      frame = window.requestAnimationFrame(drift);
    };

    if (reduceMotion) {
      layer.style.setProperty('--spot-x', '50%');
      layer.style.setProperty('--spot-y', '48%');
      return undefined;
    }

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (finePointer) {
      window.addEventListener('pointermove', move, { passive: true });
      frame = window.requestAnimationFrame(setSpotlight);
    } else {
      frame = window.requestAnimationFrame(drift);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
    };
  }, [reduceMotion]);

  return (
    <div ref={layerRef} className="diplomatic-reveal absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute left-1/2 top-[48%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-[48%] h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-[48%] h-px w-[68rem] -translate-x-1/2 bg-white/10" />
        <div className="absolute left-1/2 top-[48%] h-[38rem] w-px -translate-y-1/2 bg-white/10" />
      </div>

      <div className="diplomatic-reveal__live absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--spot-x)_var(--spot-y),rgba(91,146,229,0.36),transparent_18rem)]" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M19 38 C30 22 44 20 54 42 S70 72 80 52" className="diplomatic-line" />
          <path d="M36 27 C47 17 59 20 68 31" className="diplomatic-line diplomatic-line--delay" />
          <path d="M19 38 C23 58 33 68 44 64 S62 53 80 52" className="diplomatic-line diplomatic-line--slow" />
        </svg>

        {nodes.map((node, index) => (
          <span
            key={node.label}
            className="diplomatic-node group absolute"
            style={{ left: node.left, top: node.top, animationDelay: `${index * 0.18}s` }}
          >
            <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-un-100/30" />
            <span className="block h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_18px_rgba(127,194,239,0.92)]" />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm border border-white/15 bg-un-900/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-un-50/80 backdrop-blur">
              {node.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
