import asyncio
import os
import sys
import io
from pathlib import Path
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

async def generate_veo():
    user_home = Path(os.environ.get('USERPROFILE', r'C:\Users\pichau'))
    automation_profile = user_home / '.gemini' / 'chrome_automation_profile'
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(automation_profile),
            channel='chrome',
            headless=True,
            viewport={'width': 1920, 'height': 1080},
            args=['--disable-blink-features=AutomationControlled']
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        print('[Veo Studio] Navigating directly to https://gemini.google.com/videos ...')
        await page.goto('https://gemini.google.com/videos', wait_until='domcontentloaded')
        await asyncio.sleep(5)
        
        await page.screenshot(path='assets/videos/veo_studio_state.png')
        print('[Veo Studio] State saved to assets/videos/veo_studio_state.png')
        
        # Look for the input field on /videos
        editor = page.locator("rich-textarea div[contenteditable='true'], textarea, div[contenteditable='true'], input[type='text']").first
        if await editor.count() > 0:
            prompt = "Editorial 4K cinematic video of a luxury Swiss coffee atelier, steam gently rising from fine porcelain cups on a travertine stone counter, warm 3200K golden sunlight rays drifting across dark cedar wood walls, slow push-in dolly shot, 60fps, photorealistic"
            print(f"[Veo Studio] Ingesting prompt: {prompt}")
            await editor.click()
            await page.keyboard.type(prompt, delay=6)
            await asyncio.sleep(1)
            
            send_btn = page.locator("button[aria-label*='Enviar' i], button[aria-label*='Send' i], button[aria-label*='Generate' i], button[aria-label*='Gerar' i], .send-button").first
            if await send_btn.count() > 0 and await send_btn.is_visible():
                print('[Veo Studio] Clicking send/generate button...')
                await send_btn.click()
            else:
                print('[Veo Studio] Pressing Enter...')
                await page.keyboard.press('Enter')
                
            print('[Veo Studio] Monitoring Veo rendering...')
            for i in range(18):
                await asyncio.sleep(8)
                await page.screenshot(path='assets/videos/veo_rendering_progress.png')
                print(f'[Veo Studio] Checking progress {i+1}/18...')
                
                # Check for video element
                video_count = await page.locator("video").count()
                if video_count > 0:
                    video_el = page.locator("video").first
                    src = await video_el.get_attribute("src")
                    if src and (src.startswith("blob:") or src.startswith("http")):
                        print(f'[Veo Studio] Found video source: {src[:60]}...')
                    
                # Check download button
                dl_btn = page.locator("button[aria-label*='Download' i], button[aria-label*='Baixar' i], a[download]").first
                if await dl_btn.count() > 0 and await dl_btn.is_visible():
                    print('[Veo Studio] Triggering video download...')
                    try:
                        async with page.expect_download(timeout=10000) as download_info:
                            await dl_btn.click()
                        download = await download_info.value
                        out_path = Path('assets/videos/veo_coffee_masterpiece.mp4')
                        await download.save_as(str(out_path))
                        print(f'[Veo Studio] Veo video saved successfully to: {out_path}')
                        break
                    except Exception as e:
                        print(f'[Veo Studio] Download handler note: {e}')
        else:
            print('[Veo Studio] Editor input not directly found, capturing state...')
            await page.screenshot(path='assets/videos/veo_not_found.png')
                        
        await context.close()

if __name__ == '__main__':
    asyncio.run(generate_veo())
