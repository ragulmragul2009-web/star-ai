import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { VideoStoryboard, StoryboardScene } from '../types';
import {
  Video,
  Clapperboard,
  Film,
  Sparkles,
  Play,
  RotateCw,
  Copy,
  Check,
  Clock,
  Camera,
  Music,
  Share2
} from 'lucide-react';

export const VideoStudioWorkspace: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(30);
  const [style, setStyle] = useState('cinematic sci-fi');
  const [isLoading, setIsLoading] = useState(false);
  const [storyboard, setStoryboard] = useState<VideoStoryboard | null>(null);
  const [selectedScene, setSelectedScene] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoPresets = [
    {
      title: 'STAR AI Brand Launch Cinematic',
      prompt: 'A 30-second cinematic reveal of STAR AI, starting from deep celestial cosmos, focusing into a glowing orbital star, and transforming into a friendly 3D human AI assistant.',
      duration: 30,
      style: 'Cinematic Sci-Fi with Volumetric Lighting',
    },
    {
      title: 'Solar System Planetary Tour',
      prompt: 'Educational 45-second micro-documentary flying past the rings of Saturn, landing on Enceladus ice geysers, with soothing scientific narration.',
      duration: 45,
      style: 'Hyper-Realistic Space Documentary',
    },
    {
      title: 'Eco-Smart City 2050 Promo',
      prompt: 'Futuristic commercial displaying vertical solar forests, autonomous aerial shuttles, and clean magnetic rail transport in a thriving metropolis.',
      duration: 30,
      style: 'Utopian Cyber Architecture',
    },
  ];

  const handleGenerate = async (presetPrompt?: string, presetDuration?: number, presetStyle?: string) => {
    const finalPrompt = presetPrompt || prompt;
    const finalDur = presetDuration || duration;
    const finalStyle = presetStyle || style;

    if (!finalPrompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await StarApi.generateStoryboard(finalPrompt.trim(), finalDur, finalStyle);
      setStoryboard(data.storyboard);
      setSelectedScene(0);
    } catch (err: any) {
      setError(err.message || 'Failed to generate video storyboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyScript = () => {
    if (!storyboard) return;
    navigator.clipboard.writeText(storyboard.fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080D1B] overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#35D7FF]/10 border border-[#35D7FF]/20 text-xs font-bold text-[#35D7FF]">
            <Clapperboard className="w-3.5 h-3.5" />
            <span>STAR VIDEO & ANIMATION STUDIO</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            AI Cinematography, Screenplay & Storyboarding
          </h2>
          <p className="text-xs text-[#98A3B8]">
            Generates timed shot-lists, camera movements, voiceover narration scripts, and Veo model generation prompts.
          </p>
        </div>

        {/* Input Formulation */}
        <div className="p-5 rounded-2xl bg-[#111B35]/80 border border-[#35D7FF]/20 space-y-4 shadow-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Video Concept & Screenplay Prompt:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A 30s cinematic teaser revealing STAR AI's digital avatar, transitioning from cosmic stars to interface..."
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
                    <span>Directing...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    <span>Generate Storyboard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
            <div className="flex items-center gap-2 text-[#98A3B8]">
              <span>Target Duration:</span>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="bg-[#080D1B] border border-[#35D7FF]/20 rounded-lg px-3 py-1 text-xs text-white outline-none cursor-pointer"
              >
                <option value={15}>15 Seconds (Short/Reel)</option>
                <option value={30}>30 Seconds (Commercial)</option>
                <option value={60}>60 Seconds (Full Teaser)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-[#98A3B8]">
              <span>Cinematic Mood:</span>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="bg-[#080D1B] border border-[#35D7FF]/20 rounded-lg px-3 py-1 text-xs text-white outline-none cursor-pointer"
              >
                <option value="cinematic sci-fi">Cinematic Sci-Fi</option>
                <option value="photorealistic documentary">National Geographic Doc</option>
                <option value="cyberpunk anime">Cyberpunk Anime</option>
                <option value="minimalist commercial">Modern Tech Commercial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Presets */}
        {!storyboard && !isLoading && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#98A3B8] uppercase tracking-wider">
              Featured Video Blueprints:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {videoPresets.map((vp, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPrompt(vp.prompt);
                    setDuration(vp.duration);
                    setStyle(vp.style);
                    handleGenerate(vp.prompt, vp.duration, vp.style);
                  }}
                  className="p-4 rounded-xl bg-[#111B35]/70 border border-[#35D7FF]/15 hover:border-[#35D7FF]/40 hover:bg-[#111B35] cursor-pointer transition-all group"
                >
                  <div className="text-xs font-bold text-[#35D7FF] mb-1">{vp.title}</div>
                  <p className="text-[11px] text-[#98A3B8] group-hover:text-white line-clamp-3">
                    {vp.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Storyboard View */}
        {storyboard && !isLoading && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-6 rounded-2xl bg-[#111B35]/90 border border-[#35D7FF]/25 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{storyboard.title}</h3>
                  <p className="text-xs text-[#35D7FF] font-medium mt-0.5">{storyboard.logline}</p>
                </div>
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080D1B] border border-white/10 text-xs text-[#98A3B8] hover:text-white"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Screenplay'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#080D1B]/80 border border-white/5 text-xs text-[#F5F7FF] whitespace-pre-wrap">
                <span className="font-bold text-[#8B5CF6] block mb-1">Full Voiceover & Dialogue:</span>
                {storyboard.fullScript}
              </div>
            </div>

            {/* Scene-by-Scene Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#98A3B8] flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-[#35D7FF]" />
                <span>Scene-by-Scene Storyboard & Camera Directives ({storyboard.scenes.length} Scenes)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storyboard.scenes.map((scene, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedScene(idx)}
                    className={`p-4 rounded-2xl bg-[#111B35]/80 border transition-all cursor-pointer space-y-3 ${
                      selectedScene === idx
                        ? 'border-[#35D7FF] shadow-lg shadow-[#35D7FF]/20 bg-[#111B35]'
                        : 'border-white/10 hover:border-[#35D7FF]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#35D7FF]">
                        Scene {scene.sceneNumber} · {scene.durationSeconds}s
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#080D1B] text-[10px] text-[#98A3B8] font-mono">
                        {scene.cameraMovement}
                      </span>
                    </div>

                    <p className="text-xs text-white leading-relaxed">
                      {scene.visualDescription}
                    </p>

                    <div className="space-y-1.5 p-2.5 rounded-xl bg-[#080D1B]/70 border border-white/5 text-xs">
                      <div className="text-[11px] text-[#8B5CF6] font-semibold flex items-center gap-1">
                        <Clapperboard className="w-3 h-3" />
                        <span>Voiceover / Audio:</span>
                      </div>
                      <div className="text-xs text-[#98A3B8] italic">&ldquo;{scene.voiceover}&rdquo;</div>
                    </div>

                    <div className="pt-2 border-t border-white/5 text-[11px] text-[#98A3B8]">
                      <span className="font-semibold text-white">Veo Prompt: </span>
                      <span className="font-mono text-[#35D7FF]">{scene.imagePromptForVeo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
