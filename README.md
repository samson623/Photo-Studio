# 🎨 Photo Studio - AI-Powered Image & Video Generation

A modern React application for generating and editing images and videos using Fal.ai's FLUX.1 and video generation models.

## ✨ Features

- 🖼️ **Image Generation**: Create stunning images with FLUX.1 [schnell] and [dev] models
- ✏️ **Image Editing**: Edit existing images with AI-powered transformations  
- 🎬 **Video Generation**: Generate videos using Hailuo-02 Pro and Framepack models
- 💾 **Gallery Management**: Save and organize your creations in IndexedDB
- 👤 **User Management**: Demo user system with plan tiers and usage tracking
- 💰 **Cost Estimation**: Real-time pricing for different models and operations

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- A Fal.ai API key ([Get one here](https://fal.ai/dashboard))

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your API key:**
   ```bash
   # Create/edit .env.local
   FAL_KEY=your_fal_ai_api_key_here
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Development: `http://localhost:5173` (or next available port)
   - The app will automatically open or show the URL in terminal

### Production Build

```bash
npm run build
npm run preview
```

## 🛠️ Troubleshooting

### Blank Screen Issues (Cursor/VS Code)
If you see a blank screen when opening in Cursor or other editors:

1. **Check the diagnostic page:** Navigate to `/diagnostic.html` to run system checks
2. **Clear browser storage:** Use the diagnostic page or clear manually
3. **Check console errors:** Open browser DevTools and look for JavaScript errors
4. **Verify API key:** Ensure your `FAL_KEY` is properly set in `.env.local`

### Common Issues

- **403 Errors:** These may be from external services (avatars, etc.) and don't affect functionality
- **Module Loading:** Ensure you're using a modern browser with ES6 module support
- **CORS Issues:** Use the development server (`npm run dev`) for local development

### Development vs Production

- **Development:** Uses Vite dev server with hot reload and module resolution
- **Production:** Builds optimized bundle, serves static files

## 🔧 API Configuration

The app uses Fal.ai for all AI operations:

### Supported Models

#### Image Generation (FLUX.1)
- **schnell**: Fast generation ($0.003/MP)
- **dev**: High quality ($0.025/MP)

#### Video Generation  
- **Hailuo-02 Pro**: Premium quality, 6s videos ($0.08/sec)
- **Framepack**: Cost effective, 5s videos (~$0.0333/sec)

### Environment Variables

```bash
# .env.local
FAL_KEY=your_fal_ai_api_key_here
```

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Build:** Vite
- **AI Services:** Fal.ai
- **Storage:** IndexedDB (via custom service)
- **State:** React Context API

### Project Structure
```
src/
├── components/          # React components
│   ├── icons/          # SVG icon components  
│   ├── ErrorBoundary.tsx
│   └── ...
├── context/            # React context providers
├── services/           # API and database services
├── data/              # Static data and configuration
└── types.ts           # TypeScript type definitions
```

## 🧪 Testing

### Manual Testing
1. Navigate to `/diagnostic.html` for system diagnostics
2. Test image generation with different models
3. Test video generation with sample prompts
4. Verify gallery save/load functionality

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## 📱 Usage

### Image Generation
1. Choose "Generate New" or "Edit Image" mode
2. Select FLUX.1 model (schnell for speed, dev for quality)
3. Write a detailed prompt
4. For editing: upload an image and adjust strength
5. Click "Generate Image"

### Video Generation  
1. Select video model (Hailuo-02 Pro or Framepack)
2. Write a scene description
3. Optionally upload a starting image
4. Add narration script (browser-only playback)
5. Click "Generate Video"

## 🎯 Deployment

### Static Hosting (Recommended)
Deploy the `dist/` folder to any static hosting service:
- Vercel
- Netlify  
- GitHub Pages
- Cloudflare Pages

### Build Process
```bash
npm run build  # Creates optimized dist/ folder
```

## 🔐 Security

- API keys are required for AI functionality
- Client-side implementation (API key visible in browser)
- For production: implement server-side proxy for API calls
- IndexedDB stores user data locally (no server storage)

## 📄 License

MIT License - feel free to use for personal and commercial projects.

---

**Need help?** Check the diagnostic page at `/diagnostic.html` or review console logs for detailed error information.
