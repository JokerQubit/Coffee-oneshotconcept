import asyncio
import os
import sys
import io
import base64
from pathlib import Path
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

async def wait_and_save():
    user_home = Path(os.environ.get('USERPROFILE', r'C:\Users\pichau'))
    automation_profile = user_home / '.gemini' / 'chrome_automation_profile'
    out_dir = Path('assets/videos')
    out_video = out_dir / 'veo_coffee_masterpiece.mp4'
    
    print("🎬 [Veo Watcher] Conectando ao chat ativo...")
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(automation_profile),
            channel='chrome',
            headless=True,
            viewport={'width': 1920, 'height': 1080},
            args=['--disable-blink-features=AutomationControlled']
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        # Navigate to the latest conversation
        await page.goto('https://gemini.google.com/videos', wait_until='domcontentloaded')
        await asyncio.sleep(4)
        
        print("⏳ [Veo Watcher] Monitorando conclusão do vídeo...")
        for i in range(40):
            await asyncio.sleep(8)
            step_img = out_dir / "veo_latest_render_state.png"
            await page.screenshot(path=str(step_img))
            print(f"Verificação {i+1}/40...")
            
            # Check for download button
            dl_btn = page.locator("button[aria-label*='Download' i], button[aria-label*='Baixar' i], a[download]").first
            if await dl_btn.count() > 0 and await dl_btn.is_visible():
                print("💾 [Veo Watcher] Botão de download detectado! Baixando...")
                try:
                    async with page.expect_download(timeout=20000) as download_info:
                        await dl_btn.click()
                    download = await download_info.value
                    await download.save_as(str(out_video))
                    print(f"🎉 [Veo Watcher] Vídeo baixado com sucesso: {out_video} ({os.path.getsize(out_video)} bytes)")
                    break
                except Exception as ex:
                    print(f"Nota download: {ex}")
                    
            # Check for video element with valid src
            video_el = page.locator("video").first
            if await video_el.count() > 0:
                src = await video_el.get_attribute("src")
                if src and (src.startswith("http") or src.startswith("blob:")):
                    print(f"🎯 [Veo Watcher] Tag <video> com src={src[:60]}...")
                    try:
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
                            with open(out_video, 'wb') as f:
                                f.write(base64.b64decode(b64))
                            print(f"🎉 [Veo Watcher] Vídeo salvo via extração de Blob: {out_video} ({os.path.getsize(out_video)} bytes)")
                            break
                    except Exception as ex2:
                        print(f"Nota blob: {ex2}")
                        
        await context.close()

if __name__ == '__main__':
    asyncio.run(wait_and_save())
