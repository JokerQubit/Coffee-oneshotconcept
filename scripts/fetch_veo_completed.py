import asyncio
import os
import sys
import io
from pathlib import Path
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

async def fetch_completed():
    user_home = Path(os.environ.get('USERPROFILE', r'C:\Users\pichau'))
    automation_profile = user_home / '.gemini' / 'chrome_automation_profile'
    out_file = Path('assets/videos/veo_coffee_masterpiece.mp4')
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(automation_profile),
            channel='chrome',
            headless=True,
            viewport={'width': 1920, 'height': 1080},
            args=['--disable-blink-features=AutomationControlled']
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        print('[Veo Fetcher] Navigating to active Gemini session...')
        await page.goto('https://gemini.google.com/videos', wait_until='domcontentloaded')
        await asyncio.sleep(5)
        
        print('[Veo Fetcher] Polling for video completion...')
        for i in range(25):
            await asyncio.sleep(6)
            await page.screenshot(path='assets/videos/veo_fetch_step.png')
            
            # Check for download button
            dl_btn = page.locator("button[aria-label*='Download' i], button[aria-label*='Baixar' i], a[download]").first
            if await dl_btn.count() > 0 and await dl_btn.is_visible():
                print('💾 [Veo Fetcher] Download button visible! Clicking...')
                try:
                    async with page.expect_download(timeout=15000) as download_info:
                        await dl_btn.click()
                    download = await download_info.value
                    await download.save_as(str(out_file))
                    print(f'🎉 [Veo Fetcher] Video saved to {out_file} ({os.path.getsize(out_file)} bytes)')
                    break
                except Exception as e:
                    print(f'Note on download: {e}')
                    
            # Check video tag directly
            video_el = page.locator("video").first
            if await video_el.count() > 0:
                src = await video_el.get_attribute("src")
                if src and (src.startswith("http") or src.startswith("blob:")):
                    print(f'🎯 [Veo Fetcher] Video tag found: {src[:60]}...')
                    try:
                        import base64
                        b64 = await page.evaluate(r"""
                            async (url) => {
                                const resp = await fetch(url);
                                const blob = await resp.blob();
                                return new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                                    reader.readAsDataURL(blob);
                                });
                            }
                        """, src)
                        if b64:
                            with open(out_file, 'wb') as f:
                                f.write(base64.b64decode(b64))
                            print(f'🎉 [Veo Fetcher] Video successfully fetched from blob: {out_file} ({os.path.getsize(out_file)} bytes)')
                            break
                    except Exception as ex:
                        print(f'Note on blob extraction: {ex}')
                        
        await context.close()

if __name__ == '__main__':
    asyncio.run(fetch_completed())
