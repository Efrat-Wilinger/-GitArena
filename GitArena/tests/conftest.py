"""
Pytest configuration and shared fixtures for GitArena E2E tests
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time


@pytest.fixture(scope="session")
def base_url():
    """Base URL for the application"""
    return "http://localhost:3000"


@pytest.fixture(scope="session")
def api_url():
    """Base URL for the API"""
    return "http://localhost:8000"


@pytest.fixture(scope="function")
def driver():
    """
    Create and configure Chrome WebDriver instance
    """
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Uncomment for headless mode
    # chrome_options.add_argument("--headless")
    # chrome_options.add_argument("--disable-gpu")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(10)  # Global implicit wait
    
    yield driver
    
    # Cleanup
    driver.quit()


@pytest.fixture(scope="function")
def wait(driver):
    """Explicit wait helper"""
    return WebDriverWait(driver, 20)


@pytest.fixture(scope="function")
def authenticated_driver(driver, base_url):
    """
    Driver with authenticated session
    Note: This assumes you have a test GitHub account or can mock OAuth
    """
    # Navigate to login
    driver.get(f"{base_url}/login")
    
    # Option 1: If you have test credentials, click GitHub OAuth
    # For now, we'll assume manual login or stored session
    # In real scenario, you'd handle GitHub OAuth callback
    
    # Option 2: Set auth token directly in localStorage (if you have a test token)
    # driver.execute_script("localStorage.setItem('token', 'your-test-token');")
    # driver.refresh()
    
    # For demo purposes, let's just yield the driver
    # In production, implement proper OAuth flow or token injection
    
    yield driver


@pytest.fixture(scope="function")
def create_test_project(authenticated_driver, wait, base_url):
    """
    Create a test project for testing
    Returns the project data
    """
    driver = authenticated_driver
    
    # Navigate to project creation
    driver.get(f"{base_url}/projects/new")
    
    # Fill in project details
    project_name = f"Test Project {int(time.time())}"
    
    name_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='name']"))
    )
    name_input.send_keys(project_name)
    
    # Submit form
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_button.click()
    
    # Wait for redirect
    wait.until(EC.url_contains("/manager/dashboard"))
    
    return {
        "name": project_name
    }


# Helper functions
def take_screenshot(driver, name):
    """Take screenshot for debugging"""
    timestamp = int(time.time())
    filename = f"screenshots/{name}_{timestamp}.png"
    driver.save_screenshot(filename)
    return filename


def wait_for_element(driver, by, value, timeout=10):
    """Wait for element to be present"""
    wait = WebDriverWait(driver, timeout)
    return wait.until(EC.presence_of_element_located((by, value)))


def wait_for_element_clickable(driver, by, value, timeout=10):
    """Wait for element to be clickable"""
    wait = WebDriverWait(driver, timeout)
    return wait.until(EC.element_to_be_clickable((by, value)))
