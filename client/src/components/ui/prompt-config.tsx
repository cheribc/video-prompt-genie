import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./button";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Checkbox } from "./checkbox";
import { Slider } from "./slider";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Wand2, Shuffle, FileDown, Save } from "lucide-react";
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
        <CardContent className="space-y-6">
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

          {/* Custom Elements */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Custom Elements
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

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Prompt"}
          </Button>
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
