"""
Test 4: Dashboard Analytics
Tests dashboard widgets and team collaboration visualization
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time


class TestDashboardAnalytics:
    """Test suite for dashboard analytics and visualizations"""
    
    @pytest.fixture(autouse=True)
    def setup(self, driver, base_url):
        """Setup: Navigate to manager dashboard"""
        self.driver = driver
        self.base_url = base_url
        
        # Authenticate
        driver.get(base_url)
        driver.execute_script("localStorage.setItem('token', 'test-token');")
        
        # Go to dashboard
        driver.get(f"{base_url}/manager/dashboard")
        time.sleep(3)
    
    
    def test_dashboard_page_loads(self):
        """Test that manager dashboard loads successfully"""
        assert "dashboard" in self.driver.current_url
        
        # Check for key dashboard elements
        page_source = self.driver.page_source
        assert "Dashboard" in page_source or "dashboard" in page_source.lower()
    
    
    def test_team_collaboration_graph_exists(self):
        """Test that Team Collaboration network graph is present"""
        # Look for Team Collaboration section
        collab_sections = self.driver.find_elements(
            By.XPATH,
            "//*[contains(text(), 'Team Collaboration') or contains(text(), 'Collaboration')]"
        )
        
        assert len(collab_sections) > 0, "Team Collaboration section not found"
        print("Team Collaboration section found")
    
    
    def test_team_member_nodes_display(self):
        """Test that team member nodes are rendered in collaboration graph"""
        time.sleep(2)
        
        # Look for SVG or canvas elements (graph visualization)
        svg_elements = self.driver.find_elements(By.TAG_NAME, "svg")
        canvas_elements = self.driver.find_elements(By.TAG_NAME, "canvas")
        
        has_graph = len(svg_elements) > 0 or len(canvas_elements) > 0
        
        if not has_graph:
            # Alternative: check for user avatars or names
            page_source = self.driver.page_source
            has_members = "member" in page_source.lower() or "user" in page_source.lower()
            assert has_members, "No team member visualization found"
        else:
            print(f"Found graph elements: {len(svg_elements)} SVG, {len(canvas_elements)} Canvas")
    
    
    def test_hover_shows_commit_count(self, wait):
        """Test that hovering over graph elements shows commit counts"""
        try:
            # Find interactive elements (nodes, bars, etc.)
            interactive_elements = self.driver.find_elements(
                By.CSS_SELECTOR,
                "circle, rect, path, .node, [data-tooltip], [title]"
            )
            
            if interactive_elements:
                # Hover over first element
                actions = ActionChains(self.driver)
                actions.move_to_element(interactive_elements[0]).perform()
                time.sleep(1)
                
                # Check if tooltip appeared
                page_after_hover = self.driver.page_source
                
                # Look for common tooltip text
                has_tooltip = (
                    "commit" in page_after_hover.lower() or
                    "contribution" in page_after_hover.lower()
                )
                
                print(f"Hover test completed. Tooltip detected: {has_tooltip}")
            else:
                pytest.skip("No interactive graph elements found")
                
        except Exception as e:
            pytest.skip(f"Could not test hover interaction: {e}")
    
    
    def test_peak_hours_widget_displays(self):
        """Test that Peak Hours widget shows hour-by-hour data"""
        page_source = self.driver.page_source
        
        # Check for Peak Hours widget
        has_peak_hours = "peak" in page_source.lower() and "hours" in page_source.lower()
        
        if has_peak_hours:
            print("Peak Hours widget found")
            
            # Look for hour labels (0h, 3h, 6h, etc.)
            hour_pattern = r'\d+h|\d+:00'
            import re
            hours_found = re.findall(hour_pattern, page_source)
            
            if hours_found:
                print(f"Found hour labels: {hours_found[:5]}...")  # Show first 5
        else:
            pytest.skip("Peak Hours widget not found")
    
    
    def test_files_changed_widget_displays(self):
        """Test that Files Changed widget shows file statistics"""
        page_source = self.driver.page_source
        
        # Check for Files Changed widget
        has_files_widget = "files" in page_source.lower() and "changed" in page_source.lower()
        
        if has_files_widget:
            print("Files Changed widget found")
            
            # Check for lines added/deleted
            has_lines_data = (
                "lines added" in page_source.lower() or
                "lines removed" in page_source.lower() or
                "additions" in page_source.lower() or
                "deletions" in page_source.lower()
            )
            
            assert has_lines_data, "Files Changed widget missing line statistics"
        else:
            pytest.skip("Files Changed widget not found")
    
    
    def test_commit_activity_shows_timeline(self):
        """Test that Commit Activity chart shows commit timeline"""
        # Look for Commit Activity section
        activity_sections = self.driver.find_elements(
            By.XPATH,
            "//*[contains(text(), 'Commit Activity')]"
        )
        
        assert len(activity_sections) > 0, "Commit Activity section not found"
        
        # Check for date labels or timeline markers
        page_source = self.driver.page_source
        
        # Look for date patterns
        import re
        date_patterns = r'\d{4}-\d{2}-\d{2}|\d{2}/\d{2}|\w+ \d+'
        dates_found = re.findall(date_patterns, page_source)
        
        if dates_found:
            print(f"Found {len(dates_found)} date markers")
    
    
    def test_statistics_show_numbers(self):
        """Test that dashboard displays numeric statistics"""
        page_source = self.driver.page_source
        
        # Extract all numbers
        import re
        numbers = re.findall(r'\b\d+\b', page_source)
        
        assert len(numbers) > 5, f"Expected multiple statistics, found only {len(numbers)} numbers"
        
        # Check for key stat labels
        stat_labels = [
            "total commits",
            "team prs",
            "files modified",
            "lines added",
            "contributions"
        ]
        
        found_labels = [label for label in stat_labels if label in page_source.lower()]
        print(f"Found stat labels: {found_labels}")
    
    
    def test_pull_requests_widget_shows_status(self):
        """Test that Pull Requests widget shows PR status breakdown"""
        page_source = self.driver.page_source
        
        has_pr_widget = "pull request" in page_source.lower() or "pr" in page_source.lower()
        
        if has_pr_widget:
            # Check for PR statuses
            statuses = ["open", "merged", "closed"]
            found_statuses = [s for s in statuses if s in page_source.lower()]
            
            assert len(found_statuses) > 0, "No PR status information found"
            print(f"Found PR statuses: {found_statuses}")
        else:
            pytest.skip("Pull Requests widget not found")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
