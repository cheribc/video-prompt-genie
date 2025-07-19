import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Copy, Download, Code, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PromptConfig } from "@shared/schema";

interface PromptOutputProps {
  config: PromptConfig;
  prompt: any; // Full prompt object from API
  isGenerating: boolean;
}

export default function PromptOutput({
  config,
  prompt,
  isGenerating,
}: PromptOutputProps) {
  const { toast } = useToast();
  const [variations, setVariations] = useState<string[]>([]);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [expandedVariations, setExpandedVariations] = useState<Set<number>>(new Set());

  const variationsMutation = useMutation({
    mutationFn: async (config: PromptConfig) => {
      const response = await apiRequest("POST", "/api/prompts/variations", config);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return await response.json();
    },
    onSuccess: (data) => {
      if (data && data.variations) {
        setVariations(data.variations);
        setIsGeneratingVariations(false);
        toast({
          title: "Success",
          description: `Generated ${data.variations.length} variations`,
        });
      }
    },
    onError: (error: Error) => {
      console.error("Variations error:", error);
      toast({
        title: "Error", 
        description: `Failed to generate variations: ${error.message}`,
        variant: "destructive",
      });
      setIsGeneratingVariations(false);
    },
  });

  const handleCopyToClipboard = async () => {
    if (!prompt) return;
    
    const promptText = prompt.prompt || prompt;
    try {
      await navigator.clipboard.writeText(promptText);
      toast({
        title: "Success",
        description: "Prompt copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopyJSON = async () => {
    if (!prompt) return;
    
    try {
      const jsonData = formatJSON();
      await navigator.clipboard.writeText(jsonData);
      toast({
        title: "Success",
        description: "JSON copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy JSON to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopyVariation = async (variation: string) => {
    try {
      await navigator.clipboard.writeText(variation);
      toast({
        title: "Success",
        description: "Variation copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy variation.",
        variant: "destructive",
      });
    }
  };

  const handleCopyVariationJSON = async (variation: string) => {
    try {
      const jsonData = {
        category: config.category,
        style: config.style,
        duration: config.duration,
        complexity: config.complexity,
        shot: config.shot,
        cinematography: config.cinematography ? {
          lighting_enabled: config.cinematography.include_lighting,
          tone_enabled: config.cinematography.include_tone
        } : undefined,
        audio: config.audio ? {
          ambient_enabled: config.audio.include_ambient,
          dialogue_enabled: config.audio.include_dialogue
        } : undefined,
        effects: {
          weather_effects: config.elements.weather_effects,
          dynamic_lighting: config.elements.dynamic_lighting,
          camera_movement: config.elements.camera_movement
        }
      };

      // Remove undefined properties
      Object.keys(jsonData).forEach(key => {
        if (jsonData[key] === undefined) {
          delete jsonData[key];
        }
      });

      await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      toast({
        title: "Success",
        description: "Variation JSON copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy variation JSON.",
        variant: "destructive",
      });
    }
  };

  const formatVariationJSON = (variation: string) => {
    const jsonData = {
      category: config.category,
      style: config.style,
      duration: config.duration,
      complexity: config.complexity,
      shot: config.shot,
      cinematography: config.cinematography ? {
        lighting_enabled: config.cinematography.include_lighting,
        tone_enabled: config.cinematography.include_tone
      } : undefined,
      audio: config.audio ? {
        ambient_enabled: config.audio.include_ambient,
        dialogue_enabled: config.audio.include_dialogue
      } : undefined,
      effects: {
        weather_effects: config.elements.weather_effects,
        dynamic_lighting: config.elements.dynamic_lighting,
        camera_movement: config.elements.camera_movement
      }
    };

    // Remove undefined properties
    Object.keys(jsonData).forEach(key => {
      if (jsonData[key] === undefined) {
        delete jsonData[key];
      }
    });

    return JSON.stringify(jsonData, null, 2);
  };

  const toggleVariationExpanded = (index: number) => {
    const newExpanded = new Set(expandedVariations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedVariations(newExpanded);
  };

  const handleExportJSON = () => {
    if (!prompt) return;

    // Use the same parsing logic as formatJSON
    const jsonContent = formatJSON();
    
    const blob = new Blob([jsonContent], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `video-prompt-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "JSON exported successfully!",
    });
  };

  const handleGenerateVariations = () => {
    setIsGeneratingVariations(true);
    variationsMutation.mutate(config);
  };

  const formatJSON = () => {
    if (!prompt || !prompt.prompt) return "";

    // Parse the natural language prompt to extract components
    const promptText = prompt.prompt;
    const sentences = promptText.split('. ');
    
    // Try to identify subject description (usually the first long descriptive sentence)
    const subject = sentences[0] && sentences[0].includes(',') && sentences[0].length > 50 ? sentences[0] : null;
    
    // Try to identify action (usually comes after subject or is the first sentence if no subject)
    const actionIndex = subject ? 1 : 0;
    const action = sentences[actionIndex] && !sentences[actionIndex].includes('Shot with') && !sentences[actionIndex].includes('Enhanced with') && !sentences[actionIndex].includes('Captured with')
      ? sentences[actionIndex] 
      : null;

    const jsonData = {
      prompt: {
        subject: subject,
        action: action,
        full_text: promptText
      },
      configuration: {
        category: config.category,
        style: config.style,
        duration: config.duration,
        complexity: config.complexity,
        shot: config.shot,
        cinematography: config.cinematography ? {
          lighting_enabled: config.cinematography.include_lighting,
          tone_enabled: config.cinematography.include_tone
        } : undefined,
        audio: config.audio ? {
          ambient_enabled: config.audio.include_ambient,
          dialogue_enabled: config.audio.include_dialogue
        } : undefined,
        effects: {
          weather_effects: config.elements.weather_effects,
          dynamic_lighting: config.elements.dynamic_lighting,
          camera_movement: config.elements.camera_movement
        }
      },
      metadata: prompt.metadata
    };

    // Remove undefined properties from configuration
    Object.keys(jsonData.configuration).forEach(key => {
      if (jsonData.configuration[key] === undefined) {
        delete jsonData.configuration[key];
      }
    });

    return JSON.stringify(jsonData, null, 2);
  };

  return (
    <div className="space-y-6">
      {/* Generated Prompt Preview */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Generated Prompt</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-600">Generating prompt...</span>
              </div>
            ) : prompt ? (
              <pre className="text-sm text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
                {prompt.prompt || prompt}
              </pre>
            ) : (
              <p className="text-slate-500 text-center py-8">
                Click "Generate Prompt" to create your video prompt
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* JSON Output */}
      {prompt && (
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">JSON Format</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Valid JSON
                </Badge>
                <Button variant="outline" size="sm" onClick={handleCopyJSON}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-200 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono leading-relaxed">
                {formatJSON()}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt Variations */}
      {prompt && (
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Alternative Variations</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateVariations}
                disabled={isGeneratingVariations}
                className="text-primary hover:text-blue-700"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1 ${
                    isGeneratingVariations ? "animate-spin" : ""
                  }`}
                />
                Generate More
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isGeneratingVariations ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-600">Generating variations...</span>
              </div>
            ) : variations.length > 0 ? (
              <div className="space-y-3">
                {variations.map((variation, index) => (
                  <Collapsible key={index} open={expandedVariations.has(index)} onOpenChange={() => toggleVariationExpanded(index)}>
                    <div className="border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-slate-800 mb-2">{variation}</p>
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <Badge variant="secondary">{config.category.split(' ')[0]}</Badge>
                              <Badge variant="secondary">{config.duration}</Badge>
                              <Badge variant="secondary">{config.complexity}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyVariation(variation)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-slate-600"
                              >
                                <Code className="w-4 h-4" />
                                {expandedVariations.has(index) ? (
                                  <ChevronUp className="w-4 h-4 ml-1" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 ml-1" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="px-4 pb-4">
                          <div className="bg-slate-900 rounded-lg p-4 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-green-400 font-medium">JSON Format</span>
                              <Button
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCopyVariationJSON(variation)}
                                className="text-green-400 hover:text-green-300 text-xs h-6"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <pre className="text-xs text-green-400 font-mono leading-relaxed overflow-x-auto">
                              {formatVariationJSON(variation)}
                            </pre>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                Click "Generate More" to create prompt variations
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
