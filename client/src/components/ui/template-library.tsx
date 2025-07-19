import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Search, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Template, PromptConfig } from "@shared/schema";

interface TemplateLibraryProps {
  onTemplateSelect: (config: PromptConfig) => void;
}

const CATEGORIES = [
  "All Categories",
  "Sports & Athletics",
  "Urban & Street",
  "Nature & Wildlife", 
  "Vehicle Action",
  "Human Drama",
  "Adventure & Extreme",
];

export default function TemplateLibrary({ onTemplateSelect }: TemplateLibraryProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const { data: searchResults = [], refetch: searchTemplates } = useQuery<Template[]>({
    queryKey: ["/api/templates/search"],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/templates/search?q=${encodeURIComponent(searchQuery)}`);
      return await response.json();
    },
    enabled: false,
  });

  const filteredTemplates = searchQuery.trim() 
    ? searchResults
    : templates.filter(template => 
        selectedCategory === "All Categories" || template.category === selectedCategory
      );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      searchTemplates();
    }
  };

  const handleTemplateSelect = (template: Template) => {
    // Convert template to config
    const config: PromptConfig = {
      category: template.category,
      style: "Cinematic", // Default style
      duration: "5-10 seconds", // Default duration
      complexity: "Medium", // Default complexity
      elements: {
        weather_effects: false,
        dynamic_lighting: true,
        camera_movement: true,
      },
    };

    onTemplateSelect(config);
    
    toast({
      title: "Template Loaded",
      description: `"${template.name}" template has been applied to your configuration.`,
    });

    // Update template usage count
    fetch(`/api/templates/${template.id}/use`, { method: "POST" });
  };

  const formatRating = (rating: number) => {
    return (rating / 10).toFixed(1);
  };

  const formatUsageCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Template Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-500">Loading templates...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Template Library</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
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
        </div>
      </CardHeader>
      <CardContent>
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {searchQuery.trim() ? "No templates found matching your search." : "No templates available."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="border border-slate-200 hover:border-primary transition-colors cursor-pointer"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">
                        {template.name}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {template.description}
                      </p>
                    </div>
                    {template.isPopular && (
                      <Badge className="bg-primary text-white">Popular</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Used {formatUsageCount(template.usageCount)} times</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{formatRating(template.rating)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
