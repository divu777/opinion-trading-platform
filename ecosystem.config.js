module.exports = {
  apps: [
    {
      name: "nextjs-app",
      cwd: "./apps/nextjs",
      script: "bun",
      args: "start", // runs next start (prod mode)
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "backend",
      cwd: "./apps/backend",
      script: "bun",
      args: "start", // assuming package.json has "start": "node dist/index.js" but you run via bun
      env: {
        NODE_ENV: "production",
        PORT: 8000
      }
    },
    {
      name: "web-socket",
      cwd: "./apps/web-socket",
      script: "node",
      args: "start", // after TS build outputs dist/index.js
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
};
