import pytest
import requests
import time

BASE_URL = "http://localhost:5000"

class TestEchoOperations:
    
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

    def test_echo_text_basic(self):
        """Test echo text with valid input"""
        payload = {"value": "hello"}
        response = requests.post(f"{BASE_URL}/api/echo/text", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "echo" in data
        assert data["echo"] == "hello"

    def test_echo_text_invalid_input(self):
        """Test echo text with invalid input (missing field)"""
        payload = {"text": "hello"}
        response = requests.post(f"{BASE_URL}/api/echo/text", json=payload)
        
        assert response.status_code == 400

    def test_echo_number_basic(self):
        """Test echo number with valid input"""
        payload = {"value": 42}
        response = requests.post(f"{BASE_URL}/api/echo/number", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "echo" in data
        assert data["echo"] == 42

    def test_echo_match_true(self):
        """Test echo match with matching values"""
        payload = {"a": "test", "b": "test"}
        response = requests.post(f"{BASE_URL}/api/echo/match", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "match" in data
        assert data["match"] is True

    def test_echo_match_false(self):
        """Test echo match with non-matching values"""
        payload = {"a": "test", "b": "no"}
        response = requests.post(f"{BASE_URL}/api/echo/match", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "match" in data
        assert data["match"] is False

    def test_echo_text_empty(self):
        """Test echo text with empty string"""
        payload = {"value": ""}
        response = requests.post(f"{BASE_URL}/api/echo/text", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "echo" in data
        assert data["echo"] == ""
