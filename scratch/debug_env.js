import process from 'node:process';

console.log('ADMIN_ID:', JSON.stringify(process.env.ADMIN_ID));
console.log('ADMIN_PASS:', JSON.stringify(process.env.ADMIN_PASS));
console.log('All ADMIN keys:', Object.keys(process.env).filter(function(k) { return k.startsWith('ADMIN'); }));
