import pytest
import requests
import time

BASE_URL = "http://localhost:8000"

@pytest.fixture(scope="session", autouse=True)
def wait_for_server():
    for _ in range(30):
        try:
            requests.get(BASE_URL)
            break
        except:
            time.sleep(0.5)

def test_flujo_completo_registro_y_cita():
    timestamp = int(time.time() * 1000)
    paciente = {
        "nombre": f"Juan Perez {timestamp}",
        "email": f"juan{timestamp}@email.com",
        "telefono": "+51987654321"
    }
    
    response = requests.post(f"{BASE_URL}/pacientes", json=paciente)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    paciente_id = data["id"]
    
    cita = {
        "paciente_id": paciente_id,
        "doctor": "Dr. Rodriguez",
        "fecha": "2025-12-15",
        "hora": "10:00"
    }
    
    response = requests.post(f"{BASE_URL}/citas", json=cita)
    assert response.status_code == 200
    assert "id" in response.json()

def test_email_invalido():
    timestamp = int(time.time() * 1000)
    paciente = {
        "nombre": "Maria Lopez",
        "email": "email-invalido",
        "telefono": "+51912345678"
    }
    
    response = requests.post(f"{BASE_URL}/pacientes", json=paciente)
    assert response.status_code == 422

def test_telefono_invalido():
    timestamp = int(time.time() * 1000)
    paciente = {
        "nombre": f"Carlos Sanchez {timestamp}",
        "email": f"carlos{timestamp}@email.com",
        "telefono": "123"
    }
    
    response = requests.post(f"{BASE_URL}/pacientes", json=paciente)
    assert response.status_code == 422

def test_email_duplicado():
    timestamp = int(time.time() * 1000)
    email = f"pedro{timestamp}@email.com"
    
    paciente1 = {
        "nombre": "Pedro Garcia",
        "email": email,
        "telefono": "+51923456789"
    }
    
    response1 = requests.post(f"{BASE_URL}/pacientes", json=paciente1)
    assert response1.status_code == 200
    
    paciente2 = {
        "nombre": "Pedro Garcia Segundo",
        "email": email,
        "telefono": "+51934567890"
    }
    
    response2 = requests.post(f"{BASE_URL}/pacientes", json=paciente2)
    assert response2.status_code == 400
    assert "ya esta registrado" in response2.json()["detail"]

def test_horario_ocupado():
    timestamp = int(time.time() * 1000)
    
    paciente1 = {
        "nombre": f"Ana Martinez {timestamp}",
        "email": f"ana{timestamp}@email.com",
        "telefono": "+51945678901"
    }
    response1 = requests.post(f"{BASE_URL}/pacientes", json=paciente1)
    paciente1_id = response1.json()["id"]
    
    paciente2 = {
        "nombre": f"Luis Torres {timestamp}",
        "email": f"luis{timestamp}@email.com",
        "telefono": "+51956789012"
    }
    response2 = requests.post(f"{BASE_URL}/pacientes", json=paciente2)
    paciente2_id = response2.json()["id"]
    
    cita1 = {
        "paciente_id": paciente1_id,
        "doctor": "Dr. Gomez",
        "fecha": "2025-12-20",
        "hora": "14:00"
    }
    response = requests.post(f"{BASE_URL}/citas", json=cita1)
    assert response.status_code == 200
    
    cita2 = {
        "paciente_id": paciente2_id,
        "doctor": "Dr. Gomez",
        "fecha": "2025-12-20",
        "hora": "14:00"
    }
    response = requests.post(f"{BASE_URL}/citas", json=cita2)
    assert response.status_code == 400
    assert "horario ya esta ocupado" in response.json()["detail"]

def test_mismo_paciente_diferente_horario():
    timestamp = int(time.time() * 1000)
    
    paciente = {
        "nombre": f"Sofia Ramirez {timestamp}",
        "email": f"sofia{timestamp}@email.com",
        "telefono": "+51967890123"
    }
    response = requests.post(f"{BASE_URL}/pacientes", json=paciente)
    paciente_id = response.json()["id"]
    
    cita1 = {
        "paciente_id": paciente_id,
        "doctor": "Dr. Vargas",
        "fecha": "2025-12-22",
        "hora": "09:00"
    }
    response1 = requests.post(f"{BASE_URL}/citas", json=cita1)
    assert response1.status_code == 200
    
    cita2 = {
        "paciente_id": paciente_id,
        "doctor": "Dr. Vargas",
        "fecha": "2025-12-22",
        "hora": "11:00"
    }
    response2 = requests.post(f"{BASE_URL}/citas", json=cita2)
    assert response2.status_code == 200

def test_diferentes_doctores_mismo_horario():
    timestamp = int(time.time() * 1000)
    
    paciente1 = {
        "nombre": f"Roberto Diaz {timestamp}",
        "email": f"roberto{timestamp}@email.com",
        "telefono": "+51978901234"
    }
    response1 = requests.post(f"{BASE_URL}/pacientes", json=paciente1)
    paciente1_id = response1.json()["id"]
    
    paciente2 = {
        "nombre": f"Elena Castro {timestamp}",
        "email": f"elena{timestamp}@email.com",
        "telefono": "+51989012345"
    }
    response2 = requests.post(f"{BASE_URL}/pacientes", json=paciente2)
    paciente2_id = response2.json()["id"]
    
    cita1 = {
        "paciente_id": paciente1_id,
        "doctor": "Dr. Mendoza",
        "fecha": "2025-12-25",
        "hora": "15:00"
    }
    response = requests.post(f"{BASE_URL}/citas", json=cita1)
    assert response.status_code == 200
    
    cita2 = {
        "paciente_id": paciente2_id,
        "doctor": "Dr. Herrera",
        "fecha": "2025-12-25",
        "hora": "15:00"
    }
    response = requests.post(f"{BASE_URL}/citas", json=cita2)
    assert response.status_code == 200

def test_cancelar_cita():
    timestamp = int(time.time() * 1000)
    
    paciente = {
        "nombre": f"Miguel Flores {timestamp}",
        "email": f"miguel{timestamp}@email.com",
        "telefono": "+51990123456"
    }
    response = requests.post(f"{BASE_URL}/pacientes", json=paciente)
    paciente_id = response.json()["id"]
    
    cita = {
        "paciente_id": paciente_id,
        "doctor": "Dr. Paredes",
        "fecha": "2025-12-28",
        "hora": "16:00"
    }
    response = requests.post(f"{BASE_URL}/citas", json=cita)
    cita_id = response.json()["id"]
    
    response = requests.delete(f"{BASE_URL}/citas/{cita_id}")
    assert response.status_code == 200
    
    response = requests.get(f"{BASE_URL}/citas")
    citas = response.json()
    citas_activas = [c for c in citas if c["id"] == cita_id]
    assert len(citas_activas) == 0

def test_listar_citas():
    response = requests.get(f"{BASE_URL}/citas")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_listar_pacientes():
    response = requests.get(f"{BASE_URL}/pacientes")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
