import asyncio
import os
import sys
import io
from pathlib import Path
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

async def download_video_stream():
    user_home = Path(os.environ.get('USERPROFILE', r'C:\Users\pichau'))
    automation_profile = user_home / '.gemini' / 'chrome_automation_profile'
    out_dir = Path('assets/videos')
    out_video = out_dir / 'veo_coffee_masterpiece.mp4'
    
    print("🚀 [Veo Downloader] Conectando ao Gemini com context.request autenticado...")
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(automation_profile),
            channel='chrome',
            headless=True,
            viewport={'width': 1920, 'height': 1080},
            args=['--disable-blink-features=AutomationControlled']
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        await page.goto('https://gemini.google.com/app', wait_until='domcontentloaded')
        await asyncio.sleep(4)
        
        # Click on recent thread
        item = page.locator("text='Cinematic Pyramid Night Rain Shot'").first
        if await item.count() > 0:
            await item.click()
            await asyncio.sleep(4)
            
        # Find the video element src
        video_el = page.locator("video").first
        if await video_el.count() > 0:
            src = await video_el.get_attribute("src")
            print(f"🎯 URL completa do vídeo Veo: {src}")
            
            if src:
                print("📥 Baixando stream de vídeo através de context.request...")
                resp = await context.request.get(src)
                if resp.status == 200:
                    video_bytes = await resp.body()
                    with open(out_video, 'wb') as f:
                        f.write(video_bytes)
                    print(f"🎉 SUCESSO ABSOLUTO! Vídeo Veo baixado e salvo em: {out_video} ({len(video_bytes)} bytes / {len(video_bytes)/(1024*1024):.2f} MB)")
                else:
                    print(f"Status HTTP: {resp.status}")
                    
        # Check download button as second method
        dl_btn = page.locator("button[aria-label*='Download' i], button[aria-label*='Baixar' i], a[download]").first
        if await dl_btn.count() > 0 and await dl_btn.is_visible():
            print("💾 Clicando no botão de download nativo do Gemini...")
            try:
                async with page.expect_download(timeout=15000) as download_info:
                    await dl_btn.click()
                download = await download_info.value
                await download.save_as(str(out_video))
                print(f"🎉 Vídeo salvo via browser download: {out_video} ({os.path.getsize(out_video)} bytes)")
            except Exception as e:
                print(f"Nota download: {e}")
                
        await context.close()

if __name__ == '__main__':
    asyncio.run(download_video_stream())
