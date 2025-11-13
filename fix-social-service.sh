#!/bin/bash

echo "🔧 FIXING SOCIAL SERVICE ERRORS"
echo "================================"

echo "1. Installing Dependencies"
echo "=========================="
cd ~/aura_server/social-service
npm install multer --save

echo ""
echo "2. Restarting Social Service"
echo "=========================="
pm2 restart social-service

echo ""
echo "3. Testing with curl - Text Only Publication"
echo "============================================"

# Get a fresh token first
echo "📝 First, get a JWT token:"
echo "curl -X POST http://54.146.237.63:3001/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"aura@gmail.com\",\"password\":\"@Aura1234\"}'"
echo ""
echo "📝 Then test creating publication:"
echo "curl -X POST http://54.146.237.63:3002/api/v1/publications \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"content\":\"Test publication after fix\",\"type\":\"text\",\"visibility\":\"public\"}'"

echo ""
echo "4. Checking logs"
echo "================"
echo "pm2 logs social-service --lines 50"

echo ""
echo "✅ FIXES APPLIED:"
echo "=================="
echo "  - Added create() method to SequelizePublicationRepository"
echo "  - Changed multer from .array('files', 5) to .any() for flexibility"
echo "  - Enhanced logging to see field names from Flutter"
echo ""
echo "🔍 NEXT STEPS:"
echo "=============="
echo "1. Test with the curl command above"
echo "2. Check Flutter field names in logs"
echo "3. If still errors, check field name Flutter is using"
echo ""
echo "Common Flutter field names to check:"
echo "  - 'files' (our expected name)"
echo "  - 'image' or 'images'"
echo "  - 'file'"
echo "  - 'media'"