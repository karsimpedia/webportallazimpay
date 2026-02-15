module.exports = {
  apps: [
    {
      name: "api_webportal",

      script: "src/server.js",

      // ===== CLUSTER MODE =====
      instances: "max", // otomatis sesuai jumlah core CPU
      exec_mode: "cluster",

      // ===== ENV =====
      env: {
        NODE_ENV: "development",
        PORT: 3005,
      },

      env_production: {
        NODE_ENV: "production",
        PORT: 3005,
        CORS_ORIGIN: "https://console.lazimpay.com",
      },

      // ===== AUTO RESTART =====
      autorestart: true,
      watch: false,

      max_memory_restart: "500M", // restart kalau memory > 500MB

      // // ===== LOGGING =====
      // error_file: "/var/log/api_webportal/error.log",
      // out_file: "/var/log/api_webportal/out.log",
      // log_file: "/var/log/api_webportal/combined.log",
      // time: true,

      // ===== PERFORMANCE =====
      kill_timeout: 5000,
      listen_timeout: 8000,
      min_uptime: "10s",
      max_restarts: 10,

      // ===== BACKOFF RESTART =====
      exp_backoff_restart_delay: 100,

      // ===== NODE OPTIONS =====
      node_args: "--max-old-space-size=512",

      // ===== MERGE LOG CLUSTER =====
      merge_logs: true,
    },
  ],
};
