"""
Redis Client Manager
Connection pooling and real-time data operations
"""
import json
from typing import Optional, Any
import redis.asyncio as redis
from loguru import logger
from app.config import settings


class RedisManager:
    """Manages Redis connections and provides helper methods."""

    def __init__(self):
        self.redis: Optional[redis.Redis] = None

    async def connect(self):
        """Establish Redis connection pool."""
        self.redis = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
        await self.redis.ping()
        logger.info("Redis connection established")

    async def disconnect(self):
        """Close Redis connection."""
        if self.redis:
            await self.redis.close()

    # ---- Session Tracking ----

    async def set_employee_online(self, employee_id: str, machine_info: dict):
        """Mark employee as online with machine details."""
        key = f"online:{employee_id}"
        await self.redis.hset(key, mapping={
            "status": "online",
            "machine": json.dumps(machine_info),
            "since": str(int(__import__('time').time())),
        })
        await self.redis.expire(key, 600)  # 10 min TTL, refreshed by heartbeat
        await self.redis.sadd("online_employees", employee_id)

    async def set_employee_offline(self, employee_id: str):
        """Mark employee as offline."""
        await self.redis.delete(f"online:{employee_id}")
        await self.redis.srem("online_employees", employee_id)

    async def get_online_employees(self) -> set:
        """Get all currently online employee IDs."""
        return await self.redis.smembers("online_employees")

    async def get_employee_status(self, employee_id: str) -> Optional[dict]:
        """Get employee's current online status."""
        data = await self.redis.hgetall(f"online:{employee_id}")
        return data if data else None

    # ---- Activity Stream ----

    async def push_activity(self, employee_id: str, activity: dict):
        """Push real-time activity event to stream."""
        key = f"activity_stream:{employee_id}"
        await self.redis.lpush(key, json.dumps(activity))
        await self.redis.ltrim(key, 0, 99)  # Keep last 100 events
        # Also publish for WebSocket subscribers
        await self.redis.publish(f"activity:{employee_id}", json.dumps(activity))

    async def get_recent_activity(self, employee_id: str, count: int = 20) -> list:
        """Get recent activity events."""
        key = f"activity_stream:{employee_id}"
        items = await self.redis.lrange(key, 0, count - 1)
        return [json.loads(item) for item in items]

    # ---- Real-time Stats Cache ----

    async def cache_stats(self, key: str, data: dict, ttl: int = 300):
        """Cache computed statistics."""
        await self.redis.setex(f"stats:{key}", ttl, json.dumps(data))

    async def get_cached_stats(self, key: str) -> Optional[dict]:
        """Get cached statistics."""
        data = await self.redis.get(f"stats:{key}")
        return json.loads(data) if data else None

    # ---- Heartbeat ----

    async def heartbeat(self, employee_id: str):
        """Refresh employee online status TTL."""
        key = f"online:{employee_id}"
        await self.redis.expire(key, 600)


# Global singleton
redis_manager = RedisManager()
