import { useState } from "react";
import Header from "@/components/ui/header";
import PromptConfig from "@/components/ui/prompt-config";
import PromptOutput from "@/components/ui/prompt-output";
import TemplateLibrary from "@/components/ui/template-library";
import type { PromptConfig as PromptConfigType } from "@shared/schema";

export default function PromptGenerator() {
  const [config, setConfig] = useState<PromptConfigType>({
    category: "Sports & Athletics",
    style: "Cinematic",
    duration: "5-10 seconds",
    complexity: "Medium",
    elements: {
      weather_effects: false,
      dynamic_lighting: true,
      camera_movement: true,
    },
    // Section toggles - all disabled by default for simplicity
    enable_shot_details: false,
    enable_scene_details: false,
    enable_advanced_details: false,
    // Optional detailed configurations (default values when enabled)
    shot: {
      composition: "Medium shot",
      camera_motion: "handheld",
      frame_rate: "24 fps",
      film_grain: false,
    },
    subject: {
      include_description: true,
      include_wardrobe: false,
    },
    scene: {
      include_location: true,
      include_time_of_day: true,
      include_environment: true,
    },
    visual_details: {
      include_action: true,
      include_props: false,
    },
    cinematography: {
      include_lighting: true,
      include_tone: true,
    },
    audio: {
      include_ambient: false,
      include_dialogue: false,
    },
    color_palette: false,
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <PromptConfig
              config={config}
              onConfigChange={setConfig}
              onGenerate={setGeneratedPrompt}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </div>
          
          <div className="lg:col-span-2">
            <PromptOutput
              config={config}
              prompt={generatedPrompt}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        <div className="mt-8">
          <TemplateLibrary onTemplateSelect={setConfig} />
        </div>
      </main>
    </div>
  );
}
