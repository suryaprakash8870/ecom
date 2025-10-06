const os = require('os');

function getLanIPv4() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName of Object.keys(interfaces)) {
    const addresses = interfaces[interfaceName] || [];
    for (const address of addresses) {
      const isIPv4 = address.family === 'IPv4' || address.family === 4;
      const isInternal = address.internal === true;
      const isApipa = typeof address.address === 'string' && address.address.startsWith('169.254.');
      if (isIPv4 && !isInternal && !isApipa) {
        return address.address;
      }
    }
  }
  return null;
}

function printLanUrl(port) {
  const ip = getLanIPv4();
  if (ip) {
    // Match Next.js banner style
    console.log(`\n  Network:        http://${ip}:${port}\n`);
  }
}

const portFromArg = process.argv[2];
const port = portFromArg && /^\d+$/.test(portFromArg) ? portFromArg : process.env.PORT || '3000';
printLanUrl(port);


