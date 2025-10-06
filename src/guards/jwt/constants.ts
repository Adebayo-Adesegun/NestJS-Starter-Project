export const jwtConstants = {
  // Kept for backward compatibility; prefer ConfigService('JWT_SECRET')
  secret: process.env.JWT_SECRET || 'development-only-secret',
};
