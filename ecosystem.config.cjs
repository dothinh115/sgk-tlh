module.exports = {
  apps: [
    {
      name: 'sgk-tlh',
      script: '.output/server/index.mjs',
      cwd: '/apps/sgk-tlh',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '3006'
      },
      out_file: '/apps/sgk-tlh/logs/out.log',
      error_file: '/apps/sgk-tlh/logs/error.log',
      time: true
    }
  ]
}
