# 🎨 Photo Studio - AI-Powered Creative Studio

A cutting-edge React application that harnesses the power of AI to generate stunning images and videos. Built with Fal.ai's state-of-the-art FLUX.1 models and advanced video generation technology.

## 🌟 Live Demo

**🚀 [Try it now](https://3000-iakxjl0scsg0qu6kfejyi-6532622b.e2b.dev)** | **📱 [Production Build](https://8080-iakxjl0scsg0qu6kfejyi-6532622b.e2b.dev)**

> *Experience the future of AI-powered content creation directly in your browser!*

## ✨ Features

- 🎨 **AI Image Generation**: Create breathtaking images with FLUX.1 [schnell] and [dev] models
- ✏️ **Smart Image Editing**: Transform existing images with AI-powered modifications
- 🎬 **Video Creation**: Generate professional videos using Hailuo-02 Pro and Framepack models
- 💾 **Personal Gallery**: Save, organize, and manage your creative works locally
- 👤 **User System**: Complete user management with subscription tiers and usage tracking
- 💰 **Transparent Pricing**: Real-time cost calculation for all AI operations
- 📱 **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- 🔧 **Developer Tools**: Built-in diagnostics and error handling for smooth operation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- A Fal.ai API key ([Get one here](https://fal.ai/dashboard))

### Installation

1. **Clone the repository and install dependencies:**
   ```bash
   git clone https://github.com/samson623/Photo-Studio.git
   cd Photo-Studio
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
   - Development: `http://localhost:3000` (or next available port)
   - The app will automatically display the URL in terminal

### Production Build

```bash
npm run build    # Creates optimized build in dist/ folder
npm run preview  # Preview production build locally
```

## 🛠️ Troubleshooting

### Quick Fixes
- **Blank Screen:** Navigate to `/diagnostic.html` for comprehensive system checks
- **API Errors:** Verify your `FAL_KEY` is correctly set in `.env.local`
- **Build Issues:** Run `npm run build` to check for compilation errors
- **Network Issues:** Check browser DevTools console for detailed error messages

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 403 Errors in console | Normal - from avatar services, doesn't affect functionality |
| Module loading errors | Use modern browser with ES6 module support |
| CORS issues | Use `npm run dev` for development |
| Slow loading | Try production build with `npm run build` |

### Development vs Production

- **Development Mode:** 
  - Vite dev server with hot module replacement
  - Source maps for debugging
  - Unminified code for inspection
  
- **Production Mode:**
  - Optimized and minified bundles
  - Tree-shaken dependencies
  - Compressed assets for faster loading

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
Photo-Studio/
├── components/              # React UI components
│   ├── icons/              # Custom SVG icons
│   ├── ErrorBoundary.tsx   # Error handling wrapper
│   ├── GenerateImage.tsx   # Image generation interface
│   ├── GenerateVideo.tsx   # Video generation interface
│   ├── Gallery.tsx         # Media gallery
│   └── Layout.tsx          # Main app layout
├── context/                # React context providers
│   └── AuthContext.tsx     # User authentication state
├── services/               # External service integrations
│   ├── falService.ts       # Fal.ai API integration
│   └── dbService.ts        # IndexedDB operations
├── data/                   # Static configuration
│   └── plans.ts            # Subscription plan data
├── types.ts                # TypeScript type definitions
├── App.tsx                 # Main application component
├── index.tsx              # Application entry point
└── vite.config.ts         # Vite build configuration
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

## 🚀 Deployment

### Recommended Hosting Platforms

| Platform | Deployment | Auto-Deploy |
|----------|------------|-------------|
| **Vercel** | `npm run build` → Upload `dist/` | ✅ GitHub integration |
| **Netlify** | Drag & drop `dist/` folder | ✅ GitHub integration |
| **GitHub Pages** | Enable Pages in repo settings | ✅ Actions workflow |
| **Cloudflare Pages** | Connect GitHub repository | ✅ Automatic builds |

### Manual Deployment
```bash
npm run build          # Creates optimized dist/ folder
# Upload dist/ contents to your hosting service
```

### Environment Variables for Production
Remember to set your `FAL_KEY` in your hosting platform's environment variables section.

## 🔐 Security & Privacy

- **API Keys:** Required for AI functionality - kept in environment variables
- **Client-Side:** Current implementation exposes API key in browser (development mode)
- **Production Security:** Consider implementing server-side proxy for API calls
- **Data Storage:** All user data stored locally in IndexedDB - no server transmission
- **Privacy First:** No personal data collected or transmitted to external services

## 📊 Performance

- **Bundle Size:** ~290KB gzipped (optimized production build)
- **Load Time:** ~2-3 seconds on average connection
- **AI Generation:** 
  - Images: 10-30 seconds depending on model
  - Videos: 2-5 minutes depending on complexity
- **Browser Support:** Modern browsers (Chrome 80+, Firefox 75+, Safari 14+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - Free for personal and commercial use.

## 🆘 Support

- **Documentation:** Check `/diagnostic.html` for system diagnostics
- **Issues:** Report bugs on [GitHub Issues](https://github.com/samson623/Photo-Studio/issues)
- **Discussions:** Join conversations in [GitHub Discussions](https://github.com/samson623/Photo-Studio/discussions)

---

**Made with ❤️ by [samson623](https://github.com/samson623)** | Powered by [Fal.ai](https://fal.ai)
