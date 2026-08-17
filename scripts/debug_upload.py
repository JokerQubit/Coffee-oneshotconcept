import asyncio
import os
import sys
import io
from pathlib import Path
from playwright.async_api import async_playwright

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

async def debug_upload():
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
        
        # Click the file upload button
        upload_btn = page.locator("button[aria-label='File upload']").first
        print("Clicking button[aria-label='File upload']...")
        await upload_btn.click()
        await asyncio.sleep(2)
        
        # Screenshot after clicking
        await page.screenshot(path='assets/videos/after_click_upload.png')
        print("Saved assets/videos/after_click_upload.png")
        
        # Check all menus/dialogs and inputs now present
        inputs = await page.eval_on_selector_all('input', '''
            elements => elements.map(e => ({
                type: e.type,
                accept: e.accept,
                className: e.className
            }))
        ''')
        print("Inputs after click:", inputs)
        
        menu_items = await page.eval_on_selector_all('[role="menuitem"], .mat-mdc-menu-item, button', '''
            elements => elements.filter(e => e.offsetParent !== null).map(e => ({
                text: e.innerText ? e.innerText.trim() : '',
                ariaLabel: e.getAttribute('aria-label') || ''
            }))
        ''')
        print("Visible interactive items:", [m for m in menu_items if m['text'] or m['ariaLabel']])
        
        await context.close()

if __name__ == '__main__':
    asyncio.run(debug_upload())
