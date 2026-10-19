import React, { useEffect, useRef, useState } from 'react';
import { AvatarState, AvatarStyle } from '../types';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';

interface AvatarCanvasProps {
  state: AvatarState;
  style?: AvatarStyle;
  isSpeaking?: boolean;
  isListening?: boolean;
  size?: 'compact' | 'medium' | 'large' | 'hero';
  showControls?: boolean;
  onToggleMic?: () => void;
  onToggleSpeech?: () => void;
  voiceEnabled?: boolean;
  className?: string;
  statusMessage?: string;
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  state,
  style = '3d-human',
  isSpeaking = false,
  isListening = false,
  size = 'medium',
  showControls = true,
  onToggleMic,
  onToggleSpeech,
  voiceEnabled = true,
  className = '',
  statusMessage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [currentStyle, setCurrentStyle] = useState<AvatarStyle>(style);

  // Sync internal style if parent prop changes
  useEffect(() => {
    setCurrentStyle(style);
  }, [style]);

  const sizeDimensions = {
    compact: { width: 140, height: 140 },
    medium: { width: 280, height: 280 },
    large: { width: 380, height: 380 },
    hero: { width: 500, height: 500 },
  };

  const { width, height } = sizeDimensions[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let blinkProgress = 0;
    let nextBlinkTime = 120 + Math.random() * 180;
    let headTilt = 0;
    let mouthFlap = 0;

    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Handle Blinking
      if (time > nextBlinkTime) {
        blinkProgress += 0.2;
        if (blinkProgress >= Math.PI) {
          blinkProgress = 0;
          nextBlinkTime = time + 140 + Math.random() * 200;
        }
      }
      const eyeOpenness = blinkProgress > 0 ? (1 - Math.sin(blinkProgress)) : 1;

      // Handle Head Floating motion
      const floatY = Math.sin(time * 0.04) * (size === 'compact' ? 2 : 5);
      headTilt = Math.sin(time * 0.02) * 0.04;

      // Handle Mouth movement if speaking
      if (isSpeaking || state === 'SPEAKING') {
        mouthFlap = (Math.sin(time * 0.25) + 1) * 0.5 * (Math.sin(time * 0.1) + 1) * 0.5;
      } else {
        mouthFlap = 0;
      }

      ctx.save();
      ctx.translate(cx, cy + floatY);
      ctx.rotate(headTilt);

      // 1. Render Outer Ambient Glow and Energy Rings
      drawEnergyAura(ctx, time, state, isListening, width);

      // 2. Render Avatar by Selected Visual Style
      if (currentStyle === '3d-human') {
        draw3DHumanAvatar(ctx, time, eyeOpenness, mouthFlap, state, width);
      } else if (currentStyle === 'cyber-hologram') {
        drawCyberHologramAvatar(ctx, time, eyeOpenness, mouthFlap, state, width);
      } else if (currentStyle === 'stylized-anime') {
        drawAnimeAvatar(ctx, time, eyeOpenness, mouthFlap, state, width);
      } else {
        drawStarMinimalAvatar(ctx, time, state, width);
      }

      ctx.restore();

      // 3. Render Status Sparks / Thinking Constellation
      if (state === 'THINKING' || state === 'GENERATING' || state === 'PROCESSING') {
        drawConstellationParticles(ctx, time, cx, cy, width);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [width, height, state, currentStyle, isSpeaking, isListening]);

  // Procedural 3D Human Avatar Renderer
  const draw3DHumanAvatar = (
    ctx: CanvasRenderingContext2D,
    time: number,
    eyeOpenness: number,
    mouthFlap: number,
    state: AvatarState,
    w: number
  ) => {
    const scale = w / 320;
    ctx.scale(scale, scale);

    // Torso / High-collar Cyber Jacket
    const jacketGrad = ctx.createLinearGradient(0, 70, 0, 160);
    jacketGrad.addColorStop(0, '#131e3d');
    jacketGrad.addColorStop(1, '#080d1b');
    ctx.fillStyle = jacketGrad;
    ctx.beginPath();
    ctx.moveTo(-65, 140);
    ctx.quadraticCurveTo(-45, 95, -28, 85);
    ctx.lineTo(28, 85);
    ctx.quadraticCurveTo(45, 95, 65, 140);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#35D7FF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Collar neon trims
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-28, 85);
    ctx.lineTo(0, 115);
    ctx.lineTo(28, 85);
    ctx.stroke();

    // Neck
    const neckGrad = ctx.createLinearGradient(-15, 45, 15, 80);
    neckGrad.addColorStop(0, '#eacdb4');
    neckGrad.addColorStop(1, '#c59f81');
    ctx.fillStyle = neckGrad;
    ctx.beginPath();
    ctx.roundRect(-16, 45, 32, 45, 6);
    ctx.fill();

    // Head Base (Sculpted human face shape)
    const faceGrad = ctx.createRadialGradient(-5, -5, 10, 0, 10, 65);
    faceGrad.addColorStop(0, '#ffdfc4');
    faceGrad.addColorStop(0.7, '#e4ba98');
    faceGrad.addColorStop(1, '#cb9c78');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.moveTo(0, -68);
    ctx.bezierCurveTo(48, -68, 48, -10, 42, 28);
    ctx.bezierCurveTo(36, 56, 18, 68, 0, 70);
    ctx.bezierCurveTo(-18, 68, -36, 56, -42, 28);
    ctx.bezierCurveTo(-48, -10, -48, -68, 0, -68);
    ctx.fill();

    // Subtle face shadow / contours
    ctx.fillStyle = 'rgba(180, 110, 75, 0.15)';
    ctx.beginPath();
    ctx.ellipse(32, 10, 10, 24, 0.2, 0, Math.PI * 2);
    ctx.ellipse(-32, 10, 10, 24, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cyber Ear comms / neural interface
    ctx.fillStyle = '#35D7FF';
    ctx.shadowColor = '#35D7FF';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-46, 5, 4.5, 0, Math.PI * 2);
    ctx.arc(46, 5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Stylized Dark Navy / Violet Cyber Hair
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, -78);
    ctx.bezierCurveTo(55, -78, 55, -25, 48, -5);
    ctx.bezierCurveTo(42, -28, 25, -45, 0, -48);
    ctx.bezierCurveTo(-25, -45, -42, -28, -48, -5);
    ctx.bezierCurveTo(-55, -25, -55, -78, 0, -78);
    ctx.fill();

    // Glowing Hair Highlight Streak
    const hairStreak = ctx.createLinearGradient(-30, -70, 30, -30);
    hairStreak.addColorStop(0, '#35D7FF');
    hairStreak.addColorStop(0.5, '#8B5CF6');
    hairStreak.addColorStop(1, 'transparent');
    ctx.strokeStyle = hairStreak;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-28, -62);
    ctx.quadraticCurveTo(-10, -50, 18, -42);
    ctx.stroke();

    // Eyebrows
    ctx.strokeStyle = '#27202b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    // Expression adjustment
    const browTilt = state === 'THINKING' ? -3 : state === 'HAPPY' ? 3 : 0;
    ctx.beginPath();
    ctx.moveTo(-28, -24 + browTilt);
    ctx.quadraticCurveTo(-18, -27, -8, -23);
    ctx.moveTo(8, -23);
    ctx.quadraticCurveTo(18, -27, 28, -24 + browTilt);
    ctx.stroke();

    // Eyes
    drawHumanEye(ctx, -18, -12, eyeOpenness, state);
    drawHumanEye(ctx, 18, -12, eyeOpenness, state);

    // Nose
    ctx.strokeStyle = 'rgba(160, 95, 65, 0.4)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 12);
    ctx.quadraticCurveTo(3, 16, 6, 14);
    ctx.stroke();

    // Mouth with Lip-Sync
    const mouthWidth = 18;
    const mouthOpen = mouthFlap * 14;
    ctx.fillStyle = '#b3495d';
    ctx.strokeStyle = '#822c3c';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    if (mouthOpen > 2) {
      // Open mouth for speech
      ctx.ellipse(0, 32, mouthWidth / 2, mouthOpen / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Teeth highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-mouthWidth / 4, 32 - mouthOpen / 3, mouthWidth / 2, mouthOpen / 3);
    } else {
      // Gentle friendly smile
      ctx.moveTo(-mouthWidth / 2, 30);
      ctx.quadraticCurveTo(0, 34, mouthWidth / 2, 30);
      ctx.stroke();
    }
  };

  const drawHumanEye = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    openness: number,
    state: AvatarState
  ) => {
    ctx.save();
    ctx.translate(x, y);

    if (openness < 0.15) {
      // Closed / Blinking eye
      ctx.strokeStyle = '#2d2230';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.quadraticCurveTo(0, 2, 9, 0);
      ctx.stroke();
    } else {
      // Eye whites
      ctx.scale(1, openness);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris with futuristic Cyan / Violet dual ring
      const irisGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 5);
      irisGrad.addColorStop(0, '#35D7FF');
      irisGrad.addColorStop(0.7, '#2463eb');
      irisGrad.addColorStop(1, '#8B5CF6');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#080d1b';
      ctx.beginPath();
      ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Light Glint / Reflection
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-1.5, -1.5, 1.2, 0, Math.PI * 2);
      ctx.arc(1.5, 1, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Eyelid stroke
      ctx.strokeStyle = '#1e1624';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 9, Math.PI, 0, false);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Cybernetic Hologram Style
  const drawCyberHologramAvatar = (
    ctx: CanvasRenderingContext2D,
    time: number,
    eyeOpenness: number,
    mouthFlap: number,
    state: AvatarState,
    w: number
  ) => {
    const scale = w / 320;
    ctx.scale(scale, scale);

    // Scanlines
    ctx.fillStyle = 'rgba(53, 215, 255, 0.08)';
    for (let y = -80; y < 140; y += 4) {
      if ((y + time) % 8 === 0) {
        ctx.fillRect(-70, y, 140, 2);
      }
    }

    // Hologram Silhouette Head
    ctx.strokeStyle = '#35D7FF';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#35D7FF';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(0, -65);
    ctx.lineTo(38, -35);
    ctx.lineTo(44, 15);
    ctx.lineTo(24, 60);
    ctx.lineTo(0, 68);
    ctx.lineTo(-24, 60);
    ctx.lineTo(-44, 15);
    ctx.lineTo(-38, -35);
    ctx.closePath();
    ctx.stroke();

    // Geometric Facial Topology Wireframe
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -65);
    ctx.lineTo(0, 68);
    ctx.moveTo(-38, -35);
    ctx.lineTo(38, -35);
    ctx.moveTo(-44, 15);
    ctx.lineTo(44, 15);
    ctx.stroke();

    // Glowing Hologram Eyes
    ctx.fillStyle = '#35D7FF';
    ctx.beginPath();
    ctx.arc(-16, -10, 4.5 * eyeOpenness, 0, Math.PI * 2);
    ctx.arc(16, -10, 4.5 * eyeOpenness, 0, Math.PI * 2);
    ctx.fill();

    // Mouth Audio Waveform Visualizer
    ctx.strokeStyle = '#35D7FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const bars = 7;
    for (let i = 0; i < bars; i++) {
      const bx = (i - 3) * 5;
      const by = 30;
      const bHeight = (mouthFlap * 12 + Math.sin(time * 0.4 + i) * 3);
      ctx.moveTo(bx, by - bHeight / 2);
      ctx.lineTo(bx, by + bHeight / 2);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  // Stylized Anime Avatar
  const drawAnimeAvatar = (
    ctx: CanvasRenderingContext2D,
    time: number,
    eyeOpenness: number,
    mouthFlap: number,
    state: AvatarState,
    w: number
  ) => {
    const scale = w / 320;
    ctx.scale(scale, scale);

    // Anime Hair Background
    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.arc(0, -10, 52, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = '#FFF2E8';
    ctx.beginPath();
    ctx.moveTo(0, -45);
    ctx.quadraticCurveTo(36, -30, 32, 20);
    ctx.lineTo(0, 55);
    ctx.lineTo(-32, 20);
    ctx.quadraticCurveTo(-36, -30, 0, -45);
    ctx.fill();

    // Big Anime Eyes
    ctx.save();
    [-15, 15].forEach((ex) => {
      ctx.translate(ex, -5);
      if (eyeOpenness < 0.2) {
        ctx.strokeStyle = '#472269';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 2, 7, Math.PI * 0.8, Math.PI * 0.2, true);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#35D7FF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 10 * eyeOpenness, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8B5CF6';
        ctx.beginPath();
        ctx.ellipse(0, 3, 5, 5 * eyeOpenness, 0, 0, Math.PI * 2);
        ctx.fill();

        // Big Glints
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-2, -3, 2.5, 0, Math.PI * 2);
        ctx.arc(2, 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.translate(-ex, 5);
    });
    ctx.restore();

    // Anime Hair Bangs
    ctx.fillStyle = '#7C3AED';
    ctx.beginPath();
    ctx.moveTo(-36, -35);
    ctx.lineTo(-15, -15);
    ctx.lineTo(-8, -35);
    ctx.lineTo(0, -10);
    ctx.lineTo(8, -35);
    ctx.lineTo(15, -15);
    ctx.lineTo(36, -35);
    ctx.quadraticCurveTo(0, -65, -36, -35);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#D946EF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (mouthFlap > 0.2) {
      ctx.fillStyle = '#F43F5E';
      ctx.arc(0, 30, 6 * mouthFlap, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.moveTo(-5, 28);
      ctx.quadraticCurveTo(0, 32, 5, 28);
      ctx.stroke();
    }
  };

  // 2D Minimal Star Avatar
  const drawStarMinimalAvatar = (
    ctx: CanvasRenderingContext2D,
    time: number,
    state: AvatarState,
    w: number
  ) => {
    const scale = w / 320;
    ctx.scale(scale, scale);

    // Glowing Star Geometry
    const grad = ctx.createLinearGradient(-50, -50, 50, 50);
    grad.addColorStop(0, '#35D7FF');
    grad.addColorStop(0.5, '#8B5CF6');
    grad.addColorStop(1, '#35D7FF');

    ctx.fillStyle = grad;
    ctx.shadowColor = '#35D7FF';
    ctx.shadowBlur = 20;

    // 5 Point Star
    ctx.beginPath();
    const points = 5;
    const outerR = 55;
    const innerR = 25;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glowing Core
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 10 + Math.sin(time * 0.1) * 3, 0, Math.PI * 2);
    ctx.fill();
  };

  // Energy Aura and Orbital Rings
  const drawEnergyAura = (
    ctx: CanvasRenderingContext2D,
    time: number,
    state: AvatarState,
    listening: boolean,
    w: number
  ) => {
    const r = w * 0.42;

    // Ambient radial glow
    const glowColor =
      state === 'ERROR'
        ? 'rgba(239, 68, 68, 0.15)'
        : listening
        ? 'rgba(53, 215, 255, 0.25)'
        : state === 'THINKING'
        ? 'rgba(139, 92, 246, 0.25)'
        : 'rgba(53, 215, 255, 0.12)';

    const radGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r);
    radGrad.addColorStop(0, glowColor);
    radGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Orbital ring
    ctx.save();
    ctx.rotate(time * 0.01);
    ctx.strokeStyle = listening ? '#35D7FF' : 'rgba(53, 215, 255, 0.3)';
    ctx.lineWidth = listening ? 2 : 1;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.88, r * 0.35, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Orbital Satellite Star
    ctx.fillStyle = '#35D7FF';
    ctx.shadowColor = '#35D7FF';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(r * 0.85, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Constellation particles for THINKING state
  const drawConstellationParticles = (
    ctx: CanvasRenderingContext2D,
    time: number,
    cx: number,
    cy: number,
    w: number
  ) => {
    const numPoints = 8;
    const r = w * 0.35;
    const coords: [number, number][] = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = (i * Math.PI * 2) / numPoints + time * 0.02;
      const dist = r + Math.sin(time * 0.05 + i) * 15;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * (dist * 0.8);
      coords.push([px, py]);
    }

    // Connect constellation lines
    ctx.strokeStyle = 'rgba(53, 215, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < coords.length; i++) {
      const next = coords[(i + 1) % coords.length];
      ctx.moveTo(coords[i][0], coords[i][1]);
      ctx.lineTo(next[0], next[1]);
    }
    ctx.stroke();

    // Particle nodes
    coords.forEach(([px, py], idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#35D7FF' : '#8B5CF6';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const stateColors: Record<AvatarState, string> = {
    IDLE: 'text-[#98A3B8]',
    LISTENING: 'text-[#35D7FF]',
    THINKING: 'text-[#8B5CF6]',
    SPEAKING: 'text-[#35D7FF]',
    PROCESSING: 'text-[#8B5CF6]',
    GENERATING: 'text-[#35D7FF]',
    HAPPY: 'text-emerald-400',
    ERROR: 'text-red-400',
    OFFLINE: 'text-gray-500',
  };

  const styleLabels: Record<AvatarStyle, string> = {
    '3d-human': '3D Digital Human',
    'cyber-hologram': 'Cyber Hologram',
    'stylized-anime': 'Stylized Anime',
    'star-minimal': 'Star Minimal',
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Canvas Frame */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="rounded-2xl transition-all duration-300"
        />

        {/* Interactive State Ring Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#080D1B]/80 border border-[#35D7FF]/20 backdrop-blur-md text-[11px] font-semibold">
          <span
            className={`w-2 h-2 rounded-full ${
              isListening
                ? 'bg-[#35D7FF] animate-ping'
                : isSpeaking
                ? 'bg-[#8B5CF6] animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span className={stateColors[state] || 'text-[#F5F7FF]'}>
            {isListening ? 'LISTENING' : isSpeaking ? 'SPEAKING' : state}
          </span>
        </div>

        {/* Status Bubble if provided */}
        {statusMessage && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#111B35] border border-[#35D7FF]/30 text-xs text-[#35D7FF] font-medium shadow-lg shadow-[#080D1B]/80 max-w-[90%] truncate text-center">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Control Bar */}
      {showControls && (
        <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111B35]/90 border border-[#35D7FF]/15 backdrop-blur-md">
          {/* Style Selector */}
          <select
            value={currentStyle}
            onChange={(e) => setCurrentStyle(e.target.value as AvatarStyle)}
            className="bg-transparent text-xs text-[#F5F7FF] font-medium outline-none cursor-pointer pr-1"
          >
            <option value="3d-human" className="bg-[#111B35]">3D Human</option>
            <option value="cyber-hologram" className="bg-[#111B35]">Hologram</option>
            <option value="stylized-anime" className="bg-[#111B35]">Anime</option>
            <option value="star-minimal" className="bg-[#111B35]">Star Core</option>
          </select>

          <span className="text-[#98A3B8]/30">|</span>

          {/* Voice Input Toggle Button */}
          {onToggleMic && (
            <button
              onClick={onToggleMic}
              title={isListening ? 'Stop listening' : 'Start voice input'}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isListening
                  ? 'bg-[#35D7FF] text-[#080D1B] font-bold shadow-sm shadow-[#35D7FF]/50'
                  : 'text-[#98A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Speech Playback Toggle Button */}
          {onToggleSpeech && (
            <button
              onClick={onToggleSpeech}
              title={voiceEnabled ? 'Mute AI voice' : 'Enable AI voice playback'}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                voiceEnabled
                  ? 'text-[#35D7FF] hover:bg-[#35D7FF]/10'
                  : 'text-[#98A3B8]/60 hover:text-white'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
