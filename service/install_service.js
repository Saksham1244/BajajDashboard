const path = require('path');
const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'BajajPPMS',
  displayName: 'Bajaj PPMS Command Center',
  description: 'Production Performance Management System (PPMS) - Bajaj Auto Pantnagar Plant (Backend API + Web Dashboard)',
  script: path.join(__dirname, '../server/index.js'),
  nodeOptions: [
    '--harmony'
  ],
  workingDirectory: path.join(__dirname, '../server'),
  env: [
    {
      name: 'NODE_ENV',
      value: 'production'
    },
    {
      name: 'PORT',
      value: '5000'
    }
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
  console.log('================================================================');
  console.log('✓ Service "BajajPPMS" installed successfully!');
  console.log('  Starting service now...');
  svc.start();
  console.log('✓ Service started! Access the dashboard at http://localhost:5000');
  console.log('================================================================');
});

svc.on('alreadyinstalled', function() {
  console.log('⚠ Service "BajajPPMS" is already installed.');
  console.log('  Starting existing service...');
  svc.start();
});

svc.on('start', function() {
  console.log('✓ Bajaj PPMS Service is running.');
});

svc.on('error', function(err) {
  console.error('Service Error:', err);
});

console.log('Installing Bajaj PPMS Command Center as a Windows Service...');
console.log('Target script:', path.join(__dirname, '../server/index.js'));
svc.install();
