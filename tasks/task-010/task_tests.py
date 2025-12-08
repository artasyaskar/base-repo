import pytest
import requests
import time

BASE_URL = "http://localhost:5000"

class TestDateOperations:
    
    @pytest.fixture(scope="class", autouse=True)
    def setup_class(self):
        """Wait for server to be ready"""
        max_retries = 30
        for i in range(max_retries):
            try:
                response = requests.get(f"{BASE_URL}/api/health", timeout=2)
                if response.status_code == 200:
                    break
            except requests.exceptions.RequestException:
                pass
            time.sleep(0.2)
        else:
            pytest.fail("Server failed to start within timeout")

    def test_date_difference_basic(self):
        """Test date difference calculation with valid input"""
        payload = {"start_date": "2024-01-01", "end_date": "2024-01-06"}
        response = requests.post(f"{BASE_URL}/api/date/difference", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "days" in data
        assert data["days"] == 5

    def test_date_difference_same_day(self):
        """Test date difference with same dates"""
        payload = {"start_date": "2024-01-01", "end_date": "2024-01-01"}
        response = requests.post(f"{BASE_URL}/api/date/difference", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "days" in data
        assert data["days"] == 0

    def test_date_format_basic(self):
        """Test date formatting with valid input"""
        payload = {"date": "2024-01-15"}
        response = requests.post(f"{BASE_URL}/api/date/format", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "formatted" in data
        assert data["formatted"] == "January 15, 2024"

    def test_date_format_leap_year(self):
        """Test date formatting with leap year date"""
        payload = {"date": "2024-02-29"}
        response = requests.post(f"{BASE_URL}/api/date/format", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "formatted" in data
        assert data["formatted"] == "February 29, 2024"

    def test_date_valid_leap_year(self):
        """Test date validation for leap year"""
        payload = {"date": "2024-02-29"}
        response = requests.post(f"{BASE_URL}/api/date/valid", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
        assert data["valid"] == True

    def test_date_difference_invalid_input(self):
        """Test date difference with invalid input (missing start_date field)"""
        payload = {"start": "2024-01-01", "end_date": "2024-01-06"}
        response = requests.post(f"{BASE_URL}/api/date/difference", json=payload)
        
        assert response.status_code == 400
