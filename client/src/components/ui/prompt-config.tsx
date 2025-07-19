import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./button";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Checkbox } from "./checkbox";
import { Slider } from "./slider";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Wand2, Shuffle, FileDown, Save, Video, Camera, Users, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PromptConfig as PromptConfigType } from "@shared/schema";

interface PromptConfigProps {
  config: PromptConfigType;
  onConfigChange: (config: PromptConfigType) => void;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

const CATEGORIES = [
  "Sports & Athletics",
  "Urban & Street", 
  "Nature & Wildlife",
  "Vehicle Action",
  "Human Drama",
  "Adventure & Extreme",
];

const STYLES = ["Cinematic", "Documentary", "Commercial", "Artistic"];
const DURATIONS = ["3-5 seconds", "5-10 seconds", "10-15 seconds", "15-30 seconds"];
const COMPLEXITIES = ["Simple", "Medium", "Complex"];

const COMPOSITIONS = ["Close-up", "Medium shot", "Medium-full shot", "Full shot", "Wide shot", "Extreme wide shot"];
const CAMERA_MOTIONS = ["static", "handheld", "dolly", "tracking", "crane", "steadicam"];
const FRAME_RATES = ["24 fps", "30 fps", "60 fps", "120 fps (slow motion)"];

export default function PromptConfig({
  config,
  onConfigChange,
  onGenerate,
  isGenerating,
  setIsGenerating,
}: PromptConfigProps) {
  const { toast } = useToast();
  const [complexityValue, setComplexityValue] = useState(() => {
    const index = COMPLEXITIES.indexOf(config.complexity);
    return [index + 1];
  });

  const generateMutation = useMutation({
    mutationFn: async (config: PromptConfigType) => {
      const response = await apiRequest("POST", "/api/prompts/generate", config);
      return await response.json();
    },
    onSuccess: (data) => {
      onGenerate(data.prompt);
      toast({
        title: "Success",
        description: "New prompt generated successfully!",
      });
      setIsGenerating(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    generateMutation.mutate(config);
  };

  const handleRandomizeAll = () => {
    const randomConfig: PromptConfigType = {
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      style: STYLES[Math.floor(Math.random() * STYLES.length)],
      duration: DURATIONS[Math.floor(Math.random() * DURATIONS.length)],
      complexity: COMPLEXITIES[Math.floor(Math.random() * COMPLEXITIES.length)],
      elements: {
        weather_effects: Math.random() > 0.5,
        dynamic_lighting: Math.random() > 0.3,
        camera_movement: Math.random() > 0.2,
      },
    };
    onConfigChange(randomConfig);
    
    // Update complexity slider
    const complexityIndex = COMPLEXITIES.indexOf(randomConfig.complexity);
    setComplexityValue([complexityIndex + 1]);
    
    toast({
      title: "Randomized",
      description: "All settings have been randomized!",
    });
  };

  const handleComplexityChange = (value: number[]) => {
    setComplexityValue(value);
    const complexity = COMPLEXITIES[value[0] - 1];
    onConfigChange({ ...config, complexity });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Prompt Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic"><Video className="w-4 h-4 mr-1" />Basic</TabsTrigger>
              <TabsTrigger value="shot"><Camera className="w-4 h-4 mr-1" />Shot</TabsTrigger>
              <TabsTrigger value="scene"><Users className="w-4 h-4 mr-1" />Scene</TabsTrigger>
              <TabsTrigger value="advanced"><Palette className="w-4 h-4 mr-1" />Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
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

              {/* Visual Style */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Visual Style
                </Label>
                <div className="grid grid-cols-2 gap-2">
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
            </TabsContent>

            <TabsContent value="shot" className="space-y-4">
              {/* Shot Composition */}
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
                    {COMPOSITIONS.map((composition) => (
                      <SelectItem key={composition} value={composition}>
                        {composition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Camera Motion */}
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

              {/* Frame Rate */}
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

              {/* Film Grain */}
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
            </TabsContent>

            <TabsContent value="scene" className="space-y-4">
              {/* Subject Details */}
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
                      Include Character Description
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
                      Include Wardrobe Details
                    </Label>
                  </div>
                </div>
              </div>

              {/* Scene Details */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Scene Elements
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
                      Include Location Details
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sceneTimeOfDay"
                      checked={config.scene?.include_time_of_day}
                      onCheckedChange={(checked) =>
                        onConfigChange({
                          ...config,
                          scene: { ...config.scene!, include_time_of_day: !!checked }
                        })
                      }
                    />
                    <Label htmlFor="sceneTimeOfDay" className="text-sm text-slate-700">
                      Include Time of Day
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
                      Include Environment Details
                    </Label>
                  </div>
                </div>
              </div>

              {/* Visual Details */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Visual Details
                </Label>
                <div className="space-y-2">
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
                      Include Action Details
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
                      Include Props Details
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              {/* Cinematography */}
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
                      Include Lighting Setup
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
                      Include Tone Description
                    </Label>
                  </div>
                </div>
              </div>

              {/* Audio */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Audio Elements
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
                      Include Ambient Sound
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
                      Include Dialogue Elements
                    </Label>
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="colorPalette"
                  checked={config.color_palette}
                  onCheckedChange={(checked) =>
                    onConfigChange({
                      ...config,
                      color_palette: !!checked
                    })
                  }
                />
                <Label htmlFor="colorPalette" className="text-sm text-slate-700">
                  Include Color Palette Details
                </Label>
              </div>

              {/* Legacy Elements */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Effects
                </Label>
                <div className="space-y-2">
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
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Prompt"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleRandomizeAll}
              className="w-full justify-start"
            >
              <Shuffle className="w-4 h-4 mr-3 text-slate-500" />
              <span className="text-sm font-medium">Randomize All</span>
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileDown className="w-4 h-4 mr-3 text-slate-500" />
              <span className="text-sm font-medium">Load Template</span>
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Save className="w-4 h-4 mr-3 text-slate-500" />
              <span className="text-sm font-medium">Save as Template</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
