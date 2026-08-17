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

async def test_image_and_prompt():
    user_home = Path(os.environ.get('USERPROFILE', r'C:\Users\pichau'))
    automation_profile = user_home / '.gemini' / 'chrome_automation_profile'
    out_dir = Path('assets/videos')
    out_dir.mkdir(parents=True, exist_ok=True)
    out_video = out_dir / 'veo_coffee_masterpiece.mp4'
    image_ref = Path('assets/images/hero_lounge.jpg').resolve()
    
    with open(image_ref, 'rb') as f:
        img_b64 = base64.b64encode(f.read()).decode('utf-8')

    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir=str(automation_profile),
            channel='chrome',
            headless=True,
            viewport={'width': 1920, 'height': 1080},
            args=['--disable-blink-features=AutomationControlled']
        )
        page = context.pages[0] if context.pages else await context.new_page()
        
        print("🌐 Navegando para https://gemini.google.com/videos ...")
        await page.goto('https://gemini.google.com/videos', wait_until='domcontentloaded')
        await asyncio.sleep(4)
        
        # 1. Dispatch drop event or paste event on rich-textarea
        print("🖼️ Injetando imagem de referência no editor...")
        success = await page.evaluate(r"""
            async (b64) => {
                const byteCharacters = atob(b64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const file = new File([byteArray], "hero_lounge.jpg", { type: "image/jpeg" });
                
                const dt = new DataTransfer();
                dt.items.add(file);
                
                const target = document.querySelector('rich-textarea div[contenteditable="true"]') || document.querySelector('.input-area-container');
                if (!target) return false;
                
                // Dispatch drop event
                const dropEvt = new DragEvent('drop', {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: dt
                });
                target.dispatchEvent(dropEvt);
                
                // Dispatch paste event
                const pasteEvt = new ClipboardEvent('paste', {
                    bubbles: true,
                    cancelable: true,
                    clipboardData: dt
                });
                target.dispatchEvent(pasteEvt);
                return true;
            }
        """, img_b64)
        print(f"Resultado injeção imagem: {success}")
        await asyncio.sleep(3)
        
        await page.screenshot(path='assets/videos/image_injected_state.png')
        print("📸 Salvo em assets/videos/image_injected_state.png")
        
        # 2. Type prompt
        prompt = (
            "Editorial 4K cinematic video of a luxury Swiss coffee atelier, steam gently rising from fine porcelain cups "
            "on a travertine stone counter, warm 3200K golden sunlight rays drifting across dark cedar wood walls, "
            "slow push-in dolly shot, 60fps, photorealistic luxury architectural roastery."
        )
        editor = page.locator("rich-textarea div[contenteditable='true'], div[contenteditable='true']").first
        if await editor.count() > 0:
            print(f"✍️ Inserindo prompt: {prompt[:80]}...")
            await editor.click()
            await page.keyboard.type(prompt, delay=5)
            await asyncio.sleep(1)
            
        await page.screenshot(path='assets/videos/prompt_typed_state.png')
        print("📸 Salvo em assets/videos/prompt_typed_state.png")
        
        # 3. Submit
        send_btn = page.locator("button[aria-label*='Enviar' i], button[aria-label*='Send' i], button[aria-label*='Generate' i], .send-button").first
        if await send_btn.count() > 0 and await send_btn.is_visible():
            print("🚀 Clicando botão de envio...")
            await send_btn.click()
        else:
            print("🚀 Pressionando Enter...")
            await page.keyboard.press('Enter')
            
        await asyncio.sleep(4)
        await page.screenshot(path='assets/videos/submission_state.png')
        print("📸 Salvo em assets/videos/submission_state.png")
        
        # 4. Monitor & download
        print("⏳ Acompanhando renderização do Veo...")
        for cycle in range(35):
            await asyncio.sleep(8)
            await page.screenshot(path='assets/videos/rendering_live.png')
            print(f"Ciclo {cycle+1}/35...")
            
            # Check for download button
            dl_btn = page.locator("button[aria-label*='Download' i], button[aria-label*='Baixar' i], a[download]").first
            if await dl_btn.count() > 0 and await dl_btn.is_visible():
                print("💾 Botão de download visível! Efetuando download...")
                try:
                    async with page.expect_download(timeout=15000) as download_info:
                        await dl_btn.click()
                    download = await download_info.value
                    await download.save_as(str(out_video))
                    print(f"🎉 Vídeo Veo baixado: {out_video} ({os.path.getsize(out_video)} bytes)")
                    break
                except Exception as ex:
                    print(f"Download note: {ex}")
                    
            # Check video tag with blob
            video_el = page.locator("video").first
            if await video_el.count() > 0:
                src = await video_el.get_attribute("src")
                if src and (src.startswith("http") or src.startswith("blob:")):
                    print(f"🎯 Extraindo stream de <video src='{src[:60]}...'>")
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
                            print(f"🎉 Vídeo extraído via Blob: {out_video} ({os.path.getsize(out_video)} bytes)")
                            break
                    except Exception as ex2:
                        print(f"Blob note: {ex2}")
                        
        await context.close()

if __name__ == '__main__':
    asyncio.run(test_image_and_prompt())
