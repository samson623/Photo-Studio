#!/bin/bash

# Photo Studio - Environment Setup Script
# This script helps you set up your environment variables

echo "🎨 Photo Studio - Environment Setup"
echo "===================================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file already exists!"
    echo "📝 Current content:"
    echo "-------------------"
    cat .env.local
    echo "-------------------"
    echo ""
    read -p "Do you want to update it? (y/N): " update
    if [[ $update != "y" && $update != "Y" ]]; then
        echo "👍 Keeping existing .env.local file"
        exit 0
    fi
fi

# Create .env.local from template
if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from template"
else
    # Create basic .env.local if template doesn't exist
    cat > .env.local << EOF
# Fal.ai API Key - Replace with your actual API key
FAL_KEY=your_fal_ai_api_key_here
EOF
    echo "✅ Created basic .env.local file"
fi

echo ""
echo "🔑 Next Steps:"
echo "1. Get your API key from: https://fal.ai/dashboard"
echo "2. Edit .env.local and replace 'your_fal_ai_api_key_here' with your actual key"
echo "3. Run: npm run dev"
echo ""
echo "📝 To edit .env.local:"
echo "   nano .env.local     (or use your favorite editor)"
echo ""
echo "🚀 Once configured, all AI features will work!"
echo "   - Image generation with FLUX.1 models"
echo "   - Video generation with Hailuo-02 Pro & Framepack"
echo "   - Real-time cost estimation"