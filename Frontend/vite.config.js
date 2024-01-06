export default defineConfig({
    // ...other config
    server: {
      proxy: {
        '/api': 'http://localhost:4000'
      }
    }
  });
  