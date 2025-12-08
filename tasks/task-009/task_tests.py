import pytest
import requests
import time

BASE_URL = "http://localhost:5000"

class TestFileOperations:
    
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

    def test_file_extension_basic(self):
        """Test file extension extraction with valid input"""
        payload = {"filename": "document.txt"}
        response = requests.post(f"{BASE_URL}/api/file/extension", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "extension" in data
        assert data["extension"] == "txt"

    def test_file_extension_no_extension(self):
        """Test file extension with filename having no extension"""
        payload = {"filename": "document"}
        response = requests.post(f"{BASE_URL}/api/file/extension", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "extension" in data
        assert data["extension"] == ""

    def test_file_size_valid(self):
        """Test file size validation with valid size"""
        payload = {"size": 1024}
        response = requests.post(f"{BASE_URL}/api/file/size", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
        assert data["valid"] == True

    def test_file_size_invalid(self):
        """Test file size validation with invalid size"""
        payload = {"size": 10000000}
        response = requests.post(f"{BASE_URL}/api/file/size", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "valid" in data
        assert data["valid"] == False

    def test_file_type_image(self):
        """Test file type detection for image files"""
        payload = {"filename": "image.jpg"}
        response = requests.post(f"{BASE_URL}/api/file/type", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "type" in data
        assert data["type"] == "image"

    def test_file_type_document(self):
        """Test file type detection for document files"""
        payload = {"filename": "document.pdf"}
        response = requests.post(f"{BASE_URL}/api/file/type", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "type" in data
        assert data["type"] == "document"

    def test_file_extension_invalid_input(self):
        """Test file extension with invalid input (missing filename field)"""
        payload = {"name": "document.txt"}
        response = requests.post(f"{BASE_URL}/api/file/extension", json=payload)
        
        assert response.status_code == 400
