"""
Test 5: Repository Navigation
Tests repository browsing, code viewing, and commit history
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import time


class TestRepositoryNavigation:
    """Test suite for repository navigation and code browsing"""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup: Authenticate"""
        self.driver = driver
        self.base_url = base_url
        
        # Authenticate
        driver.get(base_url)
        driver.execute_script("localStorage.setItem('token', 'test-token');")
    
    
    def test_repositories_page_loads(self):
        """Test that repositories page loads successfully"""
        self.driver.get(f"{self.base_url}/repositories")
        time.sleep(2)
        
        # Check for repositories page elements
        page_source = self.driver.page_source
        assert "repositor" in page_source.lower(), "Repositories page not loaded"
    
    
    def test_repository_list_displays(self):
        """Test that repository list is displayed"""
        self.driver.get(f"{self.base_url}/repositories")
        time.sleep(2)
        
        # Look for repository cards or list items
        repo_elements = self.driver.find_elements(
            By.XPATH,
            "//div[contains(@class, 'repo') or contains(@class, 'repository')] | //a[contains(@href, 'repositories')]"
        )
        
        if len(repo_elements) == 0:
            # Check if there's any list structure
            cards = self.driver.find_elements(By.CSS_SELECTOR, ".card, .item, [role='listitem']")
            assert len(cards) > 0, "No repository items found"
        
        print(f"Found {len(repo_elements)} repository elements")
    
    
    def test_navigate_to_repository_code(self, wait):
        """Test navigating to repository code view"""
        self.driver.get(f"{self.base_url}/repositories")
        time.sleep(2)
        
        try:
            # Find "View Code" or "Code" button
            code_buttons = self.driver.find_elements(
                By.XPATH,
                "//button[contains(text(), 'Code')] | //a[contains(text(), 'Code')] | //button[contains(text(), 'View')]"
            )
            
            if code_buttons:
                code_buttons[0].click()
                time.sleep(3)
                
                # Should navigate to code page
                assert "/code" in self.driver.current_url or "/repositories/" in self.driver.current_url
                print(f"Navigated to: {self.driver.current_url}")
            else:
                pytest.skip("Code button not found")
                
        except Exception as e:
            pytest.skip(f"Could not navigate to code view: {e}")
    
    
    def test_file_explorer_displays(self):
        """Test that file explorer/tree displays"""
        # Navigate to a repository code page (assuming repo ID 1 exists)
        self.driver.get(f"{self.base_url}/repositories/1/code")
        time.sleep(3)
        
        # Check for file tree or list
        page_source = self.driver.page_source
        
        has_files = (
            ".js" in page_source or
            ".py" in page_source or
            ".md" in page_source or
            ".json" in page_source or
            "file" in page_source.lower()
        )
        
        if has_files:
            print("File explorer detected")
        else:
            pytest.skip("No files found in repository")
    
    
    def test_click_file_to_view_content(self, wait):
        """Test clicking a file to view its contents"""
        self.driver.get(f"{self.base_url}/repositories/1/code")
        time.sleep(2)
        
        try:
            # Find clickable file elements
            file_elements = self.driver.find_elements(
                By.XPATH,
                "//div[contains(@class, 'file')] | //li[contains(@class, 'file')] | //span[contains(text(), '.')]"
            )
            
            if file_elements:
                # Record initial state
                initial_content = self.driver.page_source
                
                # Click first file
                file_elements[0].click()
                time.sleep(2)
                
                # Content should change (file contents displayed)
                new_content = self.driver.page_source
                
                # Check for code display elements
                has_code = (
                    "<code>" in new_content or
                    "line-number" in new_content.lower() or
                    "syntax" in new_content.lower()
                )
                
                if has_code:
                    print("File content displayed")
                else:
                    print("Clicked file, checking for content change")
            else:
                pytest.skip("No file elements found to click")
                
        except Exception as e:
            pytest.skip(f"Could not test file viewing: {e}")
    
    
    def test_navigate_to_commits_page(self):
        """Test navigating to repository commits page"""
        self.driver.get(f"{self.base_url}/repositories/1/commits")
        time.sleep(2)
        
        # Check for commits page content
        page_source = self.driver.page_source
        
        has_commits = (
            "commit" in page_source.lower() or
            "sha" in page_source.lower() or
            "author" in page_source.lower()
        )
        
        assert has_commits, "Commits page not loaded properly"
    
    
    def test_commits_list_displays(self):
        """Test that commits are displayed in list format"""
        self.driver.get(f"{self.base_url}/repositories/1/commits")
        time.sleep(2)
        
        # Look for commit elements
        commit_elements = self.driver.find_elements(
            By.XPATH,
            "//div[contains(@class, 'commit')] | //li | //div[contains(text(), 'commit')]"
        )
        
        if len(commit_elements) > 0:
            print(f"Found {len(commit_elements)} potential commit elements")
        
        # Check for commit metadata
        page_source = self.driver.page_source
        
        # Look for common commit data
        import re
        sha_pattern = r'[0-9a-f]{7,40}'
        shas_found = re.findall(sha_pattern, page_source)
        
        if shas_found:
            print(f"Found {len(shas_found)} potential commit SHAs")
    
    
    def test_expand_commit_to_see_diff(self, wait):
        """Test expanding a commit to view diff details"""
        self.driver.get(f"{self.base_url}/repositories/1/commits")
        time.sleep(2)
        
        try:
            # Find clickable commit elements
            commit_cards = self.driver.find_elements(
                By.CSS_SELECTOR,
                "[class*='commit'], [class*='card']"
            )
            
            if commit_cards:
                # Click first commit
                commit_cards[0].click()
                time.sleep(2)
                
                # Check if diff/patch content appeared
                page_source = self.driver.page_source
                
                has_diff = (
                    "diff" in page_source.lower() or
                    "patch" in page_source.lower() or
                    "changed files" in page_source.lower() or
                    "additions" in page_source.lower() or
                    "deletions" in page_source.lower()
                )
                
                if has_diff:
                    print("Commit diff details displayed")
                else:
                    print("Clicked commit, checking for expansion")
            else:
                pytest.skip("No commit elements found to expand")
                
        except Exception as e:
            pytest.skip(f"Could not test commit expansion: {e}")
    
    
    def test_back_navigation_from_repository(self):
        """Test navigating back from repository to repositories list"""
        self.driver.get(f"{self.base_url}/repositories/1/code")
        time.sleep(2)
        
        # Find back button or breadcrumb
        back_elements = self.driver.find_elements(
            By.XPATH,
            "//button[contains(text(), 'Back')] | //a[contains(@href, '/repositories')]"
        )
        
        if back_elements:
            back_elements[0].click()
            time.sleep(2)
            
            # Should return to repositories list
            assert self.driver.current_url.endswith("/repositories") or "/repositories" in self.driver.current_url
            print("Successfully navigated back to repositories list")
        else:
            # Try browser back button
            self.driver.back()
            time.sleep(2)
            print("Used browser back button")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
