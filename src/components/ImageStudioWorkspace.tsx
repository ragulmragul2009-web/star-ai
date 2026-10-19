import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { GeneratedImage } from '../types';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCw,
  Maximize2,
  Trash2,
  Sliders,
  Palette
} from 'lucide-react';

export const ImageStudioWorkspace: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('futuristic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([
    {
      id: 'img-1',
      prompt: 'A sleek humanoid digital assistant with glowing cyan star insignia standing in a neon midnight observatory',
      style: 'futuristic',
      aspectRatio: '1:1',
      imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23080D1B"/><stop offset="50%" stop-color="%23111B35"/><stop offset="100%" stop-color="%231E1035"/></linearGradient><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2335D7FF"/><stop offset="100%" stop-color="%238B5CF6"/></linearGradient></defs><rect width="800" height="800" fill="url(%23bg)"/><circle cx="400" cy="400" r="260" fill="none" stroke="rgba(53,215,255,0.2)" stroke-width="2" stroke-dasharray="12 6"/><polygon points="400,220 445,340 575,350 475,440 505,570 400,500 295,570 325,440 225,350 355,340" fill="url(%23sg)" opacity="0.9"/><circle cx="400" cy="400" r="35" fill="%23FFFFFF"/><text x="400" y="720" fill="%2335D7FF" font-family="sans-serif" font-weight="700" font-size="18" text-anchor="middle">STAR AI DIGITAL HUMAN · FUTURISTIC</text></svg>',
      createdAt: Date.now() - 3600000,
    },
  ]);
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(images[0]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stylePresets = [
    { id: 'futuristic', name: 'Futuristic Sci-Fi', desc: 'Neon cyan, metallic, 8K unreal render' },
    { id: 'photographic', name: 'Studio Photography', desc: 'Hyper-realistic 85mm portrait, natural depth' },
    { id: 'anime', name: 'Shinkai Anime Art', desc: 'Vibrant cloudscapes and emotional lighting' },
    { id: 'render3d', name: 'Octane 3D Render', desc: 'Pixar/Disney 3D digital art with volumetric rays' },
    { id: 'minimalist', name: 'Minimalist Vector', desc: 'Swiss design aesthetic with elegant negative space' },
    { id: 'cyberpunk', name: 'Cyberpunk Metropolis', desc: 'Rain-soaked street reflections and neon glow' },
  ];

  const aspectRatios = [
    { id: '1:1', label: '1:1 Square' },
    { id: '16:9', label: '16:9 Landscape' },
    { id: '9:16', label: '9:16 Portrait' },
    { id: '4:3', label: '4:3 Standard' },
  ];

  const handleGenerate = async (presetPrompt?: string) => {
    const finalPrompt = presetPrompt || prompt;
    if (!finalPrompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await StarApi.generateImage(finalPrompt.trim(), aspectRatio, style, negativePrompt);
      const newImg: GeneratedImage = {
        id: 'img-' + Date.now(),
        prompt: finalPrompt.trim(),
        style,
        aspectRatio,
        imageUrl: data.imageUrl,
        description: data.description,
        createdAt: Date.now(),
      };
      setImages((prev) => [newImg, ...prev]);
      setActiveImage(newImg);
    } catch (err: any) {
      setError(err.message || 'Image generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (img: GeneratedImage) => {
    const a = document.createElement('a');
    a.href = img.imageUrl;
    a.download = `STAR_AI_${img.id}.png`;
    a.click();
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080D1B] overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#35D7FF]/10 border border-[#35D7FF]/20 text-xs font-bold text-[#35D7FF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STAR IMAGE STUDIO</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Next-Generation Visual Synthesis & Art
          </h2>
          <p className="text-xs text-[#98A3B8]">
            Create high-fidelity artwork, photorealistic concept art, character silhouettes, and branding assets.
          </p>
        </div>

        {/* Input Formulation Form */}
        <div className="p-5 rounded-2xl bg-[#111B35]/80 border border-[#35D7FF]/20 space-y-4 shadow-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Visual Prompt Description:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Glowing cybernetic star portal in space, volumetric starlight, cyan violet reflections, cinematic 8k..."
                className="flex-1 bg-[#080D1B] border border-[#35D7FF]/20 rounded-xl px-4 py-3 text-sm text-white placeholder-[#98A3B8]/60 focus:outline-none focus:border-[#35D7FF]"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#35D7FF] to-[#8B5CF6] text-[#080D1B] font-bold text-xs disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Art</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Style & Aspect Ratio Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
            {/* Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#98A3B8] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#35D7FF]" />
                <span>Visual Style Preset:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {stylePresets.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStyle(st.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      style === st.id
                        ? 'bg-[#35D7FF]/15 border-[#35D7FF] text-white font-semibold'
                        : 'bg-[#080D1B] border-white/5 text-[#98A3B8] hover:text-white'
                    }`}
                  >
                    <div className="text-xs">{st.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#98A3B8] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Aspect Ratio & Formatting:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      aspectRatio === ar.id
                        ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white font-semibold'
                        : 'bg-[#080D1B] border-white/5 text-[#98A3B8] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-medium">{ar.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Active Featured Image Viewer */}
        {activeImage && (
          <div className="p-6 rounded-2xl bg-[#111B35]/90 border border-[#35D7FF]/25 shadow-2xl flex flex-col md:flex-row gap-6 items-center">
            {/* Image Canvas / Render */}
            <div className="w-full md:w-1/2 aspect-square rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center relative group">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.prompt}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => handleDownload(activeImage)}
                className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-[#080D1B]/90 border border-[#35D7FF]/40 text-[#35D7FF] opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                title="Download Image"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata & Actions */}
            <div className="w-full md:w-1/2 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#35D7FF]/15 text-[#35D7FF]">
                  {activeImage.style} · {activeImage.aspectRatio}
                </span>
                <h3 className="text-base font-bold text-white mt-2 leading-snug">
                  {activeImage.prompt}
                </h3>
              </div>

              {activeImage.description && (
                <p className="text-xs text-[#98A3B8] leading-relaxed">
                  {activeImage.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => handleDownload(activeImage)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#35D7FF] text-[#080D1B] font-bold text-xs hover:brightness-110 active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res</span>
                </button>
                <button
                  onClick={() => handleCopyPrompt(activeImage.prompt)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080D1B] border border-white/10 text-xs text-[#98A3B8] hover:text-white"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Image Gallery Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#98A3B8] flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-[#35D7FF]" />
            <span>Generation History ({images.length})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setActiveImage(img)}
                className={`group relative rounded-xl overflow-hidden aspect-square border cursor-pointer transition-all ${
                  activeImage?.id === img.id
                    ? 'border-[#35D7FF] ring-2 ring-[#35D7FF]/30 scale-[1.02]'
                    : 'border-white/10 hover:border-[#35D7FF]/50'
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt={img.prompt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-[10px] text-white">
                  <span className="truncate">{img.prompt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
