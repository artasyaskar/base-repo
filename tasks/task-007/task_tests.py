import pytest
import requests
import time

BASE_URL = "http://localhost:5000"

class TestValidationOperations:
    
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

    def test_email_valid(self):
        """Test email validation with valid email"""
        payload = {"value": "test@example.com"}
        response = requests.post(f"{BASE_URL}/api/validate/email", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
        assert data["valid"] == True

    def test_email_invalid(self):
        """Test email validation with invalid email"""
        payload = {"value": "invalid"}
        response = requests.post(f"{BASE_URL}/api/validate/email", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
        assert data["valid"] == False

    def test_email_missing_field(self):
        """Test email validation with missing value field"""
        payload = {"data": "test@example.com"}
        response = requests.post(f"{BASE_URL}/api/validate/email", json=payload)
        
        assert response.status_code == 400

    def test_phone_valid(self):
        """Test phone validation with valid phone number"""
        payload = {"value": "1234567890"}
        response = requests.post(f"{BASE_URL}/api/validate/phone", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
        assert data["valid"] == True

    def test_range_valid(self):
        """Test range validation with number in range"""
        payload = {"number": 5, "min": 1, "max": 10}
        response = requests.post(f"{BASE_URL}/api/validate/range", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
        assert data["valid"] == True

    def test_range_invalid(self):
        """Test range validation with number out of range"""
        payload = {"number": 15, "min": 1, "max": 10}
        response = requests.post(f"{BASE_URL}/api/validate/range", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
        assert data["valid"] == False
