import fs from 'fs';

const filePath = './src/components/EnquiryDetail.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /className="text-\[9px\] font-bold text-gray-400 uppercase"/g,
  'className="text-[10px] min-[resolution:1.5dppx]:text-[9px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase"'
);

content = content.replace(
  /className="text-\[8px\] font-bold text-gray-400 uppercase"/g,
  'className="text-[10px] min-[resolution:1.5dppx]:text-[8px] font-bold text-gray-500 min-[resolution:1.5dppx]:text-gray-400 uppercase"'
);

content = content.replace(
  /className="text-\[8px\] font-bold text-transparent uppercase select-none"/g,
  'className="text-[10px] min-[resolution:1.5dppx]:text-[8px] font-bold text-transparent uppercase select-none"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced successfully');
