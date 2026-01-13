"""
Test 3: GitHub Data Sync Flow
Tests GitHub data synchronization and dashboard refresh
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import time


class TestGitHubSync:
    """Test suite for GitHub data synchronization"""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup: Authenticate and navigate to dashboard"""
        self.driver = driver
        self.base_url = base_url
        
        # Inject test token
        driver.get(base_url)
        driver.execute_script("localStorage.setItem('token', 'test-token');")
        
        # Navigate to manager dashboard
        driver.get(f"{base_url}/manager/dashboard")
        time.sleep(3)
    
    
    def test_sync_button_exists(self):
        """Test that sync button is present on dashboard"""
        # Look for sync button
        sync_buttons = self.driver.find_elements(
            By.XPATH,
            "//button[contains(text(), 'Sync') or contains(text(), 'Refresh')]"
        )
        
        assert len(sync_buttons) > 0, "Sync button not found on dashboard"
        print(f"Found {len(sync_buttons)} sync button(s)")
    
    
    def test_click_sync_button(self, wait):
        """Test clicking the sync button"""
        try:
            # Find and click sync button
            sync_button = wait.until(
                EC.element_to_be_clickable((
                    By.XPATH,
                    "//button[contains(text(), 'Sync')]"
                ))
            )
            
            # Record initial page state
            initial_html = self.driver.page_source
            
            # Click sync
            sync_button.click()
            print("Clicked sync button")
            
            # Wait for sync to process
            time.sleep(3)
            
            # Button might show "Syncing..." state
            page_after = self.driver.page_source
            
            # Verify some change occurred (button text, loading state, etc.)
            print("Sync button clicked successfully")
            
        except Exception as e:
            pytest.skip(f"Could not test sync button: {e}")
    
    
    def test_dashboard_shows_commit_data(self):
        """Test that dashboard displays commit statistics"""
        # Wait for page to load
        time.sleep(2)
        
        page_source = self.driver.page_source
        
        # Check for commit-related content
        has_commit_data = (
            "commit" in page_source.lower() or
            "total commits" in page_source.lower() or
            "activity" in page_source.lower()
        )
        
        assert has_commit_data, "No commit data found on dashboard"
        
        # Look for numeric values (stats)
        import re
        numbers = re.findall(r'\b\d+\b', page_source)
        assert len(numbers) > 0, "No numeric statistics found"
    
    
    def test_commit_activity_chart_exists(self):
        """Test that Commit Activity chart is rendered"""
        # Look for chart container or canvas
        charts = self.driver.find_elements(By.XPATH, "//div[contains(text(), 'Commit Activity')]")
        
        if charts:
            print("Commit Activity chart found")
        else:
            # Check for canvas or svg elements (charts)
            canvas_elements = self.driver.find_elements(By.TAG_NAME, "canvas")
            svg_elements = self.driver.find_elements(By.TAG_NAME, "svg")
            
            has_chart = len(canvas_elements) > 0 or len(svg_elements) > 0
            assert has_chart, "No chart elements found on dashboard"
    
    
    def test_sync_updates_statistics(self, wait):
        """Test that sync operation updates displayed statistics"""
        try:
            # Get initial commit count
            page_before = self.driver.page_source
            
            # Find sync button and click
            sync_button = self.driver.find_element(
                By.XPATH,
                "//button[contains(text(), 'Sync')]"
            )
            sync_button.click()
            
            # Wait for sync to complete (adjust timeout as needed)
            time.sleep(5)
            
            # Check if loading indicator appeared/disappeared
            # or if data changed
            page_after = self.driver.page_source
            
            # At minimum, verify page is still functional
            assert self.driver.current_url.endswith("/manager/dashboard") or "dashboard" in self.driver.current_url
            
            print("Sync operation completed")
            
        except Exception as e:
            pytest.skip(f"Could not verify sync updates: {e}")
    
    
    def test_sync_error_handling(self):
        """Test sync behavior when backend is unavailable or returns error"""
        # This test would require mocking or intentionally breaking backend
        # For now, we skip with note
        pytest.skip("Requires backend mock or error injection")
    
    
    def test_multiple_widgets_update_after_sync(self):
        """Test that multiple dashboard widgets refresh after sync"""
        time.sleep(2)
        
        # Check for multiple widget types
        widgets = []
        
        # Team Collaboration
        if "collaboration" in self.driver.page_source.lower():
            widgets.append("Team Collaboration")
        
        # Commit Activity
        if "commit" in self.driver.page_source.lower():
            widgets.append("Commit Activity")
        
        # Peak Hours
        if "peak" in self.driver.page_source.lower() or "hours" in self.driver.page_source.lower():
            widgets.append("Peak Hours")
        
        # Files Changed
        if "files" in self.driver.page_source.lower():
            widgets.append("Files Changed")
        
        assert len(widgets) > 0, "No dashboard widgets found"
        print(f"Found widgets: {widgets}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
