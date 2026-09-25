'use client';

import { useEffect, useRef } from 'react';

export default function ProductivityChart({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data?.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set actual size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 45 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, w, h);

    const scores = data.map((d) => d.score);
    const maxScore = Math.max(...scores, 100);
    const minScore = Math.min(...scores, 0);

    // Grid lines — cosmic blue tint
    ctx.strokeStyle = 'rgba(80, 120, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Y labels
      const val = Math.round(maxScore - ((maxScore - minScore) / 4) * i);
      ctx.fillStyle = 'rgba(160, 175, 220, 0.25)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(val.toString(), padding.left - 8, y + 4);
    }

    // Data points
    const points = data.map((d, i) => ({
      x: padding.left + (chartW / (data.length - 1)) * i,
      y: padding.top + chartH - ((d.score - minScore) / (maxScore - minScore)) * chartH,
    }));

    // Gradient fill — cosmic blue/violet
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, 'rgba(110, 142, 255, 0.12)');
    gradient.addColorStop(0.5, 'rgba(155, 109, 255, 0.04)');
    gradient.addColorStop(1, 'rgba(80, 120, 255, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, h - padding.bottom);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line — cosmic gradient stroke
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

    // Create gradient along the line
    const lineGrad = ctx.createLinearGradient(points[0].x, 0, points[points.length - 1].x, 0);
    lineGrad.addColorStop(0, 'rgba(110, 142, 255, 0.8)');
    lineGrad.addColorStop(0.5, 'rgba(155, 109, 255, 0.7)');
    lineGrad.addColorStop(1, 'rgba(56, 217, 245, 0.8)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Line glow effect
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = 'rgba(110, 142, 255, 0.15)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Dots — orbital style with cosmic glow
    points.forEach((p, i) => {
      // Outer glow ring
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(110, 142, 255, 0.06)';
      ctx.fill();

      // Orbital ring
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(110, 142, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Main dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      const dotGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 3.5);
      dotGrad.addColorStop(0, 'rgba(160, 190, 255, 1)');
      dotGrad.addColorStop(1, 'rgba(110, 142, 255, 0.8)');
      ctx.fillStyle = dotGrad;
      ctx.fill();

      // Center highlight (core)
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // X label
      const dateStr = data[i].date.slice(5); // MM-DD
      ctx.fillStyle = 'rgba(160, 175, 220, 0.25)';
      ctx.font = '11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(dateStr, p.x, h - padding.bottom + 20);
    });
  }, [data]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Productivity Trend (7 Days)</h3>
        <span className="badge badge-success">↑ Trending Up</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '240px', display: 'block' }}
      />
    </div>
  );
}
