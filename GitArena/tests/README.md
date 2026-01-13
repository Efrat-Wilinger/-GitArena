# GitArena Testing Requirements

## Installation

```bash
# Navigate to project root
cd "c:\הנדסת תוכנה פרויקט\GitArena"

# Install testing dependencies
pip install pytest selenium webdriver-manager pytest-html

# Or create requirements file
pip install -r tests/requirements.txt
```

## Running Tests

### Run All Tests
```bash
pytest tests/ -v -s
```

### Run Specific Test File
```bash
pytest tests/test_auth.py -v -s
pytest tests/test_projects.py -v -s
pytest tests/test_sync.py -v -s
pytest tests/test_dashboard.py -v -s
pytest tests/test_navigation.py -v -s
```

### Run with HTML Report
```bash
pytest tests/ -v -s --html=test_report.html --self-contained-html
```

### Run Specific Test
```bash
pytest tests/test_auth.py::TestAuthentication::test_login_page_loads -v -s
```

## Important Notes

### Authentication Setup
Most tests require authentication. You have several options:

1. **Manual Login** (Current default)
   - Run test, manually login during test execution
   - Not ideal for automation

2. **Token Injection** (Recommended for local testing)
   - Get a test token from your backend
   - Replace `'test-token'` in test files with real token
   - Set token in localStorage before each test

3. **GitHub OAuth Mock** (Best for CI/CD)
   - Create mock OAuth server
   - Intercept GitHub OAuth flow
   - Return test credentials

### Test Data
- Tests assume repository ID 1 exists
- Tests assume project with team members exists
- Adjust IDs in tests based on your test data

### Browser Configuration
- Tests use Chrome by default
- Chrome WebDriver auto-installed via webdriver-manager
- For headless mode, uncomment in `conftest.py`:
  ```python
  chrome_options.add_argument("--headless")
  ```

### Screenshots
- Screenshots saved to `screenshots/` folder on failures
- Useful for debugging

## Test Coverage

| Test File | Purpose | Test Count |
|-----------|---------|------------|
| test_auth.py | Authentication & Session | 5 tests |
| test_projects.py | Project Management | 6 tests |
| test_sync.py | GitHub Sync | 8 tests |
| test_dashboard.py | Dashboard Analytics | 10 tests |
| test_navigation.py | Repository Navigation | 10 tests |

**Total: 39 E2E tests**

## Known Issues

1. **OAuth Flow**: Currently requires manual intervention or token injection
2. **Timing**: Some tests may need increased `time.sleep()` on slower systems
3. **Test Data**: Tests assume certain data exists in database

## Next Steps

1. ✅ Review test plan
2. ⏳ Run test suite
3. ⏳ Document failures in Azure DevOps  
4. ⏳ Fix identified bugs
5. ⏳ Retest and verify
6. ⏳ Create test summary for Wiki
