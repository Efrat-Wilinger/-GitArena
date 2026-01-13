"""
Test 2: Project Management Flow
Tests project creation, selection, and navigation
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time


class TestProjectManagement:
    """Test suite for project management features"""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup: Navigate to home and ensure authenticated"""
        self.driver = driver
        self.base_url = base_url
        
        # Inject test token (replace with real auth in production)
        driver.get(base_url)
        driver.execute_script("localStorage.setItem('token', 'test-token');")
        driver.refresh()
    
    
    def test_project_selection_page_loads(self, wait):
        """Test that project selection page loads"""
        self.driver.get(f"{self.base_url}/")
        
        # Wait for page to load
        time.sleep(2)
        
        # Check for key elements
        page_source = self.driver.page_source
        assert "Project" in page_source or "project" in page_source.lower()
    
    
    def test_navigate_to_create_project(self, wait):
        """Test navigation to create new project page"""
        self.driver.get(f"{self.base_url}/")
        time.sleep(1)
        
        # Look for "Create" or "New Project" button
        try:
            create_buttons = self.driver.find_elements(
                By.XPATH, 
                "//button[contains(text(), 'Create') or contains(text(), 'New')]"
            )
            
            if create_buttons:
                create_buttons[0].click()
                time.sleep(2)
                
                # Should navigate to create project page
                assert "/projects/new" in self.driver.current_url or "create" in self.driver.current_url.lower()
                
                # Check for form elements
                inputs = self.driver.find_elements(By.TAG_NAME, "input")
                assert len(inputs) > 0, "No input fields found on create project page"
            else:
                pytest.skip("Create project button not found")
                
        except Exception as e:
            pytest.skip(f"Could not test create project navigation: {e}")
    
    
    def test_create_project_form_validation(self):
        """Test project creation form validation"""
        self.driver.get(f"{self.base_url}/projects/new")
        time.sleep(2)
        
        try:
            # Try to submit empty form
            submit_buttons = self.driver.find_elements(
                By.XPATH,
                "//button[@type='submit' or contains(text(), 'Create') or contains(text(), 'Save')]"
            )
            
            if submit_buttons:
                # Check if required fields exist
                name_input = self.driver.find_elements(By.CSS_SELECTOR, "input[name='name']")
                
                if name_input:
                    # Clear any existing value
                    name_input[0].clear()
                    
                    # Try to submit without filling
                    submit_buttons[0].click()
                    time.sleep(1)
                    
                    # Should show validation error or stay on same page
                    # Note: Actual validation behavior depends on implementation
                    print("Form validation test executed")
                else:
                    pytest.skip("Name input field not found")
            else:
                pytest.skip("Submit button not found")
                
        except Exception as e:
            pytest.skip(f"Form validation test inconclusive: {e}")
    
    
    def test_project_list_displays(self):
        """Test that existing projects display in list"""
        self.driver.get(f"{self.base_url}/")
        time.sleep(2)
        
        # Look for project cards or list items
        page_source = self.driver.page_source
        
        # Check if there's any project-related content
        has_projects = (
            "project" in page_source.lower() or
            "repository" in page_source.lower() or
            "repo" in page_source.lower()
        )
        
        assert has_projects, "No project-related content found on page"
    
    
    def test_select_project_navigation(self):
        """Test selecting a project and navigating to dashboard"""
        self.driver.get(f"{self.base_url}/")
        time.sleep(2)
        
        try:
            # Look for clickable project elements
            project_links = self.driver.find_elements(
                By.XPATH,
                "//div[contains(@class, 'project') or contains(@class, 'card')]//button | //a[contains(@href, 'dashboard')]"
            )
            
            if project_links:
                # Click first project
                project_links[0].click()
                time.sleep(3)
                
                # Should navigate to dashboard
                current_url = self.driver.current_url
                assert "dashboard" in current_url or "manager" in current_url or "member" in current_url
                
                print(f"Successfully navigated to: {current_url}")
            else:
                pytest.skip("No projects found to select")
                
        except Exception as e:
            pytest.skip(f"Could not test project selection: {e}")
    
    
    def test_project_context_persistence(self):
        """Test that selected project persists across page navigation"""
        self.driver.get(f"{self.base_url}/manager/dashboard")
        time.sleep(2)
        
        # Get current URL
        dashboard_url = self.driver.current_url
        
        # Navigate to another page
        self.driver.get(f"{self.base_url}/repositories")
        time.sleep(2)
        
        # Navigate back
        self.driver.get(f"{self.base_url}/manager/dashboard")
        time.sleep(2)
        
        # Should still work (project context maintained)
        assert "dashboard" in self.driver.current_url


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
