import React, { useEffect, useRef } from 'react';

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes
    const nodeCount = Math.min(45, Math.floor(width / 30));
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number; color: string }[] = [];

    const colors = [
      'rgba(99, 102, 241, 0.25)', // Indigo
      'rgba(168, 85, 247, 0.22)', // Violet
      'rgba(56, 189, 248, 0.20)', // Cyan
    ];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render constellation lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.12;
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Render nodes and update positions
      nodes.forEach((node) => {
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Ambient gradient radials */}
      <div className="absolute -top-[20%] left-1/4 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-[15%] w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-[20%] left-1/3 w-[550px] h-[550px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Interactive canvas layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
    </div>
  );
};
