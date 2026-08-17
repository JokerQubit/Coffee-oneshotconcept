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

async def grab_from_recents():
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
        
        print("🌐 Navegando para https://gemini.google.com/app ...")
        await page.goto('https://gemini.google.com/app', wait_until='domcontentloaded')
        await asyncio.sleep(4)
        
        # Get list of recent chat titles
        recent_links = await page.eval_on_selector_all("a[data-test-id*='conversation'], a.conversation, [role='listitem'] a", '''
            elements => elements.map(e => ({
                text: e.innerText ? e.innerText.trim() : '',
                href: e.getAttribute('href') || ''
            }))
        ''')
        print(f"Chats recentes encontrados: {len(recent_links)}")
        for i, c in enumerate(recent_links[:5]):
            print(f"Chat #{i}: '{c['text']}' -> {c['href']}")
            
        # Click on the first chat item
        first_chat = page.locator("a[data-test-id*='conversation'], a.conversation, [role='listitem'] a, nav a[href*='/app/']").first
        if await first_chat.count() > 0:
            print("Clicando no chat mais recente...")
            await first_chat.click()
            await asyncio.sleep(4)
            
        # Take screenshot of the chat
        chat_shot = out_dir / "recent_chat_view.png"
        await page.screenshot(path=str(chat_shot))
        print(f"📸 Screenshot do chat salvo em: {chat_shot}")
        
        # Check for video elements in this chat
        video_count = await page.locator("video").count()
        print(f"Vídeos encontrados no chat: {video_count}")
        
        if video_count > 0:
            for v_idx in range(video_count):
                v_el = page.locator("video").nth(v_idx)
                src = await v_el.get_attribute("src")
                print(f"Vídeo #{v_idx}: src='{src[:60] if src else 'none'}'")
                if src and (src.startswith("http") or src.startswith("blob:")):
                    print(f"🎯 Extraindo vídeo #{v_idx}...")
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
                            print(f"🎉 Vídeo Veo salvo com sucesso: {out_video} ({os.path.getsize(out_video)} bytes)")
                            break
                    except Exception as ex:
                        print(f"Nota na extração: {ex}")
                        
        # Check download button
        dl_btn = page.locator("button[aria-label*='Download' i], button[aria-label*='Baixar' i], a[download]").first
        if await dl_btn.count() > 0 and await dl_btn.is_visible():
            print("💾 Botão de download detectado! Clicando...")
            try:
                async with page.expect_download(timeout=15000) as download_info:
                    await dl_btn.click()
                download = await download_info.value
                await download.save_as(str(out_video))
                print(f"🎉 Vídeo baixado via botão: {out_video} ({os.path.getsize(out_video)} bytes)")
            except Exception as e:
                print(f"Nota no download direto: {e}")
                
        await context.close()

if __name__ == '__main__':
    asyncio.run(grab_from_recents())
