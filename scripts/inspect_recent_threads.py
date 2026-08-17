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

async def inspect_recent_threads():
    user_home = Path(os.environ.get('USERPROFILE', r'C:\Users\pichau'))
    automation_profile = user_home / '.gemini' / 'chrome_automation_profile'
    out_dir = Path('assets/videos')
    out_video = out_dir / 'veo_coffee_masterpiece.mp4'
    
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
        
        # Click on recent items by text
        recent_names = [
            "Cinematic Pyramid Night Rain Shot",
            "Solicitação de Imagem para Vídeo Anima",
            "Pirâmide do Louvre: Vídeo Noturno Chuv"
        ]
        
        for name in recent_names:
            print(f"\n--- Inspecionando thread: '{name}' ---")
            item = page.locator(f"text='{name}'").first
            if await item.count() > 0:
                await item.click()
                await asyncio.sleep(4)
                
                shot_path = out_dir / f"thread_{name.replace(' ', '_')[:20]}.png"
                await page.screenshot(path=str(shot_path))
                print(f"📸 Screenshot salvo: {shot_path}")
                
                # Check for videos
                videos = page.locator("video")
                v_count = await videos.count()
                print(f"Vídeos encontrados: {v_count}")
                
                for idx in range(v_count):
                    v_el = videos.nth(idx)
                    src = await v_el.get_attribute("src")
                    print(f"Vídeo #{idx} src: {src[:70] if src else 'None'}")
                    if src and (src.startswith("http") or src.startswith("blob:")):
                        print("🎯 Extraindo vídeo binário...")
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
                                print(f"🎉 VÍDEO SALVO COM SUCESSO EM: {out_video} ({os.path.getsize(out_video)} bytes)")
                                await context.close()
                                return
                        except Exception as e:
                            print(f"Erro blob: {e}")
                            
        await context.close()

if __name__ == '__main__':
    asyncio.run(inspect_recent_threads())
