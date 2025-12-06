import pytest
import requests
import json
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
        """Test basic array sum functionality"""
        payload = {"array": [1, 2, 3, 4, 5]}
        response = requests.post(f"{BASE_URL}/api/array/sum", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "sum" in data
        assert data["sum"] == 15

    def test_array_sum_empty(self):
        """Test array sum with empty array"""
        payload = {"array": []}
        response = requests.post(f"{BASE_URL}/api/array/sum", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "sum" in data
        assert data["sum"] == 0

    def test_array_reverse_basic(self):
        """Test basic array reverse functionality"""
        payload = {"array": [1, 2, 3, 4, 5]}
        response = requests.post(f"{BASE_URL}/api/array/reverse", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "reversed" in data
        assert data["reversed"] == [5, 4, 3, 2, 1]

    def test_array_reverse_empty(self):
        """Test array reverse with empty array"""
        payload = {"array": []}
        response = requests.post(f"{BASE_URL}/api/array/reverse", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "reversed" in data
        assert data["reversed"] == []

    def test_array_max_basic(self):
        """Test basic array max functionality"""
        payload = {"array": [1, 2, 3, 4, 5]}
        response = requests.post(f"{BASE_URL}/api/array/max", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "max" in data
        assert data["max"] == 5

    def test_array_max_negative(self):
        """Test array max with negative numbers"""
        payload = {"array": [-5, -2, -8, -1]}
        response = requests.post(f"{BASE_URL}/api/array/max", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "max" in data
        assert data["max"] == -1

    def test_array_sum_invalid_input(self):
        """Test array sum with invalid input (non-integer)"""
        payload = {"array": [1, 2, "invalid", 4]}
        response = requests.post(f"{BASE_URL}/api/array/sum", json=payload)
        
        assert response.status_code == 400
        data = response.json()
        assert "error" in data

    def test_array_reverse_invalid_input(self):
        """Test array reverse with invalid input (non-integer)"""
        payload = {"array": [1, 2, None, 4]}
        response = requests.post(f"{BASE_URL}/api/array/reverse", json=payload)
        
        assert response.status_code == 400
        data = response.json()
        assert "error" in data

    def test_array_max_empty_array(self):
        """Test array max with empty array should return error"""
        payload = {"array": []}
        response = requests.post(f"{BASE_URL}/api/array/max", json=payload)
        
        assert response.status_code == 400
        data = response.json()
        assert "error" in data

    def test_array_sum_missing_field(self):
        """Test array sum with missing array field"""
        payload = {"numbers": [1, 2, 3]}
        response = requests.post(f"{BASE_URL}/api/array/sum", json=payload)
        
        assert response.status_code == 400
        data = response.json()
        assert "error" in data

    def test_array_max_single_element(self):
        """Test array max with single element"""
        payload = {"array": [42]}
        response = requests.post(f"{BASE_URL}/api/array/max", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "max" in data
        assert data["max"] == 42

    def test_array_reverse_single_element(self):
        """Test array reverse with single element"""
        payload = {"array": [99]}
        response = requests.post(f"{BASE_URL}/api/array/reverse", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "reversed" in data
        assert data["reversed"] == [99]
