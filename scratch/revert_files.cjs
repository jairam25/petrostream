const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\pawar\\.gemini\\antigravity\\brain\\7e1d2104-d644-4b9e-b0b3-94061757bf65\\.system_generated\\logs\\overview.txt';
const logContent = fs.readFileSync(logPath, 'utf8');

const targetFiles = [
  'c:/Users/pawar/Downloads/petrostream/src/components/production/WellCompletionModule.tsx',
  'c:/Users/pawar/Downloads/petrostream/src/components/production/NodalAnalysisModule.tsx',
  'c:/Users/pawar/Downloads/petrostream/src/components/production/ArtificialLiftModule.tsx',
  'c:/Users/pawar/Downloads/petrostream/src/components/production/FlowAssuranceModule.tsx',
  'c:/Users/pawar/Downloads/petrostream/src/components/reservoir/PVTAnalysisTab.tsx'
];

targetFiles.forEach(file => {
    console.log(`Searching for ${file}`);
    // Find the FIRST occurrence of the file path in the log
    // and then look for the "TargetContent" key nearby.
    const searchStr = file;
    let idx = logContent.indexOf(searchStr);
    if (idx === -1) return;

    // We want the one inside a tool_call with TargetContent
    // Let's find all occurrences and pick the first one that has "TargetContent"
    let pos = 0;
    while ((pos = logContent.indexOf(searchStr, pos)) !== -1) {
        // Look backwards for the start of the JSON object or look forwards for TargetContent
        // The TargetContent should be in the same JSON object.
        // Let's find the "TargetContent" after this position.
        let targetIdx = logContent.indexOf('"TargetContent"', pos);
        if (targetIdx !== -1 && targetIdx - pos < 2000) { // arbitrary limit to ensure it's the same call
            // Found it! Now extract the string value.
            let startQuote = logContent.indexOf(':"', targetIdx);
            if (startQuote !== -1) {
                startQuote += 2; // skip :"
                // Find the end quote, but beware of escaped quotes \"
                let endQuote = startQuote;
                while (true) {
                    endQuote = logContent.indexOf('"', endQuote);
                    if (endQuote === -1) break;
                    if (logContent[endQuote - 1] !== '\\') break;
                    endQuote++;
                }
                
                if (endQuote !== -1) {
                    let escapedContent = logContent.substring(startQuote, endQuote);
                    // Unescape the content
                    let content = escapedContent
                        .replace(/\\n/g, '\n')
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\')
                        .replace(/\\t/g, '\t');
                    
                    const baseName = path.basename(file);
                    fs.writeFileSync(`scratch/${baseName}.orig.txt`, content);
                    console.log(`Recovered ${baseName}`);
                    break; // Move to next file
                }
            }
        }
        pos += searchStr.length;
    }
});
