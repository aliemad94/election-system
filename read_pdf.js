const fs = require('fs');
const pdf = require('pdf-parse');

(async () => {
  const buf = fs.readFileSync('../.openclaw-attachments/20260623-055753-b5050633-dc6-electoral_system_specification_v4.pdf');
  const data = await pdf(buf);
  console.log('=== PDF CONTENT ===');
  console.log(data.text);
})();
