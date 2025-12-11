# 🔧 Tailwind CSS Troubleshooting Guide

## Issue: Tailwind CSS not applying to website

### Quick Diagnostic Steps:

1. **Check if development server is running:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Look for diagnostic boxes on the website:**
   - Red test box (top-left): Basic CSS test
   - White diagnostic box (top-right): CSS diagnostic results
   - If you see these boxes with styling, CSS is working!

3. **Check browser console for errors:**
   - Press F12 to open Developer Tools
   - Look for CSS-related errors in Console tab

### Common Issues & Solutions:

#### Issue 1: Tailwind CSS not processing
**Symptoms:** No Tailwind classes working, only basic HTML structure visible

**Solutions:**
```bash
# 1. Clear everything and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 2. Restart development server
npm run dev
```

#### Issue 2: PostCSS not working
**Symptoms:** CSS files not being processed

**Check postcss.config.js:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### Issue 3: Tailwind config issues
**Symptoms:** Some Tailwind classes work, others don't

**Check tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest of config
}
```

#### Issue 4: CSS import issues
**Symptoms:** No CSS loading at all

**Check main.jsx:**
```javascript
import './index.css'  // This should be present
```

#### Issue 5: Vite configuration conflicts
**Symptoms:** Build errors or CSS not processing

**Check vite.config.js:**
```javascript
export default defineConfig({
  plugins: [react()],
  // Remove any CSS-specific configuration that might conflict
})
```

### Debug Steps:

1. **Check if CSS file exists:**
   - Look for `index.css` in `src/` folder
   - Verify it contains `@tailwind` directives

2. **Check browser network:**
   - Open Developer Tools
   - Go to Network tab
   - Reload page
   - Look for CSS files being loaded

3. **Check for JavaScript errors:**
   - Open browser console
   - Look for any error messages
   - Check if React is rendering properly

4. **Test with minimal CSS:**
   Add this to `index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   body {
     background-color: red !important;
   }
   ```

### Emergency Fixes:

#### Fix 1: Complete Reset
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
npm run dev
```

#### Fix 2: Manual CSS Test
Create a simple test in `index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

.test-class {
  background-color: red;
  color: white;
  padding: 20px;
  margin: 20px;
}
```

Then add this to your component:
```jsx
<div className="test-class">If you see this red box, CSS is working!</div>
```

#### Fix 3: Check Dependencies
Make sure these are in `package.json`:
```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.4",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
```

### What to Look For:

1. **Diagnostic Boxes:** Check if the test boxes appear with styling
2. **Console Errors:** Any JavaScript or CSS errors
3. **Network Tab:** CSS files loading successfully
4. **Element Inspector:** Check if Tailwind classes are applied

### If Still Not Working:

1. **Try a different browser** to rule out browser-specific issues
2. **Clear browser cache** completely
3. **Check file permissions** on CSS files
4. **Verify Node.js version** (`node --version`)
5. **Check npm version** (`npm --version`)

### Contact Support:
If none of these solutions work, please provide:
- Screenshot of the diagnostic boxes
- Browser console errors
- Network tab showing CSS files
- Operating system details
- Node.js and npm versions 