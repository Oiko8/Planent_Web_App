export const DB_NAME = process.env.MYSQLDATABASE;

if (!DB_NAME) {
  throw new Error("MYSQLDATABASE is not defined");
}