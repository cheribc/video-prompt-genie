import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Zap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PromptConfig } from "@shared/schema";

interface PromptConfigProps {
  config: PromptConfig;
  onConfigChange: (config: PromptConfig) => void;
  onGenerate: (promptData: any) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const CATEGORIES = [
  "Sports & Athletics",
  "Action & Adventure", 
  "Drama & Emotion",
  "Comedy & Entertainment",
  "Horror & Thriller",
  "Romance & Relationships",
  "Science Fiction",
  "Documentary Style",
  "Fantasy & Magic",
  "Music & Dance",
  "Food & Cooking",
  "Travel & Nature",
  "Technology",
  "Fashion & Beauty",
  "Business & Professional"
];

const STYLES = [
  "Cinematic",
  "Documentary", 
  "Artistic",
  "Commercial",
  "Vintage",
  "Modern",
  "Noir",
  "Colorful"
];

const DURATIONS = [
  "1-3 seconds",
  "3-5 seconds", 
  "5-10 seconds",
  "10-15 seconds",
  "15-30 seconds"
];

const SHOT_COMPOSITIONS = [
  "Extreme close-up",
  "Close-up", 
  "Medium close-up",
  "Medium shot",
  "Medium-wide shot", 
  "Wide shot",
  "Long shot"
];

const CAMERA_MOTIONS = [
  "static",
  "handheld",
  "smooth tracking", 
  "crane movement",
  "dolly zoom",
  "pan and tilt",
  "steadicam"
];

const FRAME_RATES = [
  "24 fps",
  "30 fps",
  "60 fps", 
  "120 fps (slow motion)"
];

export default function PromptConfig({ config, onConfigChange, onGenerate, isGenerating, setIsGenerating }: PromptConfigProps) {
  const { toast } = useToast();
  
  const generateMutation = useMutation({
    mutationFn: async (promptConfig: PromptConfig) => {
      const response = await apiRequest("POST", "/api/prompts/generate", promptConfig);
      return await response.json();
    },
    onSuccess: (data) => {
      onGenerate(data);
      setIsGenerating(false);
      toast({
        title: "Prompt generated successfully!",
        description: "Your AI video prompt is ready to use.",
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Generation failed",
        description: "There was an error generating your prompt. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    generateMutation.mutate(config);
  };

  const complexityValue = config.complexity === "Simple" ? [1] : 
                         config.complexity === "Medium" ? [2] : [3];

  const handleComplexityChange = (value: number[]) => {
    const complexity = value[0] === 1 ? "Simple" : 
                      value[0] === 2 ? "Medium" : "Complex";
    onConfigChange({ ...config, complexity });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Prompt Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-2 gap-4">
            {/* Action Category */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Action Category
              </Label>
              <Select
                value={config.category}
                onValueChange={(value) =>
                  onConfigChange({ ...config, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Duration
              </Label>
              <Select
                value={config.duration}
                onValueChange={(value) =>
                  onConfigChange({ ...config, duration: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visual Style */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Visual Style
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {STYLES.map((style) => (
                <Button
                  key={style}
                  variant={config.style === style ? "default" : "outline"}
                  size="sm"
                  onClick={() => onConfigChange({ ...config, style })}
                  className="text-sm"
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Complexity Level
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <Slider
                  value={complexityValue}
                  onValueChange={handleComplexityChange}
                  max={3}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-slate-600 w-12 text-right">
                  {config.complexity}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Simple</span>
                <span>Complex</span>
              </div>
            </div>
          </div>

          {/* Basic Effects */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Effects
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weather"
                  checked={config.elements.weather_effects}
                  onCheckedChange={(checked) =>
                    onConfigChange({
                      ...config,
                      elements: {
                        ...config.elements,
                        weather_effects: !!checked,
                      },
                    })
                  }
                />
                <Label htmlFor="weather" className="text-sm text-slate-700">
                  Weather Effects
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lighting"
                  checked={config.elements.dynamic_lighting}
                  onCheckedChange={(checked) =>
                    onConfigChange({
                      ...config,
                      elements: {
                        ...config.elements,
                        dynamic_lighting: !!checked,
                      },
                    })
                  }
                />
                <Label htmlFor="lighting" className="text-sm text-slate-700">
                  Dynamic Lighting
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="camera"
                  checked={config.elements.camera_movement}
                  onCheckedChange={(checked) =>
                    onConfigChange({
                      ...config,
                      elements: {
                        ...config.elements,
                        camera_movement: !!checked,
                      },
                    })
                  }
                />
                <Label htmlFor="camera" className="text-sm text-slate-700">
                  Camera Movement
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Optional Configuration Sections */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Optional Details (Enable to add more specificity)
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableShot"
                  checked={config.enable_shot_details}
                  onCheckedChange={(checked) =>
                    onConfigChange({
                      ...config,
                      enable_shot_details: !!checked,
                    })
                  }
                />
                <Label htmlFor="enableShot" className="text-sm text-slate-700">
                  Shot Details
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableScene"
                  checked={config.enable_scene_details}
                  onCheckedChange={(checked) =>
                    onConfigChange({
                      ...config,
                      enable_scene_details: !!checked,
                    })
                  }
                />
                <Label htmlFor="enableScene" className="text-sm text-slate-700">
                  Scene Details
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableAdvanced"
                  checked={config.enable_advanced_details}
                  onCheckedChange={(checked) =>
                    onConfigChange({
                      ...config,
                      enable_advanced_details: !!checked,
                    })
                  }
                />
                <Label htmlFor="enableAdvanced" className="text-sm text-slate-700">
                  Advanced Details
                </Label>
              </div>
            </div>
          </div>

          {/* Shot Details Section */}
          {config.enable_shot_details && (
            <div className="space-y-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">Shot Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Shot Composition
                  </Label>
                  <Select
                    value={config.shot?.composition}
                    onValueChange={(value) =>
                      onConfigChange({
                        ...config,
                        shot: { ...config.shot!, composition: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHOT_COMPOSITIONS.map((composition) => (
                        <SelectItem key={composition} value={composition}>
                          {composition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Camera Motion
                  </Label>
                  <Select
                    value={config.shot?.camera_motion}
                    onValueChange={(value) =>
                      onConfigChange({
                        ...config,
                        shot: { ...config.shot!, camera_motion: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMERA_MOTIONS.map((motion) => (
                        <SelectItem key={motion} value={motion}>
                          {motion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Frame Rate
                  </Label>
                  <Select
                    value={config.shot?.frame_rate}
                    onValueChange={(value) =>
                      onConfigChange({
                        ...config,
                        shot: { ...config.shot!, frame_rate: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FRAME_RATES.map((rate) => (
                        <SelectItem key={rate} value={rate}>
                          {rate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filmGrain"
                    checked={config.shot?.film_grain}
                    onCheckedChange={(checked) =>
                      onConfigChange({
                        ...config,
                        shot: { ...config.shot!, film_grain: !!checked }
                      })
                    }
                  />
                  <Label htmlFor="filmGrain" className="text-sm text-slate-700">
                    Film Grain Effect
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Scene Details Section */}
          {config.enable_scene_details && (
            <div className="space-y-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">Scene Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Subject Details
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="subjectDescription"
                        checked={config.subject?.include_description}
                        onCheckedChange={(checked) =>
                          onConfigChange({
                            ...config,
                            subject: { ...config.subject!, include_description: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="subjectDescription" className="text-sm text-slate-700">
                        Character Description
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="subjectWardrobe"
                        checked={config.subject?.include_wardrobe}
                        onCheckedChange={(checked) =>
                          onConfigChange({
                            ...config,
                            subject: { ...config.subject!, include_wardrobe: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="subjectWardrobe" className="text-sm text-slate-700">
                        Wardrobe Details
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Environment
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sceneLocation"
                        checked={config.scene?.include_location}
                        onCheckedChange={(checked) =>
                          onConfigChange({
                            ...config,
                            scene: { ...config.scene!, include_location: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="sceneLocation" className="text-sm text-slate-700">
                        Location Details
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sceneTime"
                        checked={config.scene?.include_time_of_day}
                        onCheckedChange={(checked) =>
                          onConfigChange({
                            ...config,
                            scene: { ...config.scene!, include_time_of_day: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="sceneTime" className="text-sm text-slate-700">
                        Time of Day
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sceneEnvironment"
                        checked={config.scene?.include_environment}
                        onCheckedChange={(checked) =>
                          onConfigChange({
                            ...config,
                            scene: { ...config.scene!, include_environment: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="sceneEnvironment" className="text-sm text-slate-700">
                        Environment Mood
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Visual Details
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visualAction"
                      checked={config.visual_details?.include_action}
                      onCheckedChange={(checked) =>
                        onConfigChange({
                          ...config,
                          visual_details: { ...config.visual_details!, include_action: !!checked }
                        })
                      }
                    />
                    <Label htmlFor="visualAction" className="text-sm text-slate-700">
                      Action Details
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="visualProps"
                      checked={config.visual_details?.include_props}
                      onCheckedChange={(checked) =>
                        onConfigChange({
                          ...config,
                          visual_details: { ...config.visual_details!, include_props: !!checked }
                        })
                      }
                    />
                    <Label htmlFor="visualProps" className="text-sm text-slate-700">
                      Props Details
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Details Section */}
          {config.enable_advanced_details && (
            <div className="space-y-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">Advanced Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Cinematography
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cinematographyLighting"
                        checked={config.cinematography?.include_lighting}
                        onCheckedChange={(checked) =>
                          onConfigChange({
                            ...config,
                            cinematography: { ...config.cinematography!, include_lighting: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="cinematographyLighting" className="text-sm text-slate-700">
                        Lighting Setup
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cinematographyTone"
                        checked={config.cinematography?.include_tone}
                        onCheckedChange={(checked) =>
                          onConfigChange({
                            ...config,
                            cinematography: { ...config.cinematography!, include_tone: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="cinematographyTone" className="text-sm text-slate-700">
                        Tone Description
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Audio & Color
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="audioAmbient"
                        checked={config.audio?.include_ambient}
                        onCheckedChange={(checked) =>
                          onConfigChange({
                            ...config,
                            audio: { ...config.audio!, include_ambient: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="audioAmbient" className="text-sm text-slate-700">
                        Ambient Sound
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="audioDialogue"
                        checked={config.audio?.include_dialogue}
                        onCheckedChange={(checked) =>
                          onConfigChange({
                            ...config,
                            audio: { ...config.audio!, include_dialogue: !!checked }
                          })
                        }
                      />
                      <Label htmlFor="audioDialogue" className="text-sm text-slate-700">
                        Dialogue
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="colorPalette"
                        checked={config.color_palette}
                        onCheckedChange={(checked) =>
                          onConfigChange({
                            ...config,
                            color_palette: !!checked,
                          })
                        }
                      />
                      <Label htmlFor="colorPalette" className="text-sm text-slate-700">
                        Color Palette
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="pt-6 border-t border-slate-200">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Generate AI Video Prompt
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}