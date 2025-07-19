import type { PromptConfig } from "@shared/schema";

export function generatePromptPreview(config: PromptConfig): string {
  const templates = getPromptTemplates();
  const categoryTemplates = templates[config.category] || templates["Sports & Athletics"];
  let enhancedPrompt = categoryTemplates[0]; // Use first template for preview
  
  // Add shot details if enabled
  if (config.enable_shot_details && config.shot) {
    const shotDetails = [];
    
    if (config.shot.composition) {
      shotDetails.push(`${config.shot.composition.toLowerCase()}`);
    }
    
    if (config.shot.camera_motion && config.shot.camera_motion !== "static") {
      shotDetails.push(`${config.shot.camera_motion} camera movement`);
    }
    
    if (config.shot.frame_rate) {
      shotDetails.push(`shot at ${config.shot.frame_rate}`);
    }
    
    if (config.shot.film_grain) {
      shotDetails.push("film grain texture");
    }
    
    if (shotDetails.length > 0) {
      enhancedPrompt += `. Filmed with ${shotDetails.join(", ")}`;
    }
  }
  
  // Add scene details if enabled
  if (config.enable_scene_details) {
    const sceneElements = [];
    
    if (config.subject?.include_description) {
      sceneElements.push("detailed character descriptions");
    }
    
    if (config.subject?.include_wardrobe) {
      sceneElements.push("specific wardrobe details");
    }
    
    if (config.scene?.include_location) {
      sceneElements.push("rich location atmosphere");
    }
    
    if (config.scene?.include_time_of_day) {
      sceneElements.push("time-of-day lighting");
    }
    
    if (config.scene?.include_environment) {
      sceneElements.push("environmental mood");
    }
    
    if (config.visual_details?.include_action) {
      sceneElements.push("dynamic action sequences");
    }
    
    if (config.visual_details?.include_props) {
      sceneElements.push("meaningful props");
    }
    
    if (sceneElements.length > 0) {
      enhancedPrompt += `. Enhanced with ${sceneElements.join(", ")}`;
    }
  }
  
  // Add advanced details if enabled
  if (config.enable_advanced_details) {
    const advancedElements = [];
    
    if (config.cinematography?.include_lighting) {
      advancedElements.push("professional lighting setup");
    }
    
    if (config.cinematography?.include_tone) {
      advancedElements.push("cinematic tone");
    }
    
    if (config.audio?.include_ambient) {
      advancedElements.push("ambient soundscape");
    }
    
    if (config.audio?.include_dialogue) {
      advancedElements.push("natural dialogue");
    }
    
    if (config.color_palette) {
      advancedElements.push("curated color palette");
    }
    
    if (advancedElements.length > 0) {
      enhancedPrompt += `. Features ${advancedElements.join(", ")}`;
    }
  }
  
  // Add style-specific elements
  const styleModifiers = [];
  if (config.style === "Cinematic") {
    styleModifiers.push("cinematic camera work", "dramatic lighting");
  } else if (config.style === "Documentary") {
    styleModifiers.push("documentary-style cinematography", "natural lighting");
  } else if (config.style === "Commercial") {
    styleModifiers.push("polished production values", "perfect lighting");
  } else if (config.style === "Artistic") {
    styleModifiers.push("artistic vision", "creative composition");
  } else if (config.style === "Vintage") {
    styleModifiers.push("vintage aesthetics", "classic film look");
  } else if (config.style === "Modern") {
    styleModifiers.push("contemporary style", "clean modern look");
  } else if (config.style === "Noir") {
    styleModifiers.push("noir lighting", "dramatic shadows");
  } else if (config.style === "Colorful") {
    styleModifiers.push("vibrant colors", "dynamic visual palette");
  }
  
  // Add basic element modifiers
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
  
  // Combine style and effects
  const allEffects = [...styleModifiers, ...effects];
  if (allEffects.length > 0) {
    enhancedPrompt += `. Shot with ${allEffects.join(", ")}`;
  }
  
  // Add duration context
  if (config.duration === "1-3 seconds") {
    enhancedPrompt += " in a brief, impactful moment";
  } else if (config.duration === "3-5 seconds") {
    enhancedPrompt += " in a quick, decisive action";
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
  
  enhancedPrompt += ". Photorealistic quality with stunning detail.";
  
  return enhancedPrompt;
}

function getPromptTemplates(): Record<string, string[]> {
  return {
    "Sports & Athletics": [
      "A professional athlete in peak physical condition performs a spectacular diving catch during a crucial moment in the game. The scene unfolds in slow motion as the player launches through the air, muscles tensed and focused, reaching for a perfectly thrown ball against the backdrop of a packed stadium",
    ],
    "Action & Adventure": [
      "A skilled adventurer navigates through a treacherous mountain pass, their determined expression visible as they carefully place each step on the narrow rocky ledge, with a breathtaking valley stretching far below",
    ],
    "Drama & Emotion": [
      "A person sits quietly by a rain-streaked window, their reflection blurred in the glass as they process deep emotions, the soft interior lighting creating an intimate and contemplative atmosphere",
    ],
    "Comedy & Entertainment": [
      "A charismatic performer delivers a perfectly timed comedic moment on stage, their animated expressions and gestures captivating the audience as laughter fills the warm, spotlight-lit theater",
    ],
    "Horror & Thriller": [
      "A figure cautiously explores a dimly lit corridor, tension building with each careful step as shadows play across the walls and an unsettling atmosphere permeates the confined space",
    ],
    "Romance & Relationships": [
      "Two people share an intimate moment in a softly lit garden, their eyes meeting with genuine connection as delicate flower petals drift gently through the golden evening air around them",
    ],
    "Science Fiction": [
      "A futuristic explorer examines advanced technology in a sleek spacecraft interior, holographic displays illuminating their focused expression as they navigate through the cosmos toward an unknown destination",
    ],
    "Documentary Style": [
      "A craftsperson demonstrates their traditional skill with weathered hands, each deliberate movement showcasing years of expertise as natural light reveals the intricate details of their time-honored craft",
    ],
    "Fantasy & Magic": [
      "A mystical figure channels ethereal energy in an enchanted forest clearing, ancient symbols glowing softly in the air around them as magical light filters through the towering trees",
    ],
    "Music & Dance": [
      "A talented musician performs with passionate intensity, their body moving in rhythm with the melody as stage lights create dramatic silhouettes and the music seems to flow visibly through the air",
    ],
    "Food & Cooking": [
      "A skilled chef prepares an exquisite dish with precise movements, steam rising from the sizzling pan as fresh ingredients are artfully combined in the warm, bustling kitchen atmosphere",
    ],
    "Travel & Nature": [
      "A lone traveler stands at the edge of a magnificent vista, taking in the breathtaking panoramic view as golden sunlight illuminates the diverse landscape stretching endlessly toward the horizon",
    ],
    "Technology": [
      "An engineer works intently with cutting-edge equipment, their focused concentration evident as holographic interfaces respond to their gestures in the sleek, modern laboratory environment",
    ],
    "Fashion & Beauty": [
      "A model showcases elegant attire with confident grace, the flowing fabric and sophisticated styling captured in perfect detail as studio lighting accentuates every refined element of the look",
    ],
    "Business & Professional": [
      "A professional presents innovative ideas in a modern conference room, their confident posture and engaging presence commanding attention as colleagues listen intently to the compelling presentation",
    ],
  };
}
