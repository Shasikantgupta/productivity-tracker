"""
Redis Client Manager
Connection pooling and real-time data operations.
Gracefully degrades when Redis is unavailable — the app will still work.
"""
import json
from typing import Optional, Any
from loguru import logger
from app.config import settings


class RedisManager:
    """Manages Redis connections and provides helper methods.
    All operations fail gracefully if Redis is not connected."""

    def __init__(self):
        self.redis = None
        self._available = False

    async def connect(self):
        """Establish Redis connection pool. Fails gracefully."""
        try:
            import redis.asyncio as redis_lib
            self.redis = redis_lib.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=20,
            )
            await self.redis.ping()
            self._available = True
            logger.info("✅ Redis connection established")
        except Exception as e:
            self._available = False
            self.redis = None
            logger.warning(f"⚠️  Redis not available ({e}). Running without Redis — real-time features disabled.")

    async def disconnect(self):
        """Close Redis connection."""
        if self.redis:
            try:
                await self.redis.close()
            except Exception:
                pass
            self._available = False

    def _check(self) -> bool:
        """Check if Redis is available."""
        return self._available and self.redis is not None

    # ---- Session Tracking ----

    async def set_employee_online(self, employee_id: str, machine_info: dict):
        """Mark employee as online with machine details."""
        if not self._check():
            return
        try:
            key = f"online:{employee_id}"
            await self.redis.hset(key, mapping={
                "status": "online",
                "machine": json.dumps(machine_info),
                "since": str(int(__import__('time').time())),
            })
            await self.redis.expire(key, 600)  # 10 min TTL, refreshed by heartbeat
            await self.redis.sadd("online_employees", employee_id)
        except Exception as e:
            logger.warning(f"Redis set_employee_online failed: {e}")

    async def set_employee_offline(self, employee_id: str):
        """Mark employee as offline."""
        if not self._check():
            return
        try:
            await self.redis.delete(f"online:{employee_id}")
            await self.redis.srem("online_employees", employee_id)
        except Exception as e:
            logger.warning(f"Redis set_employee_offline failed: {e}")

    async def get_online_employees(self) -> set:
        """Get all currently online employee IDs."""
        if not self._check():
            return set()
        try:
            return await self.redis.smembers("online_employees")
        except Exception as e:
            logger.warning(f"Redis get_online_employees failed: {e}")
            return set()

    async def get_employee_status(self, employee_id: str) -> Optional[dict]:
        """Get employee's current online status."""
        if not self._check():
            return None
        try:
            data = await self.redis.hgetall(f"online:{employee_id}")
            return data if data else None
        except Exception as e:
            logger.warning(f"Redis get_employee_status failed: {e}")
            return None

    # ---- Activity Stream ----

    async def push_activity(self, employee_id: str, activity: dict):
        """Push real-time activity event to stream."""
        if not self._check():
            return
        try:
            key = f"activity_stream:{employee_id}"
            await self.redis.lpush(key, json.dumps(activity))
            await self.redis.ltrim(key, 0, 99)  # Keep last 100 events
            # Also publish for WebSocket subscribers
            await self.redis.publish(f"activity:{employee_id}", json.dumps(activity))
        except Exception as e:
            logger.warning(f"Redis push_activity failed: {e}")

    async def get_recent_activity(self, employee_id: str, count: int = 20) -> list:
        """Get recent activity events."""
        if not self._check():
            return []
        try:
            key = f"activity_stream:{employee_id}"
            items = await self.redis.lrange(key, 0, count - 1)
            return [json.loads(item) for item in items]
        except Exception as e:
            logger.warning(f"Redis get_recent_activity failed: {e}")
            return []

    # ---- Real-time Stats Cache ----

    async def cache_stats(self, key: str, data: dict, ttl: int = 300):
        """Cache computed statistics."""
        if not self._check():
            return
        try:
            await self.redis.setex(f"stats:{key}", ttl, json.dumps(data))
        except Exception as e:
            logger.warning(f"Redis cache_stats failed: {e}")

    async def get_cached_stats(self, key: str) -> Optional[dict]:
        """Get cached statistics."""
        if not self._check():
            return None
        try:
            data = await self.redis.get(f"stats:{key}")
            return json.loads(data) if data else None
        except Exception as e:
            logger.warning(f"Redis get_cached_stats failed: {e}")
            return None

    # ---- Heartbeat ----

    async def heartbeat(self, employee_id: str):
        """Refresh employee online status TTL."""
        if not self._check():
            return
        try:
            key = f"online:{employee_id}"
            await self.redis.expire(key, 600)
        except Exception as e:
            logger.warning(f"Redis heartbeat failed: {e}")


# Global singleton
redis_manager = RedisManager()
