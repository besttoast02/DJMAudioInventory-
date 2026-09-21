import httpx
import asyncio

async def test():
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(
            "http://127.0.0.1:3002/api/telegram/webhook",
            headers={"x-telegram-bot-api-secret-token": "djmaudio12345"},
            json={
                "message": {
                    "chat": {"id": 123456789},
                    "text": "Do you have any speakers?"
                }
            }
        )
        print(res.status_code, res.text)

asyncio.run(test())
