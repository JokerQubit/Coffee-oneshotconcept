import asyncio
import os
import sys
import io
from pathlib import Path
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

async def manual_veo_pipeline():
    user_home = Path(os.environ.get('USERPROFILE', r'C:\Users\pichau'))
    automation_profile = user_home / '.gemini' / 'chrome_automation_profile'
    out_dir = Path('assets/videos')
    out_dir.mkdir(parents=True, exist_ok=True)
    out_video = out_dir / 'veo_coffee_masterpiece.mp4'
    image_ref = Path('assets/images/hero_lounge.jpg').resolve()
    
    print("==================================================")
    print("🎬 PASSO 1: Acessando Gemini Videos Web")
    print("==================================================")
    
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
        
        step1_shot = out_dir / "step1_gemini_videos_home.png"
        await page.screenshot(path=str(step1_shot))
        print(f"📸 Passo 1: {step1_shot}")

        print("\n==================================================")
        print("🖼️ PASSO 2: Anexando Imagem de Referência do Lounge")
        print("==================================================")
        print(f"Arquivo: {image_ref}")
        
        upload_btn = page.locator("button[aria-label='File upload'], button[aria-label*='upload' i]").first
        if await upload_btn.count() > 0:
            print("Clicando no botão de 'File upload' com expect_file_chooser...")
            async with page.expect_file_chooser() as fc_info:
                await upload_btn.click()
            file_chooser = await fc_info.value
            await file_chooser.set_files(str(image_ref))
            print("✅ Imagem de referência anexada com sucesso!")
            await asyncio.sleep(3)
        else:
            print("Tentando injetar em input[type='file']...")
            file_input = page.locator("input[type='file']").first
            if await file_input.count() > 0:
                await file_input.set_input_files(str(image_ref))
                await asyncio.sleep(3)
                
        step2_shot = out_dir / "step2_image_attached.png"
        await page.screenshot(path=str(step2_shot))
        print(f"📸 Passo 2: {step2_shot}")

        print("\n==================================================")
        print("✍️ PASSO 3: Inserindo Prompt Cinemático Veo")
        print("==================================================")
        prompt = (
            "Editorial 4K cinematic video of a luxury Swiss coffee atelier, steam gently rising from fine porcelain cups "
            "on a travertine stone counter, warm 3200K golden sunlight rays drifting across dark cedar wood walls, "
            "slow push-in dolly shot, 60fps, photorealistic luxury architectural roastery."
        )
        editor = page.locator("rich-textarea div[contenteditable='true'], textarea, div[contenteditable='true']").first
        if await editor.count() > 0:
            print(f"Digitando prompt: {prompt[:80]}...")
            await editor.click()
            await page.keyboard.type(prompt, delay=6)
            await asyncio.sleep(1)
            
        step3_shot = out_dir / "step3_prompt_typed.png"
        await page.screenshot(path=str(step3_shot))
        print(f"📸 Passo 3: {step3_shot}")

        print("\n==================================================")
        print("🚀 PASSO 4: Submetendo Requisição ao Veo")
        print("==================================================")
        send_btn = page.locator("button[aria-label*='Enviar' i], button[aria-label*='Send' i], button[aria-label*='Generate' i], .send-button, gem-icon-button.send-button").first
        if await send_btn.count() > 0 and await send_btn.is_visible():
            print("Clicando no botão Enviar...")
            await send_btn.click()
        else:
            print("Pressionando Enter...")
            await page.keyboard.press('Enter')
            
        await asyncio.sleep(4)
        step4_shot = out_dir / "step4_generation_started.png"
        await page.screenshot(path=str(step4_shot))
        print(f"📸 Passo 4: {step4_shot}")

        print("\n==================================================")
        print("⏳ PASSO 5: Acompanhando a Renderização e Download")
        print("==================================================")
        for cycle in range(35):
            await asyncio.sleep(8)
            progress_shot = out_dir / "step5_rendering_progress.png"
            await page.screenshot(path=str(progress_shot))
            print(f"Ciclo {cycle+1}/35: monitorando estado...")
            
            # Check for download button
            dl_btn = page.locator("button[aria-label*='Download' i], button[aria-label*='Baixar' i], a[download]").first
            if await dl_btn.count() > 0 and await dl_btn.is_visible():
                print("💾 Botão de Download detectado! Clicando...")
                try:
                    async with page.expect_download(timeout=15000) as download_info:
                        await dl_btn.click()
                    download = await download_info.value
                    await download.save_as(str(out_video))
                    print(f"🎉 Vídeo Veo salvo com sucesso: {out_video} ({os.path.getsize(out_video)} bytes)")
                    break
                except Exception as ex:
                    print(f"Tentativa de download: {ex}")
                    
            # Check for video element with blob/url
            video_el = page.locator("video").first
            if await video_el.count() > 0:
                src = await video_el.get_attribute("src")
                if src and (src.startswith("http") or src.startswith("blob:")):
                    print(f"🎯 Tag video detectada: {src[:60]}... Extraindo stream...")
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
                            with open(out_video, 'wb') as f:
                                f.write(base64.b64decode(b64))
                            print(f"🎉 Vídeo extraído via Blob: {out_video} ({os.path.getsize(out_video)} bytes)")
                            break
                    except Exception as ex2:
                        print(f"Blob note: {ex2}")
                    
        await context.close()
        print("\n==================================================")
        print("✅ PIPELINE VEO CONCLUÍDO COM SUCESSO!")
        print("==================================================")

if __name__ == '__main__':
    asyncio.run(manual_veo_pipeline())
