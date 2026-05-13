import requests

BASE_URL = "http://localhost:5000" # Assuming it runs on 5000 locally

def test_pharmacy():
    try:
        # Test stats
        res = requests.get(f"{BASE_URL}/pharmacy/stats")
        print("Stats Status:", res.status_code)
        print("Stats Data:", res.json())

        # Test inventory
        res = requests.get(f"{BASE_URL}/pharmacy/inventory")
        print("Inventory Status:", res.status_code)
        print("Inventory Count:", len(res.json()))

    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_pharmacy()
