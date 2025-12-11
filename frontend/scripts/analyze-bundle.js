import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';

console.log('🔍 Analyzing bundle size...\n');

try {
  // Build the project
  console.log('📦 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Analyze bundle with webpack-bundle-analyzer if available
  try {
    console.log('\n📊 Analyzing bundle with webpack-bundle-analyzer...');
    execSync('npx webpack-bundle-analyzer dist/stats.json', { stdio: 'inherit' });
  } catch {
    console.log('⚠️  webpack-bundle-analyzer not available, using alternative analysis...');
    
    // Analyze dist folder
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      let totalSize = 0;
      
      console.log('\n📁 Bundle files:');
      files.forEach(file => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        const sizeInKB = Math.round(stats.size / 1024);
        totalSize += stats.size;
        
        console.log(`  ${file}: ${sizeInKB} KB`);
      });
      
      console.log(`\n📊 Total bundle size: ${Math.round(totalSize / 1024)} KB`);
      
      // Check for large files
      const largeFiles = files.filter(file => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        return stats.size > 500 * 1024; // Files larger than 500KB
      });
      
      if (largeFiles.length > 0) {
        console.log('\n⚠️  Large files detected:');
        largeFiles.forEach(file => {
          const filePath = path.join(distPath, file);
          const stats = fs.statSync(filePath);
          console.log(`  ${file}: ${Math.round(stats.size / 1024)} KB`);
        });
        console.log('\n💡 Consider code splitting for these files.');
      }
    }
  }

  // Check for common performance issues
  console.log('\n🔍 Checking for common performance issues...');
  
  // Check for unused dependencies
  try {
    console.log('📋 Checking for unused dependencies...');
    execSync('npx depcheck', { stdio: 'inherit' });
  } catch {
    console.log('⚠️  depcheck not available');
  }

  // Check for duplicate packages
  try {
    console.log('\n🔍 Checking for duplicate packages...');
    execSync('npx npm-check-duplicates', { stdio: 'inherit' });
  } catch {
    console.log('⚠️  npm-check-duplicates not available');
  }

  console.log('\n✅ Bundle analysis complete!');
  console.log('\n💡 Performance optimization tips:');
  console.log('  1. Use React.lazy() for route-based code splitting');
  console.log('  2. Optimize images with WebP format and lazy loading');
  console.log('  3. Minimize third-party dependencies');
  console.log('  4. Use tree shaking to eliminate unused code');
  console.log('  5. Implement service worker for caching');
  console.log('  6. Monitor Core Web Vitals');

} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
} 