import { defineConfig } from "vitest/config";

// Firestore security rules tests. They need the Firestore emulator running
// (`npm run test:rules` starts it via firebase emulators:exec).
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rules/**/*.test.js"],
    testTimeout: 20000,
    fileParallelism: false,
  },
});
