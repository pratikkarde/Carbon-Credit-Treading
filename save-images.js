const fs = require('fs');
const path = require('path');

// Create the directory if it doesn't exist
const imagesDir = path.join(__dirname, 'assets', 'images', 'projects');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Solar Farm Image
const solarFarmPath = path.join(imagesDir, 'solar-farm.jpg');
if (!fs.existsSync(solarFarmPath)) {
    console.log('Creating solar farm image placeholder...');
    fs.writeFileSync(solarFarmPath, 'Solar Farm Image Placeholder');
}

// Wind Farm Image
const windFarmPath = path.join(imagesDir, 'wind-farm.jpg');
if (!fs.existsSync(windFarmPath)) {
    console.log('Creating wind farm image placeholder...');
    fs.writeFileSync(windFarmPath, 'Wind Farm Image Placeholder');
}

// Forest Image
const forestPath = path.join(imagesDir, 'forest.jpg');
if (!fs.existsSync(forestPath)) {
    console.log('Creating forest image placeholder...');
    fs.writeFileSync(forestPath, 'Forest Image Placeholder');
}

console.log('Image placeholders created successfully!');
console.log('Please replace these placeholder files with actual images:');
console.log(`1. Solar Farm: ${solarFarmPath}`);
console.log(`2. Wind Farm: ${windFarmPath}`);
console.log(`3. Forest: ${forestPath}`); 