import pytest
import requests
import time

BASE_URL = "http://localhost:5000"

class TestCounterOperations:
    
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

    def test_counter_increment_basic(self):
        """Test counter increment with valid input"""
        payload = {"number": 5}
        response = requests.post(f"{BASE_URL}/api/counter/increment", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["result"] == 6

    def test_counter_increment_invalid_input(self):
        """Test counter increment with invalid input (missing field)"""
        payload = {"value": 5}
        response = requests.post(f"{BASE_URL}/api/counter/increment", json=payload)
        
        assert response.status_code == 400

    def test_counter_decrement_basic(self):
        """Test counter decrement with valid input"""
        payload = {"number": 3}
        response = requests.post(f"{BASE_URL}/api/counter/decrement", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["result"] == 2

    def test_counter_iszero_basic(self):
        """Test counter iszero with zero"""
        payload = {"number": 0}
        response = requests.post(f"{BASE_URL}/api/counter/iszero", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "iszero" in data
        assert data["iszero"] is True

    def test_counter_iszero_nonzero(self):
        """Test counter iszero with non-zero"""
        payload = {"number": 1}
        response = requests.post(f"{BASE_URL}/api/counter/iszero", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "iszero" in data
        assert data["iszero"] is False

    def test_counter_increment_zero(self):
        """Test counter increment with zero"""
        payload = {"number": 0}
        response = requests.post(f"{BASE_URL}/api/counter/increment", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["result"] == 1
