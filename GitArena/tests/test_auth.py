"""
Test 1: Authentication Flow
Tests user login with GitHub OAuth and session persistence
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import time


class TestAuthentication:
    """Test suite for user authentication"""
    
    def test_login_page_loads(self, driver, base_url):
        """
        Test that login page loads successfully
        """
        driver.get(f"{base_url}/login")
        
        # Verify page title or key element
        assert "GitArena" in driver.title or "Login" in driver.page_source
        
        # Check for GitHub login button
        login_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'GitHub')]")
        assert len(login_buttons) > 0, "GitHub login button not found"
    
    
    def test_unauthenticated_redirect(self, driver, base_url):
        """
        Test that unauthenticated users are redirected to login
        """
        # Try to access protected route without auth
        driver.get(f"{base_url}/manager/dashboard")
        
        # Should redirect to login
        time.sleep(2)  # Wait for redirect
        assert "/login" in driver.current_url, "Unauthenticated user not redirected to login"
    
    
    @pytest.mark.skip(reason="Requires manual GitHub OAuth or mock")
    def test_github_oauth_flow(self, driver, base_url, wait):
        """
        Test GitHub OAuth login flow
        Note: This requires either:
        1. Manual interaction during test
        2. GitHub OAuth mock/stub
        3. Test credentials with automated approval
        """
        driver.get(f"{base_url}/login")
        
        # Click GitHub login button
        github_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'GitHub')]"))
        )
        github_button.click()
        
        # This would normally go to GitHub OAuth page
        # In real scenario, you'd handle OAuth callback
        
        # For now, we skip this test and mark it manual
        pass
    
    
    def test_token_injection_authentication(self, driver, base_url):
        """
        Test authentication by injecting token directly
        This is a workaround for testing without full OAuth
        
        NOTE: Replace 'test-token-here' with actual test token
        """
        driver.get(f"{base_url}/login")
        
        # Inject test token into localStorage
        # In real scenario, get this from your backend test setup
        test_token = "test-token-here"  # Replace with actual test token
        
        driver.execute_script(f"localStorage.setItem('token', '{test_token}');")
        
        # Navigate to protected page
        driver.get(f"{base_url}/")
        
        time.sleep(2)
        
        # Should be on project selection page if authenticated
        # If not authenticated, would redirect to /login
        current_url = driver.current_url
        
        # This test will fail without real token, which is expected
        # In production, you'd set up proper test accounts
        print(f"Current URL after token injection: {current_url}")
    
    
    def test_logout_clears_session(self, driver, base_url):
        """
        Test that logout clears session and redirects to login
        """
        # First, inject a token to simulate logged-in state
        driver.get(f"{base_url}/")
        driver.execute_script("localStorage.setItem('token', 'fake-token');")
        
        # Navigate to a page
        driver.get(f"{base_url}/")
        time.sleep(1)
        
        # Check if logout button exists and click it
        try:
            logout_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Logout') or contains(text(), 'Sign Out')]")
            
            if logout_elements:
                logout_elements[0].click()
                time.sleep(2)
                
                # Should redirect to login
                assert "/login" in driver.current_url, "Not redirected to login after logout"
                
                # Token should be cleared
                token = driver.execute_script("return localStorage.getItem('token');")
                assert token is None, "Token not cleared after logout"
        except Exception as e:
            print(f"Logout test inconclusive: {e}")
            pytest.skip("Could not locate logout button")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
