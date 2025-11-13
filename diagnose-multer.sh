#!/bin/bash

echo "🔍 DIAGNOSTIC: Find Flutter Field Name Issue"
echo "============================================="

echo "1. Check current logs for 'Validando archivo' entries:"
echo "======================================================"
pm2 logs social-service --lines 100 | grep "Validando archivo" -A 2 -B 2

echo ""
echo "2. Check for MulterError entries:"
echo "================================="
pm2 logs social-service --lines 100 | grep "MulterError" -A 3 -B 3

echo ""
echo "3. Monitor live logs (Ctrl+C to stop):"
echo "======================================"
echo "Run this in a separate terminal:"
echo "pm2 logs social-service --lines 0 -f"

echo ""
echo "📱 FLUTTER DEBUG INSTRUCTIONS:"
echo "=============================="
echo "In your Flutter app, add this debug code before sending the request:"
echo ""
echo "dart"
echo "// Add this logging in your Flutter code:"
echo "print('🔍 Flutter sending multipart request:');"
echo "for (var file in request.files) {"
echo "  print('  Field name: \${file.field}');"
echo "  print('  File name: \${file.filename}');"
echo "}"
echo "print('Fields in request:');"
echo "request.fields.forEach((key, value) => print('  \$key: \$value'));"
echo ""

echo "🎯 EXPECTED IN LOGS:"
echo "==================="
echo "If working correctly, you should see:"
echo "  🔍 Validating archivo: { fieldname: 'files', originalname: 'image.jpg', ... }"
echo ""
echo "If broken, you might see:"
echo "  🔍 Validating archivo: { fieldname: 'image', originalname: 'image.jpg', ... }"
echo "  ^^ This means Flutter is using 'image' instead of 'files'"
echo ""

echo "📋 CHECKLIST:"
echo "============="
echo "□ 1. Repository has create() method"
echo "□ 2. Multer accepts .any() field names"  
echo "□ 3. Files are being processed in controller"
echo "□ 4. Flutter sends correct field name"
echo "□ 5. No MulterError in logs"