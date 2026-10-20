import React, { useState } from 'react';
import { StarApi } from '../services/api';
import { VideoStoryboard } from '../types';
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
  Share2,
  Download,
  AlertCircle,
  Pause
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
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

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

  const handleDownloadStoryboard = () => {
    if (!storyboard) return;
    const blob = new Blob([JSON.stringify(storyboard, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STAR_AI_Storyboard_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeSceneData = storyboard?.scenes[selectedScene];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600">
            <Clapperboard className="w-3.5 h-3.5" />
            <span>STAR VIDEO & ANIMATION STUDIO</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            AI Cinematography, Screenplay & Storyboarding
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            Generates timed shot-lists, camera movements, voiceover narration scripts, and direct generation prompts for video models (Google DeepMind Veo).
          </p>
        </div>

        {/* Input Formulation */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Video Concept & Screenplay Prompt:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A 30s cinematic teaser revealing STAR AI's digital avatar, transitioning from cosmic stars to interface..."
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

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold">Target Duration:</span>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value={15}>15 Seconds (Short/Reel)</option>
                <option value={30}>30 Seconds (Commercial)</option>
                <option value={60}>60 Seconds (Full Teaser)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold">Cinematic Mood:</span>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="cinematic sci-fi">Cinematic Sci-Fi</option>
                <option value="photorealistic documentary">National Geographic Doc</option>
                <option value="cyberpunk anime">Cyberpunk Anime</option>
                <option value="minimalist commercial">Modern Tech Commercial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Video Service Status & Integration Note */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs text-blue-900">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Google DeepMind Veo Video Model Status:</span>
            <p className="text-slate-600 leading-relaxed">
              Video generation prompts and timed camera trajectories are synthesized in real-time. Direct raster MP4 rendering via Google Veo requires an enterprise Vertex AI Video quota. Complete storyboards, timing markers, and camera prompts are ready for immediate export.
            </p>
          </div>
        </div>

        {/* Presets */}
        {!storyboard && !isLoading && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group shadow-xs"
                >
                  <div className="text-xs font-bold text-blue-600 mb-1">{vp.title}</div>
                  <p className="text-[11px] text-slate-600 group-hover:text-slate-900 line-clamp-3">
                    {vp.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-900">STAR Video Studio is synthesizing production storyboard...</div>
            <div className="text-xs text-slate-500">Creating scene camera directives, timing, and voiceover script</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Storyboard View */}
        {storyboard && !isLoading && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{storyboard.title}</h3>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">{storyboard.logline}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Script'}</span>
                  </button>
                  <button
                    onClick={handleDownloadStoryboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>

              {/* Interactive Scene Preview Stage */}
              {activeSceneData && (
                <div className="p-5 rounded-xl bg-slate-900 text-white space-y-3 shadow-md">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-blue-400">
                      LIVE SCENE PREVIEW: SCENE {activeSceneData.sceneNumber} OF {storyboard.scenes.length}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                      {activeSceneData.cameraMovement} · {activeSceneData.durationSeconds}s
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 text-sm leading-relaxed text-slate-100">
                    <div className="text-xs text-blue-400 font-semibold mb-1">Visual Cinematography:</div>
                    {activeSceneData.visualDescription}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-xs text-violet-300">
                    <span className="font-semibold text-white">Voiceover / Dialogue: </span>
                    &ldquo;{activeSceneData.voiceover}&rdquo;
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap">
                <span className="font-bold text-violet-700 block mb-1">Full Voiceover & Dialogue Script:</span>
                {storyboard.fullScript}
              </div>
            </div>

            {/* Scene-by-Scene Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-blue-600" />
                <span>Scene-by-Scene Storyboard & Camera Directives ({storyboard.scenes.length} Scenes)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storyboard.scenes.map((scene, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedScene(idx)}
                    className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer space-y-3 shadow-xs ${
                      selectedScene === idx
                        ? 'border-blue-500 ring-2 ring-blue-300/40 bg-blue-50/20'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-600">
                        Scene {scene.sceneNumber} · {scene.durationSeconds}s
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-mono">
                        {scene.cameraMovement}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed">
                      {scene.visualDescription}
                    </p>

                    <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="text-[11px] text-violet-700 font-semibold flex items-center gap-1">
                        <Clapperboard className="w-3 h-3" />
                        <span>Voiceover:</span>
                      </div>
                      <div className="text-xs text-slate-600 italic">&ldquo;{scene.voiceover}&rdquo;</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Veo Prompt: </span>
                      <span className="font-mono text-blue-600">{scene.imagePromptForVeo}</span>
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
