import pytest
import requests
import time

BASE_URL = "http://localhost:5000"

class TestStringOperations:
    
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

    def test_string_length_basic(self):
        """Test string length with valid input"""
        payload = {"text": "hello"}
        response = requests.post(f"{BASE_URL}/api/string/length", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "length" in data
        assert data["length"] == 5

    def test_string_length_empty(self):
        """Test string length with empty string"""
        payload = {"text": ""}
        response = requests.post(f"{BASE_URL}/api/string/length", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "length" in data
        assert data["length"] == 0

    def test_string_uppercase_basic(self):
        """Test string uppercase with valid input"""
        payload = {"text": "cat"}
        response = requests.post(f"{BASE_URL}/api/string/uppercase", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "uppercase" in data
        assert data["uppercase"] == "CAT"

    def test_string_first_basic(self):
        """Test string first character with valid input"""
        payload = {"text": "dog"}
        response = requests.post(f"{BASE_URL}/api/string/first", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "first" in data
        assert data["first"] == "d"

    def test_string_first_empty(self):
        """Test string first character with empty string"""
        payload = {"text": ""}
        response = requests.post(f"{BASE_URL}/api/string/first", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "first" in data
        assert data["first"] is None

    def test_string_length_invalid_input(self):
        """Test string length with invalid input (missing text field)"""
        payload = {"message": "hello"}
        response = requests.post(f"{BASE_URL}/api/string/length", json=payload)
        
        assert response.status_code == 400
