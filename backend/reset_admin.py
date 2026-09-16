import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
from passlib.context import CryptContext
import uuid
from datetime import datetime

async def reset_admin():
    engine = create_async_engine('sqlite+aiosqlite:///./productivity_tracker.db')
    session_maker = async_sessionmaker(engine)
    async with session_maker() as session:
        # Delete any existing admin to avoid conflicts
        await session.execute(text("DELETE FROM users WHERE email = 'admin@company.com'"))
        
        pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
        hashed = pwd_context.hash('admin123')
        
        await session.execute(text(
            "INSERT INTO users (id, email, username, hashed_password, full_name, role, is_active, is_verified, failed_login_attempts, created_at, updated_at) "
            "VALUES (:id, :email, :username, :pwd, :name, :role, 1, 1, 0, :now, :now)"
        ), {
            'id': str(uuid.uuid4()),
            'email': 'admin@company.com',
            'username': 'admin',
            'pwd': hashed,
            'name': 'Admin User',
            'role': 'ADMIN',
            'now': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')
        })
        await session.commit()
        print('Admin reset successfully!')

if __name__ == '__main__':
    asyncio.run(reset_admin())
