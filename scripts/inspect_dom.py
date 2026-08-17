import asyncio
import os
import sys
import io
from pathlib import Path
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

async def inspect_dom():
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
        await page.goto('https://gemini.google.com/videos', wait_until='domcontentloaded')
        await asyncio.sleep(4)
        
        # Get HTML of the prompt container
        html = await page.eval_on_selector('.chat-input-container, rich-textarea, .input-area-container, body', '''
            el => {
                const btn = document.querySelector('button[aria-label="File upload"]');
                return {
                    buttonOuter: btn ? btn.outerHTML : 'null',
                    buttonParent: btn && btn.parentElement ? btn.parentElement.outerHTML : 'null',
                    allInputs: Array.from(document.querySelectorAll('input')).map(i => i.outerHTML)
                };
            }
        ''')
        print("Button HTML:", html['buttonOuter'])
        print("Button Parent:", html['buttonParent'])
        print("All Inputs:", html['allInputs'])
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(inspect_dom())
