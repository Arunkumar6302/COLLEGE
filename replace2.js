const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(directoryPath);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // We already replaced it with (import.meta.env.VITE_API_URL || "http://localhost:5000")
    // We need to upgrade it to: (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`)
    
    // String replacement for the exact previous regex injection:
    content = content.replace(/\|\| "http:\/\/localhost:5000"/g, '|| `http://${window.location.hostname}:5000`');
    
    fs.writeFileSync(file, content, 'utf8');
});

console.log("Upgraded fallback urls to dynamic hostname for mobile access!");
