# AI Video Prompt Generator

A powerful AI-driven video prompt generator that enables users to create photorealistic dynamic text-to-video prompts with advanced configuration and an intuitive interface.

## Features

- **15 Professional Video Categories**: Sports & Athletics, Action & Adventure, Drama & Emotion, Comedy & Entertainment, Horror & Thriller, Romance & Relationships, Science Fiction, Documentary Style, Fantasy & Magic, Music & Dance, Food & Cooking, Travel & Nature, Technology, Fashion & Beauty, Business & Professional
- **JSON Format Output**: Structured data export with configuration details
- **Prompt Variations**: Generate multiple alternative prompts from the same configuration
- **Professional Video Production Terminology**: Industry-standard language for AI video models
- **Copy & Export Functions**: Easy sharing and downloading of generated prompts
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript, Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with dark mode support
- **Deployment**: Optimized for Replit Deployments

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-video-prompt-generator.git
cd ai-video-prompt-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

1. **Select Configuration**: Choose your video category, style, duration, and complexity
2. **Generate Prompt**: Click "Generate Prompt" to create a professional video prompt
3. **View JSON Format**: See structured data output for API integration
4. **Generate Variations**: Create alternative prompts with the "Generate More" button
5. **Copy or Export**: Use the copy and export functions to save your prompts

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utilities and API client
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage interface
├── shared/                # Shared TypeScript schemas
└── package.json
```

## API Endpoints

- `POST /api/prompts/generate` - Generate a new video prompt
- `POST /api/prompts/variations` - Generate prompt variations
- `GET /api/prompts` - Retrieve generated prompts (optional limit)

## Deployment

### Replit (Recommended)
1. Import this repository to Replit
2. Click the "Deploy" button
3. Your app will be live at `https://your-repl-name.your-username.replit.app`

### Manual Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Deploy to your preferred hosting platform

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web technologies for optimal performance
- Designed for AI video generation workflows
- Professional video production terminology integration