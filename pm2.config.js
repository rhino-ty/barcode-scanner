module.exports = {
  apps: [
    {
      name: 'barcode-scanner-server',
      script: './server/dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};