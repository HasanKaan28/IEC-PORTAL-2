import asyncio
from browser_use import Agent, BrowserSession, ChatOllama

async def main():
    print("Launching Edge via browser-use...")
    session = BrowserSession(
        executable_path=r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        headless=False,
    )
    
    llm = ChatOllama(model="qwen2.5-coder:14b")
    
    agent = Agent(
        task="Go to https://www.linkedin.com and wait 10 seconds",
        llm=llm,
        browser_session=session,
        use_vision=False,
        max_actions_per_step=1,
    )
    
    print("Running agent...")
    result = await agent.run(max_steps=2)
    print("Agent run finished:", result)

if __name__ == "__main__":
    asyncio.run(main())
