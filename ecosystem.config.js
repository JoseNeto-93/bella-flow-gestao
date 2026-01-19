module.exports = {
  apps: [
    {
      name: 'bella-flow-backend',
      script: './backend/server.js',
      cwd: './',
      exec_mode: 'cluster',
      instances: 'max',
      autorestart: true,
      watch: false,
      max_restarts: 5,
      env: {
        NODE_ENV: 'development',
        PORT: 3333
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3333
      }
    }
  ]
};
