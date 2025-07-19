import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPromptSchema, promptConfigSchema, type PromptConfig } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate a new prompt based on configuration
  app.post("/api/prompts/generate", async (req, res) => {
    try {
      const config = promptConfigSchema.parse(req.body);
      const generatedPrompt = await generatePromptFromConfig(config);
      
      const promptData = {
        prompt: generatedPrompt,
        category: config.category,
        style: config.style,
        duration: config.duration,
        complexity: config.complexity,
        elements: config.elements,
        metadata: {
          generated_at: new Date().toISOString(),
          version: "1.0.0",
          template_id: undefined,
        },
      };

      const prompt = await storage.createPrompt(promptData);
      res.json(prompt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid configuration", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to generate prompt" });
      }
    }
  });

  // Generate prompt variations
  app.post("/api/prompts/variations", async (req, res) => {
    try {
      const config = promptConfigSchema.parse(req.body);
      const variations = await generatePromptVariations(config, 3);
      res.json({ variations });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid configuration", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to generate variations" });
      }
    }
  });

  // Get all prompts
  app.get("/api/prompts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const prompts = await storage.getPrompts(limit);
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const templates = await storage.getTemplates(category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Search templates
  app.get("/api/templates/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const templates = await storage.searchTemplates(query);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to search templates" });
    }
  });

  // Use a template (increment usage count)
  app.post("/api/templates/:id/use", async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getTemplateById(templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      await storage.updateTemplateUsage(templateId);
      res.json({ message: "Template usage updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update template usage" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate comprehensive JSON prompt based on configuration
async function generatePromptFromConfig(config: PromptConfig): Promise<string> {
  const templates = getPromptTemplates();
  const categoryTemplates = templates[config.category] || templates["Sports & Athletics"];
  const baseTemplate = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  
  // Generate comprehensive JSON structure
  const jsonPrompt: any = {
    shot: {
      composition: config.shot?.composition || "Medium shot",
      camera_motion: config.shot?.camera_motion || "handheld",
      frame_rate: config.shot?.frame_rate || "24 fps",
      ...(config.shot?.film_grain && { film_grain: "fine Kodak grain overlay" })
    }
  };

  // Add subject details if enabled
  if (config.subject?.include_description || config.subject?.include_wardrobe) {
    jsonPrompt.subject = {};
    if (config.subject.include_description) {
      jsonPrompt.subject.description = generateSubjectDescription(config.category);
    }
    if (config.subject.include_wardrobe) {
      jsonPrompt.subject.wardrobe = generateWardrobeDescription(config.category);
    }
  }

  // Add scene details if enabled
  if (config.scene?.include_location || config.scene?.include_time_of_day || config.scene?.include_environment) {
    jsonPrompt.scene = {};
    if (config.scene.include_location) {
      jsonPrompt.scene.location = generateLocationDescription(config.category);
    }
    if (config.scene.include_time_of_day) {
      jsonPrompt.scene.time_of_day = getRandomTimeOfDay();
    }
    if (config.scene.include_environment) {
      jsonPrompt.scene.environment = generateEnvironmentDescription(config.category);
    }
  }

  // Add visual details if enabled
  if (config.visual_details?.include_action || config.visual_details?.include_props) {
    jsonPrompt.visual_details = {};
    if (config.visual_details.include_action) {
      jsonPrompt.visual_details.action = baseTemplate.action || generateActionDescription(config.category);
    }
    if (config.visual_details.include_props) {
      jsonPrompt.visual_details.props = generatePropsDescription(config.category);
    }
  }

  // Add cinematography if enabled
  if (config.cinematography?.include_lighting || config.cinematography?.include_tone) {
    jsonPrompt.cinematography = {};
    if (config.cinematography.include_lighting) {
      jsonPrompt.cinematography.lighting = generateLightingDescription(config.style);
    }
    if (config.cinematography.include_tone) {
      jsonPrompt.cinematography.tone = generateToneDescription(config.style);
    }
  }

  // Add audio if enabled
  if (config.audio?.include_ambient || config.audio?.include_dialogue) {
    jsonPrompt.audio = {};
    if (config.audio.include_ambient) {
      jsonPrompt.audio.ambient = generateAmbientDescription(config.category);
    }
    if (config.audio.include_dialogue) {
      jsonPrompt.audio.dialogue = {
        style: "natural conversation",
        voice: "documentary style (warm, measured, authoritative)",
        duration: parseInt(config.duration.split('-')[0]) || 5
      };
    }
  }

  // Add color palette if enabled
  if (config.color_palette) {
    jsonPrompt.color_palette = generateColorPalette(config.style);
  }

  // Add settings
  jsonPrompt.settings = {
    background_music: false,
    transitions: "none",
    loop: false
  };

  // Add legacy effects to cinematography
  const effects = [];
  if (config.elements.weather_effects) {
    effects.push("dynamic weather effects");
  }
  if (config.elements.dynamic_lighting) {
    effects.push("dramatic lighting changes");
  }
  if (config.elements.camera_movement) {
    effects.push("fluid camera movement");
  }
  
  if (effects.length > 0 && jsonPrompt.cinematography) {
    jsonPrompt.cinematography.effects = effects.join(", ");
  } else if (effects.length > 0) {
    jsonPrompt.cinematography = { effects: effects.join(", ") };
  }

  return JSON.stringify(jsonPrompt, null, 2);
}

// Helper function to generate prompt variations
async function generatePromptVariations(config: PromptConfig, count: number): Promise<string[]> {
  const variations = [];
  
  for (let i = 0; i < count; i++) {
    // Create slight variations in the config
    const variantConfig = {
      ...config,
      complexity: getRandomComplexity(),
    };
    
    const variation = await generatePromptFromConfig(variantConfig);
    variations.push(variation);
  }
  
  return variations;
}

function getRandomComplexity(): string {
  const complexities = ["Simple", "Medium", "Complex"];
  return complexities[Math.floor(Math.random() * complexities.length)];
}

// Helper functions for generating different content categories
function generateSubjectDescription(category: string): string {
  const subjects = {
    "Sports & Athletics": [
      "Professional athlete in peak physical condition, mid-30s with athletic build and focused intensity",
      "Young competitor with determined expression, wearing team colors and protective gear",
      "Experienced sports figure with weathered features showing years of dedication"
    ],
    "Urban & Street": [
      "Urban artist in streetwear, confident posture with creative energy",
      "City dweller navigating metropolitan environment with purposeful movement",
      "Street performer with expressive features and dynamic presence"
    ],
    "Nature & Wildlife": [
      "Wildlife subject in natural habitat, displaying raw power and instinctive behavior",
      "Natural phenomenon showcasing the beauty and force of the elements",
      "Outdoor enthusiast adapted to wilderness environment"
    ],
    "Human Drama": [
      "Individual with expressive features conveying deep emotion and authenticity",
      "Character in moment of personal revelation, showing vulnerability and strength",
      "Person engaged in meaningful activity with passionate dedication"
    ],
    "Vehicle Action": [
      "Skilled driver with focused concentration and professional technique",
      "Racing enthusiast displaying precision and control under pressure",
      "Vehicle operator demonstrating mastery of complex machinery"
    ],
    "Adventure & Extreme": [
      "Extreme sports athlete with fearless expression and specialized equipment",
      "Adventure seeker pushing physical and mental boundaries",
      "Outdoor specialist with weather-worn features and expert technique"
    ]
  };
  const categorySubjects = subjects[category] || subjects["Sports & Athletics"];
  return categorySubjects[Math.floor(Math.random() * categorySubjects.length)];
}

function generateWardrobeDescription(category: string): string {
  const wardrobe = {
    "Sports & Athletics": [
      "Professional team jersey, athletic shorts, high-performance cleats",
      "Racing suit with sponsor logos, protective helmet, specialized footwear",
      "Training gear with moisture-wicking fabric, compression elements"
    ],
    "Urban & Street": [
      "Streetwear ensemble with designer sneakers, graphic elements",
      "Urban casual with layered textures, contemporary accessories",
      "Hip-hop inspired outfit with bold colors and statement pieces"
    ],
    "Nature & Wildlife": [
      "Outdoor expedition gear with weather-resistant materials",
      "Field researcher attire with practical pockets and earth tones",
      "Safari-style clothing with sun protection and utility features"
    ],
    "Human Drama": [
      "Business professional attire reflecting character's occupation",
      "Casual everyday clothing with personal style elements",
      "Formal wear appropriate to dramatic scene context"
    ],
    "Vehicle Action": [
      "Racing suit with flame-resistant materials, sponsor patches",
      "Mechanic coveralls with tool accessories, safety equipment",
      "Driving gloves, protective helmet, professional motorsport attire"
    ],
    "Adventure & Extreme": [
      "Technical outdoor gear with safety equipment and weatherproofing",
      "Extreme sports attire with protective padding and specialized accessories",
      "Adventure clothing with quick-dry materials and multiple pockets"
    ]
  };
  const categoryWardrobe = wardrobe[category] || wardrobe["Sports & Athletics"];
  return categoryWardrobe[Math.floor(Math.random() * categoryWardrobe.length)];
}

function generateLocationDescription(category: string): string {
  const locations = {
    "Sports & Athletics": [
      "Professional stadium with packed stands and field lighting",
      "Training facility with modern equipment and clean lines",
      "Outdoor sports complex with natural grass and scenic backdrop"
    ],
    "Urban & Street": [
      "Downtown cityscape with towering buildings and neon signs",
      "Street-level urban environment with graffiti and concrete textures",
      "Rooftop location overlooking metropolitan skyline"
    ],
    "Nature & Wildlife": [
      "Pristine wilderness with untouched natural beauty",
      "National park setting with diverse ecosystem elements",
      "Remote outdoor location far from civilization"
    ],
    "Human Drama": [
      "Interior domestic space with warm lighting and personal touches",
      "Professional workplace environment with contemporary design",
      "Public space where human stories naturally unfold"
    ],
    "Vehicle Action": [
      "Professional racing track with safety barriers and timing equipment",
      "Winding mountain road with challenging curves and elevation",
      "Urban street circuit with city backdrop and tight corners"
    ],
    "Adventure & Extreme": [
      "Remote mountain location with dramatic elevation and exposure",
      "Extreme sports venue with specialized safety equipment",
      "Wilderness setting that challenges human limits and abilities"
    ]
  };
  const categoryLocations = locations[category] || locations["Sports & Athletics"];
  return categoryLocations[Math.floor(Math.random() * categoryLocations.length)];
}

function getRandomTimeOfDay(): string {
  const times = ["dawn", "early morning", "mid-morning", "noon", "afternoon", "golden hour", "dusk", "evening", "night", "late night"];
  return times[Math.floor(Math.random() * times.length)];
}

function generateEnvironmentDescription(category: string): string {
  const environments = {
    "Sports & Athletics": [
      "High-energy atmosphere with crowd noise and competitive tension",
      "Professional setting with pristine conditions and optimal lighting",
      "Training environment with focused intensity and athletic equipment"
    ],
    "Urban & Street": [
      "Urban energy with city sounds, traffic, and metropolitan atmosphere",
      "Street culture environment with music, art, and community presence",
      "Contemporary city setting with modern architecture and urban design"
    ],
    "Nature & Wildlife": [
      "Natural soundscape with wind, water, and wildlife ambiance",
      "Pristine environment showcasing untouched natural beauty",
      "Ecosystem in balance with seasonal changes and natural rhythms"
    ],
    "Human Drama": [
      "Intimate setting that supports emotional storytelling",
      "Environment that reflects character's internal state",
      "Space designed for human connection and meaningful interaction"
    ],
    "Vehicle Action": [
      "High-speed environment with engine sounds and mechanical precision",
      "Racing atmosphere with competitive energy and technical focus",
      "Automotive setting showcasing speed, power, and control"
    ],
    "Adventure & Extreme": [
      "Challenging environment that tests human limits and courage",
      "Natural setting with elements of danger and excitement",
      "Extreme conditions requiring specialized skills and equipment"
    ]
  };
  const categoryEnvironments = environments[category] || environments["Sports & Athletics"];
  return categoryEnvironments[Math.floor(Math.random() * categoryEnvironments.length)];
}

function generateActionDescription(category: string): string {
  const actions = {
    "Sports & Athletics": [
      "Executes perfect technique with athletic precision and competitive intensity",
      "Demonstrates peak physical performance in crucial competitive moment",
      "Shows athletic mastery through fluid movement and strategic thinking"
    ],
    "Urban & Street": [
      "Moves through urban environment with street-smart confidence",
      "Navigates city obstacles with creative problem-solving and style",
      "Expresses urban culture through movement and artistic expression"
    ],
    "Nature & Wildlife": [
      "Displays natural instincts and survival behaviors in wild habitat",
      "Demonstrates adaptation to natural environment and seasonal changes",
      "Shows harmony between creature and pristine natural setting"
    ],
    "Human Drama": [
      "Reveals deep emotion through authentic facial expression and body language",
      "Communicates complex feelings through subtle gestural storytelling",
      "Displays human vulnerability and strength in meaningful moment"
    ],
    "Vehicle Action": [
      "Demonstrates expert vehicle control through technical driving skill",
      "Shows precision and timing in high-speed competitive situation",
      "Executes complex maneuver with mechanical understanding and experience"
    ],
    "Adventure & Extreme": [
      "Pushes physical and mental boundaries in challenging extreme situation",
      "Shows courage and skill in face of natural dangers and obstacles",
      "Demonstrates specialized technique required for extreme sports mastery"
    ]
  };
  const categoryActions = actions[category] || actions["Sports & Athletics"];
  return categoryActions[Math.floor(Math.random() * categoryActions.length)];
}

function generatePropsDescription(category: string): string {
  const props = {
    "Sports & Athletics": [
      "Professional sports equipment, team banners, scoreboards",
      "Training apparatus, coaching tools, athletic accessories",
      "Competition markers, timing equipment, safety gear"
    ],
    "Urban & Street": [
      "Street art supplies, urban furniture, city infrastructure",
      "Performance props, music equipment, cultural artifacts",
      "Transportation elements, architectural features, signage"
    ],
    "Nature & Wildlife": [
      "Natural elements like rocks, branches, water features",
      "Scientific equipment for field research and observation",
      "Camping gear, hiking equipment, outdoor survival tools"
    ],
    "Human Drama": [
      "Personal belongings that tell character's story",
      "Work-related tools and professional equipment",
      "Domestic items that create intimate atmosphere"
    ],
    "Vehicle Action": [
      "Racing equipment, tools, mechanical parts",
      "Track safety gear, timing devices, communication equipment",
      "Vehicle modifications, performance indicators, technical instruments"
    ],
    "Adventure & Extreme": [
      "Specialized safety equipment, climbing gear, protective elements",
      "Adventure tools, navigation equipment, emergency supplies",
      "Extreme sports apparatus, weather monitoring devices"
    ]
  };
  const categoryProps = props[category] || props["Sports & Athletics"];
  return categoryProps[Math.floor(Math.random() * categoryProps.length)];
}

function generateLightingDescription(style: string): string {
  const lighting = {
    "Cinematic": [
      "Dramatic three-point lighting with deep shadows and strong contrast",
      "Golden hour natural lighting with warm practical sources",
      "Professional film lighting with controlled shadows and highlights"
    ],
    "Documentary": [
      "Available light with minimal artificial enhancement for authenticity",
      "Natural lighting that preserves realistic atmosphere",
      "Documentary-style lighting that supports truth and realism"
    ],
    "Commercial": [
      "Polished professional lighting with even coverage and product focus",
      "High-key lighting setup for commercial appeal and clarity",
      "Studio-quality lighting with perfect exposure and color balance"
    ],
    "Artistic": [
      "Creative lighting design with experimental shadows and color temperature",
      "Artistic illumination that supports visual storytelling and mood",
      "Innovative lighting approach with unique angles and creative techniques"
    ]
  };
  const styleLighting = lighting[style] || lighting["Cinematic"];
  return styleLighting[Math.floor(Math.random() * styleLighting.length)];
}

function generateToneDescription(style: string): string {
  const tones = {
    "Cinematic": ["dramatic and immersive", "epic and heroic", "intimate and emotional"],
    "Documentary": ["authentic and truthful", "observational and respectful", "educational and informative"],
    "Commercial": ["polished and appealing", "energetic and engaging", "professional and trustworthy"],
    "Artistic": ["creative and expressive", "experimental and unique", "visually striking and memorable"]
  };
  const styleTones = tones[style] || tones["Cinematic"];
  return styleTones[Math.floor(Math.random() * styleTones.length)];
}

function generateAmbientDescription(category: string): string {
  const ambient = {
    "Sports & Athletics": [
      "Stadium crowd noise, whistle sounds, equipment impacts",
      "Training facility acoustics with echo and equipment noise",
      "Outdoor sports sounds with natural environment audio"
    ],
    "Urban & Street": [
      "City traffic, street music, urban construction sounds",
      "Metropolitan ambiance with sirens and crowd noise",
      "Street culture audio with music and conversation"
    ],
    "Nature & Wildlife": [
      "Natural soundscape with wind, water, and animal calls",
      "Wilderness audio with rustling leaves and distant sounds",
      "Ecosystem sounds reflecting natural harmony and seasonal changes"
    ],
    "Human Drama": [
      "Interior acoustics with room tone and household sounds",
      "Workplace ambiance with office equipment and conversation",
      "Domestic environment with familiar everyday audio"
    ],
    "Vehicle Action": [
      "Engine sounds, tire noise, mechanical audio elements",
      "Racing environment with crowd noise and competition audio",
      "Automotive sounds reflecting speed and mechanical precision"
    ],
    "Adventure & Extreme": [
      "Outdoor adventure sounds with wind and natural elements",
      "Extreme sports audio with equipment and environmental noise",
      "Wilderness sounds reflecting challenge and excitement"
    ]
  };
  const categoryAmbient = ambient[category] || ambient["Sports & Athletics"];
  return categoryAmbient[Math.floor(Math.random() * categoryAmbient.length)];
}

function generateColorPalette(style: string): string {
  const palettes = {
    "Cinematic": [
      "Warm amber and deep blue contrast with rich shadows",
      "Desaturated earth tones with selective color highlights",
      "High contrast black and white with selective golden accents"
    ],
    "Documentary": [
      "Natural color palette preserving authentic environmental tones",
      "Realistic color grading with minimal saturation enhancement",
      "True-to-life colors that support documentary authenticity"
    ],
    "Commercial": [
      "Bright, saturated colors with high energy and appeal",
      "Clean color palette with strong brand-friendly tones",
      "Polished color grading with commercial shine and clarity"
    ],
    "Artistic": [
      "Experimental color treatment with creative artistic vision",
      "Unique color combinations that support visual storytelling",
      "Creative color grading with artistic flair and innovation"
    ]
  };
  const stylePalettes = palettes[style] || palettes["Cinematic"];
  return stylePalettes[Math.floor(Math.random() * stylePalettes.length)];
}

function getPromptTemplates(): Record<string, any[]> {
  return {
    "Sports & Athletics": [
      { action: "performs spectacular diving catch during crucial game moment" },
      { action: "sprints across field under stadium lights, dodging defenders" },
      { action: "executes perfect bicycle kick in slow motion" },
      { action: "leaps for slam dunk with dramatic lighting" }
    ],
    "Urban & Street": [
      { action: "leaps between rooftops in urban cityscape at golden hour" },
      { action: "weaves through busy downtown traffic in high-speed chase" },
      { action: "performs complex dance moves on graffiti-covered wall" },
      { action: "launches off ramp in underground parking garage" }
    ],
    "Nature & Wildlife": [
      { action: "soars through mountain valley with wings spread wide" },
      { action: "crashes against rocky cliffs in slow motion during sunset" },
      { action: "sprints across African savanna in pursuit of prey" },
      { action: "moves through snow-covered forest during twilight" }
    ],
    "Vehicle Action": [
      { action: "drifts around mountain curve at high speed" },
      { action: "leans into tight corner on professional track" },
      { action: "launches over sand dune in desert" },
      { action: "accelerates down empty highway at sunset" }
    ],
    "Human Drama": [
      { action: "moves hands across piano keys during emotional performance" },
      { action: "works intensively in busy kitchen with flames leaping" },
      { action: "inspires students with passionate gesturing" },
      { action: "embraces child after long separation" }
    ],
    "Adventure & Extreme": [
      { action: "scales sheer cliff face during golden hour" },
      { action: "freefalls through clouds with arms spread wide" },
      { action: "rides massive wave with perfect balance" },
      { action: "navigates treacherous trail, launching off jumps" }
    ]
  };
}
