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

// Helper function to generate prompts based on configuration
async function generatePromptFromConfig(config: PromptConfig): Promise<string> {
  const prompts = getPromptTemplates();
  const categoryPrompts = prompts[config.category] || prompts["Sports & Athletics"];
  const basePrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
  
  let enhancedPrompt = basePrompt;
  
  // Add style-specific elements
  if (config.style === "Cinematic") {
    enhancedPrompt += " Shot with cinematic camera movement and dramatic lighting";
  } else if (config.style === "Documentary") {
    enhancedPrompt += " Captured with professional documentary-style cinematography";
  } else if (config.style === "Commercial") {
    enhancedPrompt += " Filmed with polished commercial production values";
  } else if (config.style === "Artistic") {
    enhancedPrompt += " Created with artistic vision and creative camera work";
  }
  
  // Add duration context
  if (config.duration === "3-5 seconds") {
    enhancedPrompt += " in a quick, impactful moment";
  } else if (config.duration === "5-10 seconds") {
    enhancedPrompt += " unfolding over several dramatic seconds";
  } else if (config.duration === "10-15 seconds") {
    enhancedPrompt += " developing through an extended sequence";
  } else if (config.duration === "15-30 seconds") {
    enhancedPrompt += " building through a complete narrative arc";
  }
  
  // Add complexity modifiers
  if (config.complexity === "Simple") {
    enhancedPrompt += ". Clean, focused composition";
  } else if (config.complexity === "Medium") {
    enhancedPrompt += ". Balanced composition with multiple elements";
  } else if (config.complexity === "Complex") {
    enhancedPrompt += ". Intricate composition with layered visual elements";
  }
  
  // Add element modifiers
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
  
  if (effects.length > 0) {
    enhancedPrompt += `. Features ${effects.join(", ")}`;
  }
  
  enhancedPrompt += ". Photorealistic quality with stunning detail.";
  
  return enhancedPrompt;
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

function getPromptTemplates(): Record<string, string[]> {
  return {
    "Sports & Athletics": [
      "A professional athlete in peak physical condition performs a spectacular diving catch during a crucial moment in the game. The scene unfolds in slow motion as the player launches through the air, muscles tensed and focused, reaching for a perfectly thrown ball against the backdrop of a packed stadium",
      "A young quarterback sprints across the field under stadium lights, dodging defenders in a high-stakes playoff game. The camera follows with dynamic tracking shots as cleats dig into the turf and jerseys flutter in motion",
      "A soccer player executes a perfect bicycle kick in slow motion, with the ball sailing through rain droplets toward the goal as the crowd erupts in anticipation",
      "A basketball player leaps for a slam dunk, captured from below with dramatic lighting that highlights the determination in their expression and the power of their movement"
    ],
    "Urban & Street": [
      "A parkour athlete leaps between rooftops in an urban cityscape at golden hour, with the city skyline creating a dramatic backdrop for their fluid movements",
      "A motorcycle courier weaves through busy downtown traffic in a high-speed chase, with neon lights reflecting off wet asphalt and buildings blurring past",
      "A street dancer performs complex moves on a graffiti-covered wall as crowds gather, with urban elements creating texture and rhythm in the composition",
      "A skateboarder launches off a ramp in an underground parking garage, captured mid-air with dramatic lighting cutting through the concrete environment"
    ],
    "Nature & Wildlife": [
      "An eagle soars through a mountain valley with wings spread wide against storm clouds, showcasing the raw power and grace of wildlife in its natural habitat",
      "Ocean waves crash against rocky cliffs in slow motion during a dramatic sunset, creating a symphony of water and light",
      "A cheetah sprints across the African savanna in pursuit of its prey, muscles rippling with each stride as dust kicks up behind",
      "A wolf pack moves through a snow-covered forest during twilight, their breath visible in the cold air as they navigate through the trees"
    ],
    "Vehicle Action": [
      "A sports car drifts around a mountain curve at high speed, tires smoking as the driver maintains perfect control through the challenging turn",
      "A motorcycle racer leans into a tight corner on a professional track, knee nearly touching the asphalt as they push the limits of physics",
      "An off-road vehicle launches over a sand dune in the desert, suspended in mid-air against a backdrop of endless golden sand",
      "A vintage muscle car accelerates down an empty highway at sunset, chrome reflecting the warm light as the engine roars"
    ],
    "Human Drama": [
      "A pianist's hands move across the keys during an emotional performance, captured in intimate detail as they pour their soul into the music",
      "A chef works intensively in a busy kitchen, flames leaping from pans as they orchestrate a culinary masterpiece under pressure",
      "A teacher inspires students in a classroom, gesturing passionately as knowledge and enthusiasm fill the space",
      "A parent embraces their child after a long separation, raw emotion evident in every movement and expression"
    ],
    "Adventure & Extreme": [
      "A rock climber scales a sheer cliff face during golden hour, chalk dust visible on their hands as they reach for the next hold",
      "A skydiver freefalls through clouds, arms spread wide as they experience the ultimate freedom of flight",
      "A surfer rides a massive wave, perfectly balanced as tons of water curl overhead in a display of natural power",
      "A mountain biker navigates a treacherous trail, launching off natural jumps while maintaining perfect control"
    ]
  };
}
