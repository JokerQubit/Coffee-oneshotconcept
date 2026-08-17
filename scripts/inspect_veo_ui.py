import asyncio
import os
import sys
import io
import json
from pathlib import Path
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

async def inspect_ui():
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
        
        buttons = await page.eval_on_selector_all('button', '''
            elements => elements.map(e => ({
                text: e.innerText ? e.innerText.trim() : '',
                ariaLabel: e.getAttribute('aria-label') || '',
                tag: e.tagName,
                rect: {
                    x: e.getBoundingClientRect().x,
                    y: e.getBoundingClientRect().y,
                    width: e.getBoundingClientRect().width,
                    height: e.getBoundingClientRect().height
                }
            }))
        ''')
        
        print(f"Total buttons: {len(buttons)}")
        for i, b in enumerate(buttons):
            if b['rect']['y'] > 600:
                print(f"Btn #{i}: text='{b['text']}', ariaLabel='{b['ariaLabel']}', x={b['rect']['x']:.0f}, y={b['rect']['y']:.0f}")
                
        inputs = await page.eval_on_selector_all('input', '''
            elements => elements.map(e => ({
                type: e.getAttribute('type') || '',
                accept: e.getAttribute('accept') || '',
                ariaLabel: e.getAttribute('aria-label') || ''
            }))
        ''')
        print(f"Inputs: {json.dumps(inputs, indent=2)}")
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(inspect_ui())
