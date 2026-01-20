module.exports = {
  apps: [{
    name: "api_lazimpro",
    script: "app.js",
    instances: 4,
    exec_mode: "cluster",
    watch_delay: 1000,
    ignore_watch: ["node_modules"],
  }]
}

