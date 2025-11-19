import asyncio
from playwright.async_api import async_playwright

CHROME = "/Users/hico/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell"
BASE = "http://localhost:5641"
OUT = "docs/media"

shots = [
    ("/", "dashboard-light", "light", 1440, 900),
    ("/", "dashboard-dark", "dark", 1440, 900),
    ("/posts", "posts-light", "light", 1440, 900),
    ("/analytics", "analytics-dark", "dark", 1440, 900),
    ("/", "dashboard-mobile", "light", 390, 844),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME)
        for path, name, theme, w, h in shots:
            ctx = await browser.new_context(
                viewport={"width": w, "height": h},
                device_scale_factor=2,
                color_scheme=theme,
            )
            page = await ctx.new_page()
            # preset theme choice so next-themes picks it up
            await page.add_init_script(f"localStorage.setItem('theme','{theme}')")
            await page.goto(BASE + path, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(1800)
            await page.screenshot(path=f"{OUT}/{name}.png")
            print("saved", name)
            await ctx.close()
        await browser.close()

asyncio.run(main())
