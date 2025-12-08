import pytest
import requests
import time
from datetime import datetime

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
        # Verify pagination has required fields
        assert "totalItems" in data["pagination"]
        assert "currentPage" in data["pagination"]
        assert "totalPages" in data["pagination"]

    def test_datastructures_category_filter(self):
        """Test datastructures category endpoint with pagination"""
        response = requests.get(f"{BASE_URL}/api/datastructures/category/array")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have proper structure with pagination
        assert "dataStructures" in data
        assert "pagination" in data
        assert isinstance(data["dataStructures"], list)
        assert isinstance(data["pagination"], dict)
        # Verify pagination fields exist
        assert "totalItems" in data["pagination"]
        assert "currentPage" in data["pagination"]
        assert "totalPages" in data["pagination"]

    def test_datastructures_not_found(self):
        """Test datastructures endpoint with invalid ID returns 404"""
        response = requests.get(f"{BASE_URL}/api/datastructures/nonexistent")
        
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert "Data structure not found" in data["error"]

    def test_health_endpoint(self):
        """Test health endpoint returns dynamic server status"""
        response = requests.get(f"{BASE_URL}/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "timestamp" in data
        assert "uptime" in data
        assert data["status"] == "OK"
        
        # Verify timestamp is current (within 1 second)
        server_time = datetime.fromisoformat(data["timestamp"].replace('Z', '+00:00'))
        current_time = datetime.now(server_time.tzinfo)
        time_diff = abs((current_time - server_time).total_seconds())
        assert time_diff < 1.0, f"Timestamp difference: {time_diff} seconds"
        
        # Verify uptime is positive and reasonable
        assert isinstance(data["uptime"], (int, float))
        assert data["uptime"] >= 0

    def test_datastructures_with_query_params(self):
        """Test datastructures endpoint with query parameters affects pagination"""
        response = requests.get(f"{BASE_URL}/api/datastructures?page=1")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have proper structure with pagination
        assert "dataStructures" in data
        assert "pagination" in data
        assert isinstance(data["dataStructures"], list)
        assert isinstance(data["pagination"], dict)
        
        # Verify query parameter is reflected in pagination
        assert data["pagination"]["currentPage"] == 1
        assert "totalItems" in data["pagination"]
        assert "totalPages" in data["pagination"]

    def test_anti_cheating_dynamic_content(self):
        """Test that responses are not completely static/hardcoded"""
        # Make two requests to health endpoint with a small delay
        response1 = requests.get(f"{BASE_URL}/api/health")
        time.sleep(0.1)  # Small delay to ensure different timestamps
        response2 = requests.get(f"{BASE_URL}/api/health")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        data1 = response1.json()
        data2 = response2.json()
        
        # Anti-cheating: timestamps should be different (dynamic content)
        assert data1["timestamp"] != data2["timestamp"], "Timestamps should be different - indicates hardcoded response"
        
        # Uptime should be greater in second response
        assert data2["uptime"] >= data1["uptime"], "Uptime should increase - indicates hardcoded response"

