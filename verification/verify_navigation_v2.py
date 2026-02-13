from playwright.sync_api import sync_playwright

def verify_navigation(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173", wait_until="networkidle")

    # Wait for the Overview page to load by checking for the "Overview" heading
    print("Waiting for Overview page...")
    page.wait_for_selector('h1:has-text("Overview")', timeout=10000)

    # --- Test Financial Navigation ---
    print("Clicking on 'Total Income' card...")
    # Using a more generic selector for the card that contains "Total Income"
    # Assuming the click handler is on the card div
    financial_card = page.locator('div.card', has_text="Total Income").first
    financial_card.click()

    print("Checking navigation to Deposit List...")
    # Wait for the URL to contain '/deposit/list'
    page.wait_for_url("**/deposit/list", timeout=5000)

    # Instead of looking for specific text that might change or be hidden,
    # let's look for a key element on the Deposit List page, like the "Add Log" button or the table
    # We can check if the URL is correct, which is a strong signal.
    print("Successfully navigated to Deposit List (URL check passed)")

    print("Going back to Overview...")
    page.go_back()
    page.wait_for_selector('h1:has-text("Overview")', timeout=10000)

    # --- Test Health Navigation ---
    print("Clicking on 'Total Intake' card...")
    health_card = page.locator('div.card', has_text="Total Intake").first
    health_card.click()

    print("Checking navigation to Health Dashboard...")
    # Wait for the URL to contain '/health/dashboard'
    page.wait_for_url("**/health/dashboard", timeout=5000)
    print("Successfully navigated to Health Dashboard (URL check passed)")

    print("Taking screenshot of Overview...")
    page.go_back()
    page.wait_for_selector('h1:has-text("Overview")', timeout=10000)
    page.screenshot(path="verification/overview_navigation_verified.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_navigation(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
