import pytest
import requests
import time

BASE_URL = "http://localhost:5000"

class TestMathOperations:
    
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

    def test_math_add_basic(self):
        """Test math add with valid input"""
        payload = {"a": 2, "b": 3}
        response = requests.post(f"{BASE_URL}/api/math/add", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["result"] == 5

    def test_math_add_invalid_input(self):
        """Test math add with invalid input (missing fields)"""
        payload = {"x": 2, "y": 3}
        response = requests.post(f"{BASE_URL}/api/math/add", json=payload)
        
        assert response.status_code == 400

    def test_math_subtract_basic(self):
        """Test math subtract with valid input"""
        payload = {"a": 5, "b": 2}
        response = requests.post(f"{BASE_URL}/api/math/subtract", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["result"] == 3

    def test_math_positive_basic(self):
        """Test math positive check with valid input"""
        payload = {"number": 4}
        response = requests.post(f"{BASE_URL}/api/math/positive", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "positive" in data
        assert data["positive"] is True

    def test_math_positive_negative(self):
        """Test math positive check with negative number"""
        payload = {"number": -1}
        response = requests.post(f"{BASE_URL}/api/math/positive", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "positive" in data
        assert data["positive"] is False

    def test_math_add_zero(self):
        """Test math add with zero values"""
        payload = {"a": 0, "b": 0}
        response = requests.post(f"{BASE_URL}/api/math/add", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["result"] == 0
