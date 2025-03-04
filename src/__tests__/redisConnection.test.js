import { createRedisConnection } from "../utils/redisConfig.js";

test("Redis connection should be successful", async () => {
  const redis = createRedisConnection();
  await redis.set("test_key", "test_value");
  const value = await redis.get("test_key");

  expect(value).toBe("test_value");

  await redis.del("test_key");
  await redis.quit();
});
