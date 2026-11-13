const path = require('path');
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'BajajPPMS',
  script: path.join(__dirname, '../server/index.js')
});

svc.on('uninstall', function() {
  console.log('================================================================');
  console.log('✓ Service "BajajPPMS" has been completely uninstalled.');
  console.log('================================================================');
});

svc.on('error', function(err) {
  console.error('Uninstall Error:', err);
});

console.log('Uninstalling Bajaj PPMS Windows Service...');
svc.uninstall();
