const fs = require('fs');
const pdf = require('pdf-parse');

(async () => {
  const buf = fs.readFileSync('../.openclaw-attachments/20260623-055753-b5050633-dc6-electoral_system_specification_v4.pdf');
  const d = await pdf(buf);
  
  const lines = d.text.split('\n');
  const clean = lines.filter(l => {
    const t = l.trim();
    if (t.length < 3) return false;
    const cleanChars = t.replace(/[\u0600-\u06FF\u0750-\u077F\s\d\w.,:;!?()\/\-%#@|*+=<>[\]{}«»""''،؛؟×÷ـ]+/g, '');
    return cleanChars.length / t.length < 0.3;
  });
  
  console.log('=== CLEANED TEXT ===');
  clean.forEach(l => console.log(l.trim()));
  console.log('\nTotal clean lines:', clean.length);
})();
