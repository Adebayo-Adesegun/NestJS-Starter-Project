export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(String(process.env.PORT), 10) || 3000,
});
