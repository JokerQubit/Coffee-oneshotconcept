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

async def generate_coffee_veo():
    user_home = Path(os.environ.get('USERPROFILE', r'C:\Users\pichau'))
    automation_profile = user_home / '.gemini' / 'chrome_automation_profile'
    out_dir = Path('assets/videos')
    out_dir.mkdir(parents=True, exist_ok=True)
    out_video = out_dir / 'veo_coffee_masterpiece.mp4'
    image_ref = Path('assets/images/hero_lounge.jpg').resolve()
    
    with open(image_ref, 'rb') as f:
        img_b64 = base64.b64encode(f.read()).decode('utf-8')

    print("🚀 [Veo Coffee Generator] Iniciando sessão exclusiva para vídeo de café...")
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(automation_profile),
            channel='chrome',
            headless=True,
            viewport={'width': 1920, 'height': 1080},
            args=['--disable-blink-features=AutomationControlled']
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        # 1. Start fresh on /videos
        print("🌐 Navegando para https://gemini.google.com/videos ...")
        await page.goto('https://gemini.google.com/videos', wait_until='domcontentloaded')
        await asyncio.sleep(5)
        
        # 2. Inject image reference
        print("🖼️ Injetando imagem de referência do Café Lounge...")
        await page.evaluate(r"""
            async (b64) => {
                const byteCharacters = atob(b64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const file = new File([byteArray], "hero_coffee_lounge.jpg", { type: "image/jpeg" });
                
                const dt = new DataTransfer();
                dt.items.add(file);
                
                const target = document.querySelector('rich-textarea div[contenteditable="true"]') || document.querySelector('.input-area-container');
                if (target) {
                    target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
                    target.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
                }
            }
        """, img_b64)
        await asyncio.sleep(2)
        
        # 3. Enter coffee video prompt
        prompt = "Editorial 4K cinematic video of a luxury Swiss coffee atelier, steam gently rising from fine porcelain cups on a travertine stone counter, warm 3200K golden sunlight rays drifting across dark cedar wood walls, slow push-in dolly shot, 60fps, photorealistic luxury architectural roastery."
        editor = page.locator("rich-textarea div[contenteditable='true'], textarea, div[contenteditable='true']").first
        if await editor.count() > 0:
            print(f"✍️ Inserindo prompt de café: {prompt[:70]}...")
            await editor.click()
            await page.keyboard.type(prompt, delay=4)
            await asyncio.sleep(1)
            
        await page.screenshot(path='assets/videos/coffee_prompt_ready.png')
        print("📸 Screenshot salvo: assets/videos/coffee_prompt_ready.png")
        
        # 4. Click Submit
        send_btn = page.locator("button[aria-label*='Enviar' i], button[aria-label*='Send' i], button[aria-label*='Generate' i], .send-button, gem-icon-button.send-button").first
        if await send_btn.count() > 0 and await send_btn.is_visible():
            print("🚀 Clicando no botão de envio...")
            await send_btn.click()
        else:
            print("🚀 Pressionando Enter...")
            await page.keyboard.press('Enter')
            
        print("⏳ Requisição enviada! Monitorando renderização nesta mesma página (sem sair)...")
        
        # 5. Stay on this exact page and monitor the generation
        for cycle in range(50): # up to ~5 minutes
            await asyncio.sleep(6)
            current_url = page.url
            print(f"Ciclo {cycle+1}/50 | URL atual: {current_url[:60]}")
            await page.screenshot(path='assets/videos/coffee_veo_rendering.png')
            
            # Check if video tag is present
            video_el = page.locator("video").first
            if await video_el.count() > 0:
                src = await video_el.get_attribute("src")
                print(f"🎯 Tag <video> detectada: {src[:70] if src else 'no src'}")
                if src and "contribution.usercontent.google.com" in src:
                    print("📥 Baixando vídeo oficial de café via context.request...")
                    resp = await context.request.get(src)
                    if resp.status == 200:
                        video_bytes = await resp.body()
                        with open(out_video, 'wb') as f:
                            f.write(video_bytes)
                        print(f"🎉 SUCESSO! Vídeo do CAFÉ salvo em: {out_video} ({len(video_bytes)} bytes / {len(video_bytes)/(1024*1024):.2f} MB)")
                        await page.screenshot(path='assets/videos/coffee_veo_completed.png')
                        break
                        
            # Check download button
            dl_btn = page.locator("button[aria-label*='Download' i], button[aria-label*='Baixar' i], a[download]").first
            if await dl_btn.count() > 0 and await dl_btn.is_visible():
                print("💾 Botão de download visível! Clicando...")
                try:
                    async with page.expect_download(timeout=20000) as download_info:
                        await dl_btn.click()
                    download = await download_info.value
                    await download.save_as(str(out_video))
                    print(f"🎉 Vídeo de café baixado com sucesso: {out_video} ({os.path.getsize(out_video)} bytes)")
                    await page.screenshot(path='assets/videos/coffee_veo_completed.png')
                    break
                except Exception as ex:
                    print(f"Nota no download: {ex}")
                    
        await context.close()

if __name__ == '__main__':
    asyncio.run(generate_coffee_veo())
