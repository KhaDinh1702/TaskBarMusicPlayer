import { useEffect, useRef } from "preact/hooks";

interface VisualizerProps {
  isPlaying: boolean;
}

export const Visualizer = ({ isPlaying }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const barCount = 36;
    const heights = new Array(barCount).fill(4);
    let phase = 0;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isPlaying) {
        phase += 0.08;
      }

      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        if (isPlaying) {
          const wave1 = Math.sin(phase + i * 0.35);
          const wave2 = Math.cos(phase * 1.5 + i * 0.2);
          const wave3 = Math.sin(phase * 0.7 - i * 0.15);
          const normalized = (wave1 + wave2 + wave3 + 3) / 6;
          const target = Math.max(6, normalized * (height - 4));
          heights[i] += (target - heights[i]) * 0.2;
        } else {
          heights[i] += (4 - heights[i]) * 0.1;
        }

        const barHeight = heights[i];
        const x = i * barWidth;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "rgba(191, 191, 189, 0.35)");
        gradient.addColorStop(0.6, "rgba(140, 140, 140, 0.75)");
        gradient.addColorStop(1, "rgba(38, 38, 38, 0.95)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, height - barHeight, Math.max(1, barWidth - 3), barHeight);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <div className="w-full h-12 flex items-center justify-center overflow-hidden rounded-lg bg-palette-surface/60 border border-palette-border">
      <canvas
        ref={canvasRef}
        width={360}
        height={48}
        className="w-full h-full opacity-90"
      />
    </div>
  );
};
