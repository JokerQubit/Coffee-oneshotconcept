import asyncio
import os
import sys
import io
from pathlib import Path
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

async def open_recent_video():
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
        
        print('[Veo Fetcher] Navigating to Gemini...')
        await page.goto('https://gemini.google.com/app', wait_until='domcontentloaded')
        await asyncio.sleep(4)
        
        # Click on the first recent conversation item
        recent_items = page.locator("a.conversation-title, a[data-test-id*='conversation'], a[href*='/app/']").first
        if await recent_items.count() > 0:
            text = await recent_items.inner_text()
            print(f'[Veo Fetcher] Clicking most recent chat: {text}...')
            await recent_items.click()
            await asyncio.sleep(4)
            
        await page.screenshot(path='assets/videos/recent_chat_state.png')
        print('[Veo Fetcher] Screenshot saved to assets/videos/recent_chat_state.png')
        
        # Look for video element
        video_count = await page.locator("video").count()
        print(f'[Veo Fetcher] Found {video_count} video elements in chat.')
        
        # Look for download button
        dl_btn = page.locator("button[aria-label*='Download' i], button[aria-label*='Baixar' i], a[download]").first
        if await dl_btn.count() > 0 and await dl_btn.is_visible():
            print('💾 Found download button! Triggering download...')
            try:
                async with page.expect_download(timeout=15000) as download_info:
                    await dl_btn.click()
                download = await download_info.value
                await download.save_as(str(out_file))
                print(f'🎉 Video downloaded successfully: {out_file} ({os.path.getsize(out_file)} bytes)')
            except Exception as e:
                print(f'Note on download: {e}')
                
        # If video tag has source
        if video_count > 0:
            video_el = page.locator("video").first
            src = await video_el.get_attribute("src")
            print(f'🎯 Video source found: {src}')
            if src and (src.startswith("blob:") or src.startswith("http")):
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
                        print(f'🎉 Video saved via blob extraction: {out_file} ({os.path.getsize(out_file)} bytes)')
                except Exception as ex:
                    print(f'Note on blob: {ex}')
                    
        await context.close()

if __name__ == '__main__':
    asyncio.run(open_recent_video())
