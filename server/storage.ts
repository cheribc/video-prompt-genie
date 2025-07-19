import { prompts, templates, type Prompt, type InsertPrompt, type Template, type InsertTemplate } from "@shared/schema";

export interface IStorage {
  // Prompt operations
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  getPrompts(limit?: number): Promise<Prompt[]>;
  getPromptById(id: number): Promise<Prompt | undefined>;
  
  // Template operations
  createTemplate(template: InsertTemplate): Promise<Template>;
  getTemplates(category?: string): Promise<Template[]>;
  getTemplateById(id: number): Promise<Template | undefined>;
  updateTemplateUsage(id: number): Promise<void>;
  searchTemplates(query: string): Promise<Template[]>;
}

export class MemStorage implements IStorage {
  private prompts: Map<number, Prompt>;
  private templates: Map<number, Template>;
  private currentPromptId: number;
  private currentTemplateId: number;

  constructor() {
    this.prompts = new Map();
    this.templates = new Map();
    this.currentPromptId = 1;
    this.currentTemplateId = 1;
    
    // Initialize with some default templates
    this.initializeDefaultTemplates();
  }

  private async initializeDefaultTemplates(): Promise<void> {
    const defaultTemplates: Omit<Template, 'id' | 'createdAt'>[] = [
      {
        name: "Epic Sports Action",
        description: "High-energy athletic moments with cinematic flair",
        category: "Sports & Athletics",
        promptTemplate: "A professional athlete in peak physical condition performs {action} during a crucial moment in the game. The scene unfolds in slow motion as {subject} launches through the air, muscles tensed and focused, {context}. Golden hour lighting creates dramatic shadows and highlights the intensity of the moment. Shot with cinematic camera movement that follows the action, capturing every detail in photorealistic quality.",
        isPopular: true,
        usageCount: 1200,
        rating: 48,
      },
      {
        name: "Urban Chase Scene", 
        description: "Fast-paced city action with dynamic camera work",
        category: "Urban & Street",
        promptTemplate: "A {subject} moves through busy downtown streets in a high-speed chase. The camera follows with dynamic tracking shots as {details} and {environment}. Dramatic lighting cuts through the urban landscape, creating a cinematic atmosphere of tension and movement.",
        isPopular: false,
        usageCount: 847,
        rating: 46,
      },
      {
        name: "Nature Documentary",
        description: "Wildlife and natural phenomena in motion", 
        category: "Nature & Wildlife",
        promptTemplate: "A {animal} {action} in its natural habitat during {time_of_day}. The scene captures the raw power and beauty of nature as {details}. Professional wildlife cinematography with telephoto lens work showcases every detail in stunning photorealistic quality.",
        isPopular: false,
        usageCount: 623,
        rating: 47,
      },
      {
        name: "Vehicle Stunts",
        description: "High-octane automotive action sequences",
        category: "Vehicle Action", 
        promptTemplate: "A {vehicle} performs {stunt} across {terrain} during {conditions}. The camera captures multiple angles of the action as {details}. Dynamic lighting and motion blur emphasize the speed and danger of the moment in cinematic detail.",
        isPopular: false,
        usageCount: 456,
        rating: 45,
      },
      {
        name: "Dramatic Weather",
        description: "Storm and weather-related dynamic scenes",
        category: "Nature & Wildlife",
        promptTemplate: "A {weather_event} unfolds across {landscape} with dramatic intensity. {subjects} struggle against the elements as {details}. Cinematic lighting through the storm creates a powerful atmosphere of natural forces in motion.",
        isPopular: false,
        usageCount: 334,
        rating: 44,
      },
      {
        name: "Human Drama",
        description: "Emotional moments with cinematic storytelling",
        category: "Human Drama",
        promptTemplate: "A {character} experiences {emotion} in {setting} during {situation}. The camera captures the intensity of human emotion through {technique}. Dramatic lighting and composition create a powerful cinematic moment that resonates with authenticity.",
        isPopular: false,
        usageCount: 289,
        rating: 46,
      },
    ];

    for (const template of defaultTemplates) {
      const id = this.currentTemplateId++;
      const fullTemplate: Template = {
        ...template,
        id,
        createdAt: new Date(),
      };
      this.templates.set(id, fullTemplate);
    }
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.currentPromptId++;
    const prompt: Prompt = {
      ...insertPrompt,
      id,
      createdAt: new Date(),
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async getPrompts(limit?: number): Promise<Prompt[]> {
    const allPrompts = Array.from(this.prompts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    return limit ? allPrompts.slice(0, limit) : allPrompts;
  }

  async getPromptById(id: number): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentTemplateId++;
    const template: Template = {
      ...insertTemplate,
      id,
      usageCount: 0,
      createdAt: new Date(),
    };
    this.templates.set(id, template);
    return template;
  }

  async getTemplates(category?: string): Promise<Template[]> {
    const allTemplates = Array.from(this.templates.values());
    return category 
      ? allTemplates.filter(t => t.category === category)
      : allTemplates.sort((a, b) => b.usageCount - a.usageCount);
  }

  async getTemplateById(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async updateTemplateUsage(id: number): Promise<void> {
    const template = this.templates.get(id);
    if (template) {
      template.usageCount++;
      this.templates.set(id, template);
    }
  }

  async searchTemplates(query: string): Promise<Template[]> {
    const allTemplates = Array.from(this.templates.values());
    const lowercaseQuery = query.toLowerCase();
    return allTemplates.filter(template => 
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.category.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const storage = new MemStorage();
