const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'public', 'images');
const tempDir = path.join(__dirname, 'temp_images_webp');

async function convertToWebP() {
  try {
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const files = fs.readdirSync(inputDir).filter(file =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file) && file !== '.gitkeep'
    );

    console.log(`Found ${files.length} images to convert to WebP`);

    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const name = path.basename(file, path.extname(file));
      const outputPath = path.join(tempDir, name + '.webp');

      console.log(`Converting ${file} -> ${name}.webp`);

      await sharp(inputPath)
        .resize(800, null, { // Max width 800px, maintain aspect ratio
          withoutEnlargement: true // Don't enlarge if smaller
        })
        .webp({ quality: 70 }) // Convert to WebP with 70% quality
        .toFile(outputPath);
    }

    // Move temp files to input dir, replacing originals
    const tempFiles = fs.readdirSync(tempDir);
    for (const file of tempFiles) {
      const tempPath = path.join(tempDir, file);
      const finalPath = path.join(inputDir, file);
      fs.renameSync(tempPath, finalPath);
    }

    // Clean up temp dir
    fs.rmdirSync(tempDir);

    console.log('✅ All images converted to WebP successfully!');
  } catch (error) {
    console.error('❌ Error converting images:', error);
    // Clean up on error
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir, { recursive: true });
    }
  }
}

convertToWebP();