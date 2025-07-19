import { Video, HelpCircle, Settings } from "lucide-react";
import { Button } from "./button";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Video className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">
              Video Prompt Generator
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4 text-slate-600" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 text-slate-600" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
