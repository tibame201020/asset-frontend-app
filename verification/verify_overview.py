from playwright.sync_api import sync_playwright

def verify(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173", wait_until="networkidle")

    print("Waiting for Overview page...")
    # Overview should be default
    # Wait for the heading
    page.wait_for_selector('h1:has-text("Overview")', timeout=10000)

    print("Checking for dashboard elements...")
    # Check for some stats
    # We might have zero data, but the labels should be there.
    # Note: i18n might take a moment to load
    page.wait_for_selector('text=Income', timeout=5000)
    page.wait_for_selector('text=Expense', timeout=5000)

    print("Taking screenshot...")
    page.screenshot(path="verification/overview.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
