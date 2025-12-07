import pytest
import requests
import time

BASE_URL = "http://localhost:5000"

class TestArrayOperations:
    
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

    def test_array_sum_basic(self):
        """Test array sum with valid input"""
        payload = {"array": [1, 2, 3]}
        response = requests.post(f"{BASE_URL}/api/array/sum", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "sum" in data
        assert data["sum"] == 6

    def test_array_sum_empty(self):
        """Test array sum with empty array"""
        payload = {"array": []}
        response = requests.post(f"{BASE_URL}/api/array/sum", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "sum" in data
        assert data["sum"] == 0

    def test_array_reverse_basic(self):
        """Test array reverse with valid input"""
        payload = {"array": [1, 2, 3]}
        response = requests.post(f"{BASE_URL}/api/array/reverse", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "reversed" in data
        assert data["reversed"] == [3, 2, 1]

    def test_array_max_basic(self):
        """Test array max with valid input"""
        payload = {"array": [1, 2, 3]}
        response = requests.post(f"{BASE_URL}/api/array/max", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "max" in data
        assert data["max"] == 3

    def test_array_max_negative(self):
        """Test array max with negative numbers"""
        payload = {"array": [-1, -2]}
        response = requests.post(f"{BASE_URL}/api/array/max", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "max" in data
        assert data["max"] == -1

    def test_array_sum_invalid_input(self):
        """Test array sum with invalid input (missing array field)"""
        payload = {"data": [1, 2, 3]}
        response = requests.post(f"{BASE_URL}/api/array/sum", json=payload)
        
        assert response.status_code == 400
