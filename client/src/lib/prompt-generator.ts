import type { PromptConfig } from "@shared/schema";

export function generatePromptPreview(config: PromptConfig): string {
  const templates = getPromptTemplates();
  const categoryTemplates = templates[config.category] || templates["Sports & Athletics"];
  const basePrompt = categoryTemplates[0]; // Use first template for preview
  
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

function getPromptTemplates(): Record<string, string[]> {
  return {
    "Sports & Athletics": [
      "A professional athlete in peak physical condition performs a spectacular diving catch during a crucial moment in the game. The scene unfolds in slow motion as the player launches through the air, muscles tensed and focused, reaching for a perfectly thrown ball against the backdrop of a packed stadium",
    ],
    "Urban & Street": [
      "A parkour athlete leaps between rooftops in an urban cityscape at golden hour, with the city skyline creating a dramatic backdrop for their fluid movements",
    ],
    "Nature & Wildlife": [
      "An eagle soars through a mountain valley with wings spread wide against storm clouds, showcasing the raw power and grace of wildlife in its natural habitat",
    ],
    "Vehicle Action": [
      "A sports car drifts around a mountain curve at high speed, tires smoking as the driver maintains perfect control through the challenging turn",
    ],
    "Human Drama": [
      "A pianist's hands move across the keys during an emotional performance, captured in intimate detail as they pour their soul into the music",
    ],
    "Adventure & Extreme": [
      "A rock climber scales a sheer cliff face during golden hour, chalk dust visible on their hands as they reach for the next hold",
    ],
  };
}
