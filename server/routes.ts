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
          version: "2.0.0",
          config_hash: JSON.stringify(config).substring(0, 20),
          enabled_features: {
            shot_details: config.enable_shot_details || false,
            scene_details: config.enable_scene_details || false,
            advanced_details: config.enable_advanced_details || false,
          },
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



  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate natural language prompt based on configuration
async function generatePromptFromConfig(config: PromptConfig): Promise<string> {
  let promptParts: string[] = [];
  
  // Always include subject description
  const subjectDesc = generateSubjectDescription(config.category);
  promptParts.push(subjectDesc);
  
  // Add main action
  const baseAction = generateActionDescription(config.category);
  promptParts.push(baseAction);
  
  // Add wardrobe if scene details are enabled
  if (config.enable_scene_details && config.subject?.include_wardrobe) {
    const wardrobeDesc = generateWardrobeDescription(config.category);
    promptParts.push(`wearing ${wardrobeDesc.toLowerCase()}`);
  }
  
  // Add shot composition if enabled
  if (config.enable_shot_details && config.shot) {
    const shotDetails = [];
    shotDetails.push(config.shot.composition || "Medium shot");
    if (config.shot.camera_motion && config.shot.camera_motion !== "static") {
      shotDetails.push(`${config.shot.camera_motion} camera movement`);
    }
    if (config.shot.frame_rate) {
      shotDetails.push(`shot at ${config.shot.frame_rate}`);
    }
    if (config.shot.film_grain) {
      shotDetails.push("with fine film grain texture");
    }
    promptParts.push(`${shotDetails.join(", ")}.`);
  }
  
  // Add scene details if enabled
  if (config.enable_scene_details) {
    const sceneElements = [];
    if (config.scene?.include_location) {
      sceneElements.push(`Location: ${generateLocationDescription(config.category)}`);
    }
    if (config.scene?.include_time_of_day) {
      sceneElements.push(`Time: ${getRandomTimeOfDay()}`);
    }
    if (config.scene?.include_environment) {
      sceneElements.push(generateEnvironmentDescription(config.category));
    }
    
    if (sceneElements.length > 0) {
      promptParts.push(sceneElements.join(". ") + ".");
    }
    
    // Add visual details
    if (config.visual_details?.include_props) {
      const propsDesc = generatePropsDescription(config.category);
      promptParts.push(`Scene includes: ${propsDesc.toLowerCase()}.`);
    }
  }
  
  // Add cinematography details if advanced details are enabled
  const cinematographyElements = [];
  if (config.enable_advanced_details) {
    if (config.cinematography?.include_lighting) {
      cinematographyElements.push(`Lighting: ${generateLightingDescription(config.style)}`);
    }
    if (config.cinematography?.include_tone) {
      cinematographyElements.push(`Overall tone: ${generateToneDescription(config.style)}`);
    }
  }
  
  // Add effects
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
    cinematographyElements.push(`Enhanced with: ${effects.join(", ")}`);
  }
  
  if (cinematographyElements.length > 0) {
    promptParts.push(cinematographyElements.join(". ") + ".");
  }
  
  // Add audio elements if advanced details are enabled
  if (config.enable_advanced_details) {
    if (config.audio?.include_ambient) {
      const ambientDesc = generateAmbientDescription(config.category);
      promptParts.push(`Audio: ${ambientDesc}.`);
    }
    
    if (config.audio?.include_dialogue) {
      const duration = parseInt(config.duration.split('-')[0]) || 5;
      promptParts.push(`Features ${duration}-second dialogue segment with documentary-style narration.`);
    }
    
    // Add color palette
    if (config.color_palette) {
      const colorDesc = generateColorPalette(config.style);
      promptParts.push(`Color palette: ${colorDesc}.`);
    }
  }
  
  // Add style and complexity modifiers
  if (config.style === "Cinematic") {
    promptParts.push("Shot with cinematic production values and dramatic visual storytelling.");
  } else if (config.style === "Documentary") {
    promptParts.push("Captured with authentic documentary-style cinematography and natural lighting.");
  } else if (config.style === "Commercial") {
    promptParts.push("Filmed with polished commercial production quality and professional standards.");
  } else if (config.style === "Artistic") {
    promptParts.push("Created with artistic vision and innovative visual techniques.");
  }
  
  // Add complexity and duration context
  if (config.complexity === "Complex") {
    promptParts.push("Intricate composition with multiple layered visual elements and detailed staging.");
  }
  
  const durationContext = config.duration === "3-5 seconds" ? "in a quick, impactful moment" :
                         config.duration === "5-10 seconds" ? "unfolding over several dramatic seconds" :
                         config.duration === "10-15 seconds" ? "developing through an extended sequence" :
                         "building through a complete narrative arc";
  
  promptParts.push(`Scene duration: ${config.duration}, ${durationContext}.`);
  
  promptParts.push("Photorealistic quality with stunning detail and professional video production standards.");
  
  return promptParts.join(" ");
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
      "Athletic woman in her late 20s with shoulder-length blonde hair pulled back, wearing blue and white team jersey, focused intense eyes, muscular build from years of training",
      "Young male soccer player, early 20s with short dark hair, tan complexion, wearing red team uniform with sweat glistening, determined expression",
      "Professional tennis player, mid-30s woman with curly brown hair, wearing white athletic wear, graceful yet powerful stance, years of experience evident in her confident demeanor"
    ],
    "Urban & Street": [
      "Hip-hop dancer, early 20s Black male with athletic build, wearing baggy jeans and graphic hoodie, gold chain necklace, confident smile and expressive brown eyes",
      "Street artist, mid-20s woman with purple-streaked hair, paint-stained denim jacket over vintage band t-shirt, creative energy radiating from her focused expression",
      "Parkour athlete, late 20s mixed-race male with lean muscular build, wearing fitted black clothing and fingerless gloves, alert hazel eyes scanning the urban environment"
    ],
    "Nature & Wildlife": [
      "Majestic golden eagle with 6-foot wingspan, sharp amber eyes, dark brown and golden feathers catching sunlight, powerful talons extended in flight",
      "Mountain wildlife photographer, 40s bearded man in earth-tone outdoor gear, weathered hands holding professional camera, patient and observant demeanor",
      "Wild grizzly bear, massive 800-pound male with thick brown fur, intelligent dark eyes, powerful shoulders and distinctive hump, moving with surprising grace"
    ],
    "Human Drama": [
      "Piano teacher, 50s woman with graying hair in elegant bun, wearing flowing cream blouse, gentle yet passionate expression while playing, wedding ring catching light",
      "Young father, early 30s with kind eyes and slight beard stubble, wearing casual button-down shirt, tender expression while interacting with child",
      "Chef in professional kitchen, 40s Latino man with salt-and-pepper hair, white chef coat with food stains, intense concentration while cooking, calloused hands from years of work"
    ],
    "Vehicle Action": [
      "Formula 1 driver, late 20s with sharp features visible through helmet visor, wearing red racing suit with sponsor logos, gloved hands gripping steering wheel with precision",
      "Motorcycle racer, mid-30s woman with athletic build, wearing leather racing suit and protective helmet, fierce determination in her posture and stance",
      "Rally car driver, 35-year-old man with focused blue eyes, wearing flame-resistant racing suit and helmet, weathered hands showing years of motorsport experience"
    ],
    "Adventure & Extreme": [
      "Rock climber, athletic woman in her 30s with braided auburn hair, wearing climbing harness and chalk-dusted hands, sinewy arms and legs, determined expression scaling cliff face",
      "Professional surfer, 25-year-old man with sun-bleached hair and tanned skin, wearing black wetsuit, balanced stance on surfboard, reading the massive wave with expert timing",
      "Skydiving instructor, experienced 40s woman with short blonde hair, wearing colorful jumpsuit and goggles, confident smile and strong build from years of extreme sports"
    ],
    "Romance & Relationships": [
      "Young couple in their 20s, woman with flowing dark hair wearing elegant dress, man in tailored suit with warm smile, holding hands with obvious affection",
      "Middle-aged couple, 40s woman with gentle eyes and natural beauty, man with salt-and-pepper beard, both radiating mature love and contentment",
      "Newlyweds, bride with radiant smile in flowing white dress, groom with tender expression in classic tuxedo, joy evident in their intimate embrace"
    ],
    "Action & Adventure": [
      "Adventure explorer, 30s woman with weathered leather jacket and determined gaze, athletic build from years of outdoor challenges, confident stance with survival gear",
      "Treasure hunter, rugged 35-year-old man with stubbled jaw and keen eyes, wearing practical adventure clothing, experienced hands holding ancient map",
      "Expedition leader, strong woman in her 40s with short practical hair, wearing technical outdoor gear, commanding presence with years of wilderness experience"
    ],
    "Drama & Emotion": [
      "Theater actress, elegant woman in her 30s with expressive brown eyes, wearing period costume, graceful movements that convey deep emotional range",
      "Grieving widower, distinguished 50s man with kind but sorrowful eyes, wearing simple dark clothing, weathered hands that tell stories of loss and resilience",
      "Young artist, passionate 20s woman with paint-stained fingers and creative energy, wearing bohemian clothing, intense gaze focused on her craft"
    ],
    "Comedy & Entertainment": [
      "Stand-up comedian, energetic 30s man with animated facial expressions, wearing casual but stylish clothing, natural charisma and perfect comedic timing",
      "Circus performer, agile woman in her 20s with bright costume and infectious smile, athletic build from years of acrobatic training, joy radiating from every movement",
      "Street entertainer, charismatic 40s man with expressive eyes and theatrical gestures, colorful vintage clothing, natural ability to captivate audiences"
    ],
    "Horror & Thriller": [
      "Paranormal investigator, serious 35-year-old woman with sharp eyes and professional demeanor, wearing practical dark clothing, equipment-laden belt, fearless expression",
      "Detective, weathered 40s man with observant gaze and worn leather jacket, experienced hands that have seen too much, methodical approach to solving mysteries",
      "Survivor, young woman in her 20s with determined expression and cautious movements, practical clothing showing signs of struggle, resourceful and alert"
    ],
    "Science Fiction": [
      "Space explorer, confident woman in her 30s wearing sleek futuristic suit, intelligent eyes adapted to cosmic environments, advanced technology integrated into her gear",
      "Cyborg engineer, 40s man with partially synthetic features and enhanced abilities, wearing technical jumpsuit with electronic interfaces, calm precision in every movement",
      "Alien contact specialist, brilliant woman in her 40s with kind eyes and patient demeanor, wearing diplomatic attire suitable for first contact scenarios"
    ],
    "Documentary Style": [
      "Master craftsman, elderly man in his 60s with skilled weathered hands, wearing traditional work clothing, decades of expertise evident in every careful movement",
      "Cultural anthropologist, scholarly woman in her 50s with observant eyes and respectful demeanor, practical field clothing, notebook always in hand",
      "Wildlife conservationist, passionate 40s man with sun-weathered skin and gentle approach to animals, wearing khaki field gear, deep connection to nature"
    ],
    "Fantasy & Magic": [
      "Mystical sorceress, ethereal woman in her 30s with flowing robes and ancient wisdom in her eyes, hands that channel otherworldly energy, graceful supernatural presence",
      "Dragon rider, brave young man in his 20s with wind-swept hair and fearless expression, wearing leather armor with magical runes, bond with mythical creatures",
      "Forest guardian, ageless woman with nature-touched features and flowing green garments, eyes that hold centuries of woodland secrets, protector of magical realms"
    ],
    "Music & Dance": [
      "Prima ballerina, elegant woman in her 20s with perfect posture and graceful extensions, wearing classical tutu, years of training evident in every refined movement",
      "Jazz musician, soulful 40s man with expressive hands and deep musical understanding, wearing vintage suit, instrument as natural extension of his being",
      "Contemporary dancer, athletic woman in her 20s with fluid movements and emotional expression, wearing modern dance attire, storytelling through physical artistry"
    ],
    "Food & Cooking": [
      "Master chef, passionate 45-year-old man with culinary precision and creative vision, wearing traditional white chef coat, hands that craft edible masterpieces",
      "Pastry artist, delicate woman in her 30s with meticulous attention to detail, wearing clean apron, fingers skilled in creating beautiful desserts",
      "Farm-to-table cook, earthy woman in her 40s with connection to ingredients, wearing casual kitchen attire, knowledge of sustainable cooking practices"
    ],
    "Travel & Nature": [
      "Nature photographer, patient woman in her 30s with keen eye for natural beauty, wearing outdoor photography vest, camera as constant companion",
      "Mountain guide, experienced 40s man with strong build and weather-beaten face, wearing technical climbing gear, deep knowledge of wilderness survival",
      "Travel blogger, adventurous woman in her 20s with curious spirit and cultural sensitivity, wearing practical travel clothing, passport stamps telling global stories"
    ],
    "Technology": [
      "Software developer, focused woman in her 30s with logical mind and problem-solving skills, wearing comfortable casual clothing, multiple monitors reflecting code",
      "AI researcher, brilliant 40s man with innovative thinking and ethical considerations, wearing business casual attire, bridging human and artificial intelligence",
      "Tech entrepreneur, dynamic woman in her 20s with visionary leadership and startup energy, wearing modern professional clothing, changing world through innovation"
    ],
    "Fashion & Beauty": [
      "Fashion designer, creative woman in her 30s with artistic vision and impeccable style, wearing avant-garde clothing of her own design, sketchbook always nearby",
      "Professional model, statuesque woman in her 20s with striking features and confident presence, wearing high-fashion garments, natural ability to embody designer visions",
      "Beauty influencer, charismatic woman in her 20s with flawless makeup skills and engaging personality, wearing trendy clothing, camera-ready at all moments"
    ],
    "Business & Professional": [
      "CEO executive, authoritative woman in her 40s with sharp business acumen and leadership presence, wearing tailored power suit, commanding respect in boardroom",
      "Investment banker, analytical man in his 30s with quick decision-making skills and market expertise, wearing expensive business attire, phone constantly in hand",
      "Management consultant, strategic woman in her 30s with problem-solving mindset and client focus, wearing professional consulting attire, presentation materials ready"
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

function generateActionDescription(category: string): string {
  const actions = {
    "Sports & Athletics": [
      "performs spectacular diving catch during crucial game moment",
      "sprints across field under stadium lights, dodging defenders",
      "executes perfect bicycle kick in slow motion",
      "leaps for slam dunk with dramatic lighting",
      "serves tennis ball with powerful precision",
      "completes gymnastics routine with graceful landing"
    ],
    "Action & Adventure": [
      "navigates treacherous mountain pass with determination",
      "leaps across dangerous chasm in ancient ruins", 
      "scales towering cliff face during thunderstorm",
      "pursues through dense jungle canopy",
      "rappels down steep canyon wall",
      "crosses narrow bridge over raging river"
    ],
    "Drama & Emotion": [
      "sits quietly by rain-streaked window processing emotions",
      "embraces loved one after long separation",
      "delivers powerful speech to captivated audience", 
      "works late into night by lamplight",
      "reads letter with tears in eyes",
      "comforts friend during difficult moment"
    ],
    "Comedy & Entertainment": [
      "delivers perfectly timed comedic gesture on stage",
      "performs elaborate pratfall with expert timing",
      "engages audience with animated storytelling",
      "executes complex dance routine with humor",
      "improvises witty response to unexpected situation",
      "entertains crowd with magic tricks and jokes"
    ],
    "Horror & Thriller": [
      "cautiously explores dimly lit corridor",
      "hides in shadows while tension builds",
      "investigates mysterious sounds in darkness", 
      "flees through fog-covered cemetery",
      "discovers hidden room behind bookshelf",
      "confronts supernatural presence with courage"
    ],
    "Romance & Relationships": [
      "shares intimate moment in softly lit garden",
      "dances together under starlit sky",
      "walks hand in hand along beach at sunset",
      "prepares surprise dinner by candlelight",
      "exchanges meaningful glances across crowded room",
      "writes heartfelt love letter at antique desk"
    ],
    "Science Fiction": [
      "examines advanced technology in spacecraft interior",
      "navigates through holographic interface displays",
      "explores alien landscape with scanning equipment",
      "operates complex futuristic machinery",
      "communicates with alien life forms",
      "travels through interdimensional portal"
    ],
    "Documentary Style": [
      "demonstrates traditional craft with weathered hands",
      "works in natural environment showcasing expertise",
      "explains process to camera with authentic passion",
      "preserves cultural tradition through skilled practice",
      "shares knowledge gained from decades of experience",
      "teaches apprentice time-honored techniques"
    ],
    "Fantasy & Magic": [
      "channels ethereal energy in enchanted forest clearing",
      "casts spell with mystical gestures and glowing symbols",
      "soars on magical wings through clouded mountains",
      "discovers ancient artifact in hidden temple",
      "battles mythical creatures with enchanted sword",
      "transforms ordinary objects through magical power"
    ],
    "Music & Dance": [
      "performs with passionate intensity under stage lights",
      "moves in perfect rhythm to flowing melody",
      "plays intricate piece on classical instrument",
      "conducts orchestra with dramatic flourishes",
      "improvises solo during jazz performance",
      "teaches complex choreography to eager students"
    ],
    "Food & Cooking": [
      "prepares exquisite dish with precise movements",
      "flames leap from sizzling pan in busy kitchen",
      "tastes and seasons with expert palate",
      "plates beautiful dish with artistic flair",
      "kneads bread dough with practiced technique",
      "creates molecular gastronomy masterpiece"
    ],
    "Travel & Nature": [
      "stands at edge of magnificent vista",
      "hikes through pristine wilderness trail",
      "photographs stunning landscape at golden hour",
      "camps under star-filled night sky",
      "explores hidden waterfall in remote forest",
      "watches sunrise from mountain summit"
    ],
    "Technology": [
      "works intently with cutting-edge equipment",
      "codes complex algorithm on multiple screens",
      "assembles precision electronic components",
      "demonstrates innovative prototype device",
      "troubleshoots advanced robotic system",
      "presents breakthrough research to colleagues"
    ],
    "Fashion & Beauty": [
      "showcases elegant attire with confident grace",
      "poses for camera with professional poise",
      "applies makeup with artistic precision",
      "walks runway with commanding presence",
      "designs custom garment on dress form",
      "styles hair for glamorous photo shoot"
    ],
    "Business & Professional": [
      "presents innovative ideas in modern conference room",
      "negotiates deal with confident handshake",
      "works focused at executive desk",
      "leads team meeting with engaging presence",
      "analyzes financial data on multiple monitors",
      "mentors junior colleague with patience"
    ]
  };
  
  const categoryActions = actions[category] || actions["Sports & Athletics"];
  return categoryActions[Math.floor(Math.random() * categoryActions.length)];
}
