import pytest
import requests
import time

BASE_URL = "http://localhost:5000"

class TestNumberOperations:
    
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

    def test_number_double_basic(self):
        """Test number double with valid input"""
        payload = {"numbers": [1, 2, 3]}
        response = requests.post(f"{BASE_URL}/api/number/double", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "doubled" in data
        assert data["doubled"] == [2, 4, 6]

    def test_number_double_empty(self):
        """Test number double with empty array"""
        payload = {"numbers": []}
        response = requests.post(f"{BASE_URL}/api/number/double", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "doubled" in data
        assert data["doubled"] == []

    def test_number_square_basic(self):
        """Test number square with valid input"""
        payload = {"numbers": [2]}
        response = requests.post(f"{BASE_URL}/api/number/square", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "squared" in data
        assert data["squared"] == [4]

    def test_number_even_basic(self):
        """Test number even check with valid input"""
        payload = {"number": 4}
        response = requests.post(f"{BASE_URL}/api/number/even", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "even" in data
        assert data["even"] is True

    def test_number_even_odd(self):
        """Test number even check with odd number"""
        payload = {"number": 3}
        response = requests.post(f"{BASE_URL}/api/number/even", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "even" in data
        assert data["even"] is False

    def test_number_double_invalid_input(self):
        """Test number double with invalid input (missing numbers field)"""
        payload = {"values": [1, 2, 3]}
        response = requests.post(f"{BASE_URL}/api/number/double", json=payload)
        
        assert response.status_code == 400
