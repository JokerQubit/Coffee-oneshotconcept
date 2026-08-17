import asyncio
import os
import sys
import io
from pathlib import Path
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

async def trigger_and_watch():
    user_home = Path(os.environ.get('USERPROFILE', r'C:\Users\pichau'))
    automation_profile = user_home / '.gemini' / 'chrome_automation_profile'
    out_dir = Path('assets/videos')
    out_video = out_dir / 'veo_coffee_masterpiece.mp4'
    
    print("🚀 [Coffee Veo Trigger] Conectando ao Gemini Videos...")
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(automation_profile),
            channel='chrome',
            headless=True,
            viewport={'width': 1920, 'height': 1080},
            args=['--disable-blink-features=AutomationControlled']
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        await page.goto('https://gemini.google.com/videos', wait_until='domcontentloaded')
        await asyncio.sleep(4)
        
        # Click the Submit button directly
        submit_btn = page.locator("button:has-text('Submit'), button[aria-label*='Submit' i], .send-button").first
        if await submit_btn.count() > 0 and await submit_btn.is_visible():
            print("🚀 Clicando no botão Submit...")
            await submit_btn.click()
            await asyncio.sleep(3)
        else:
            # Type prompt again if empty and click submit
            editor = page.locator("rich-textarea div[contenteditable='true'], textarea, div[contenteditable='true']").first
            if await editor.count() > 0:
                prompt = "Editorial 4K cinematic video of a luxury Swiss coffee atelier, steam gently rising from fine porcelain cups on a travertine stone counter, warm 3200K golden sunlight rays drifting across dark cedar wood walls, slow push-in dolly shot, 60fps, photorealistic luxury architectural roastery."
                print("Digitando prompt...")
                await editor.click()
                await page.keyboard.type(prompt, delay=3)
                await asyncio.sleep(1)
                send = page.locator("button:has-text('Submit'), .send-button").first
                if await send.count() > 0:
                    await send.click()
                else:
                    await page.keyboard.press('Enter')
                await asyncio.sleep(3)
                
        await page.screenshot(path='assets/videos/after_coffee_submit.png')
        print("📸 Salvo em assets/videos/after_coffee_submit.png")
        
        # Monitor on this conversation page
        print("⏳ Monitorando renderização do vídeo de café...")
        for cycle in range(40):
            await asyncio.sleep(8)
            await page.screenshot(path='assets/videos/coffee_live_step.png')
            print(f"Ciclo {cycle+1}/40...")
            
            # Check video tag
            video_el = page.locator("video").first
            if await video_el.count() > 0:
                src = await video_el.get_attribute("src")
                print(f"🎯 Tag <video> detectada: {src[:70] if src else 'no src'}")
                if src and "contribution.usercontent.google.com" in src:
                    print("📥 Baixando stream de vídeo do café...")
                    resp = await context.request.get(src)
                    if resp.status == 200:
                        v_bytes = await resp.body()
                        with open(out_video, 'wb') as f:
                            f.write(v_bytes)
                        print(f"🎉 SUCESSO ABSOLUTO! VÍDEO DO CAFÉ SALVO EM: {out_video} ({len(v_bytes)} bytes / {len(v_bytes)/(1024*1024):.2f} MB)")
                        await page.screenshot(path='assets/videos/coffee_video_complete.png')
                        break
                        
            # Check download button
            dl_btn = page.locator("button[aria-label*='Download' i], button[aria-label*='Baixar' i], a[download]").first
            if await dl_btn.count() > 0 and await dl_btn.is_visible():
                print("💾 Botão de download detectado! Clicando...")
                try:
                    async with page.expect_download(timeout=20000) as download_info:
                        await dl_btn.click()
                    download = await download_info.value
                    await download.save_as(str(out_video))
                    print(f"🎉 Vídeo de café baixado via botão: {out_video} ({os.path.getsize(out_video)} bytes)")
                    await page.screenshot(path='assets/videos/coffee_video_complete.png')
                    break
                except Exception as ex:
                    print(f"Download nota: {ex}")
                    
        await context.close()

if __name__ == '__main__':
    asyncio.run(trigger_and_watch())
