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
  Palette,
  Sliders
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
      prompt: 'A sleek humanoid digital assistant with glowing blue star insignia standing in a luminous light-filled studio',
      style: 'futuristic',
      aspectRatio: '1:1',
      imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23F8FAFC"/><stop offset="50%" stop-color="%23EEF2F6"/><stop offset="100%" stop-color="%23E2E8F0"/></linearGradient><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232563EB"/><stop offset="100%" stop-color="%237C3AED"/></linearGradient></defs><rect width="800" height="800" fill="url(%23bg)"/><circle cx="400" cy="400" r="260" fill="none" stroke="rgba(37,99,235,0.2)" stroke-width="2" stroke-dasharray="12 6"/><polygon points="400,220 445,340 575,350 475,440 505,570 400,500 295,570 325,440 225,350 355,340" fill="url(%23sg)" opacity="0.9"/><circle cx="400" cy="400" r="35" fill="%23FFFFFF"/><text x="400" y="720" fill="%232563EB" font-family="sans-serif" font-weight="700" font-size="18" text-anchor="middle">STAR AI DIGITAL HUMAN · FUTURISTIC</text></svg>',
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
    a.download = `STAR_AI_${img.id}.svg`;
    a.click();
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STAR IMAGE STUDIO</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Next-Generation Visual Synthesis & Art
          </h2>
          <p className="text-xs text-slate-500">
            Create high-fidelity artwork, photorealistic concept art, character silhouettes, and branding assets.
          </p>
        </div>

        {/* Input Formulation Form */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Visual Prompt Description:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Glowing cybernetic star portal in space, volumetric starlight, cyan violet reflections, cinematic 8k..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || isLoading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all flex items-center gap-2 shrink-0 shadow-xs cursor-pointer"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            {/* Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>Visual Style Preset:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {stylePresets.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStyle(st.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      style === st.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs">{st.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-violet-600" />
                <span>Aspect Ratio & Formatting:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      aspectRatio === ar.id
                        ? 'bg-violet-50 border-violet-500 text-violet-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Active Featured Image Viewer */}
        {activeImage && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
            {/* Image Canvas / Render */}
            <div className="w-full md:w-1/2 aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative group shadow-inner">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.prompt}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => handleDownload(activeImage)}
                className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-white/90 border border-slate-200 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 shadow-md cursor-pointer"
                title="Download Image"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata & Actions */}
            <div className="w-full md:w-1/2 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {activeImage.style} · {activeImage.aspectRatio}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                  {activeImage.prompt}
                </h3>
              </div>

              {activeImage.description && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeImage.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleDownload(activeImage)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res</span>
                </button>
                <button
                  onClick={() => handleCopyPrompt(activeImage.prompt)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Image Gallery Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Generation History ({images.length})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setActiveImage(img)}
                className={`group relative rounded-xl overflow-hidden aspect-square border cursor-pointer transition-all shadow-xs ${
                  activeImage?.id === img.id
                    ? 'border-blue-600 ring-2 ring-blue-400/40 scale-[1.02]'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt={img.prompt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-[10px] text-white">
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
