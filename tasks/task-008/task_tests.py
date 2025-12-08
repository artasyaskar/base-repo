import pytest
import requests
import time

BASE_URL = "http://localhost:5000"

class TestExistingAPIEndpoints:
    
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

    def test_datastructures_basic(self):
        """Test datastructures endpoint returns proper structure"""
        response = requests.get(f"{BASE_URL}/api/datastructures")
        
        assert response.status_code == 200
        data = response.json()
        assert "dataStructures" in data
        assert "pagination" in data
        assert isinstance(data["dataStructures"], list)
        assert isinstance(data["pagination"], dict)

    def test_datastructures_category_filter(self):
        """Test datastructures category endpoint"""
        response = requests.get(f"{BASE_URL}/api/datastructures/category/array")
        
        assert response.status_code == 200
        data = response.json()
        assert "dataStructures" in data
        assert "pagination" in data
        assert isinstance(data["dataStructures"], list)

    def test_datastructures_not_found(self):
        """Test datastructures endpoint with invalid ID returns 404"""
        response = requests.get(f"{BASE_URL}/api/datastructures/nonexistent")
        
        assert response.status_code == 404

    def test_health_endpoint(self):
        """Test health endpoint returns server status"""
        response = requests.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "timestamp" in data
        assert "uptime" in data
        assert data["status"] == "OK"

    def test_datastructures_with_query_params(self):
        """Test datastructures endpoint with query parameters"""
        response = requests.get(f"{BASE_URL}/api/datastructures?page=1&limit=5")
        
        assert response.status_code == 200
        data = response.json()
        assert "dataStructures" in data
        assert "pagination" in data
        assert data["pagination"]["currentPage"] == 1

    def test_datastructures_invalid_query_params(self):
        """Test datastructures endpoint with invalid query parameters"""
        response = requests.get(f"{BASE_URL}/api/datastructures?invalid=param")
        
        assert response.status_code == 200
        data = response.json()
        assert "dataStructures" in data
        assert "pagination" in data
