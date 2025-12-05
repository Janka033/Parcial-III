from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from datetime import datetime, timedelta
import sqlite3
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect('medical_appointments.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pacientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            telefono TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS citas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_id INTEGER NOT NULL,
            doctor TEXT NOT NULL,
            fecha TEXT NOT NULL,
            hora TEXT NOT NULL,
            estado TEXT DEFAULT 'activa',
            FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

class Paciente(BaseModel):
    nombre: str
    email: EmailStr
    telefono: str
    
    @validator('telefono')
    def validate_telefono(cls, v):
        if not re.match(r'^\+?[\d\s\-()]{8,}$', v):
            raise ValueError('Telefono invalido')
        return v
    
    @validator('nombre')
    def validate_nombre(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Nombre no puede estar vacio')
        return v.strip()

class Cita(BaseModel):
    paciente_id: int
    doctor: str
    fecha: str
    hora: str
    
    @validator('doctor')
    def validate_doctor(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Doctor no puede estar vacio')
        return v.strip()
    
    @validator('fecha')
    def validate_fecha(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Formato de fecha invalido. Use YYYY-MM-DD')
        return v
    
    @validator('hora')
    def validate_hora(cls, v):
        if not re.match(r'^([01]\d|2[0-3]):([0-5]\d)$', v):
            raise ValueError('Formato de hora invalido. Use HH:MM')
        return v

@app.get("/")
def read_root():
    return {"message": "API de Citas Medicas"}

@app.post("/pacientes")
def registrar_paciente(paciente: Paciente):
    conn = sqlite3.connect('medical_appointments.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO pacientes (nombre, email, telefono) VALUES (?, ?, ?)",
            (paciente.nombre, paciente.email, paciente.telefono)
        )
        conn.commit()
        paciente_id = cursor.lastrowid
        conn.close()
        return {"id": paciente_id, "message": "Paciente registrado exitosamente"}
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="El email ya esta registrado")

@app.get("/pacientes")
def listar_pacientes():
    conn = sqlite3.connect('medical_appointments.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, nombre, email, telefono FROM pacientes")
    pacientes = cursor.fetchall()
    conn.close()
    
    return [
        {"id": p[0], "nombre": p[1], "email": p[2], "telefono": p[3]}
        for p in pacientes
    ]

@app.post("/citas")
def crear_cita(cita: Cita):
    conn = sqlite3.connect('medical_appointments.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM pacientes WHERE id = ?", (cita.paciente_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    cursor.execute(
        "SELECT id FROM citas WHERE doctor = ? AND fecha = ? AND hora = ? AND estado = 'activa'",
        (cita.doctor, cita.fecha, cita.hora)
    )
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="El horario ya esta ocupado para este doctor")
    
    cursor.execute(
        "INSERT INTO citas (paciente_id, doctor, fecha, hora, estado) VALUES (?, ?, ?, ?, 'activa')",
        (cita.paciente_id, cita.doctor, cita.fecha, cita.hora)
    )
    conn.commit()
    cita_id = cursor.lastrowid
    conn.close()
    
    return {"id": cita_id, "message": "Cita creada exitosamente"}

@app.get("/citas")
def listar_citas():
    conn = sqlite3.connect('medical_appointments.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id, c.paciente_id, p.nombre, p.email, c.doctor, c.fecha, c.hora, c.estado
        FROM citas c
        JOIN pacientes p ON c.paciente_id = p.id
        WHERE c.estado = 'activa'
        ORDER BY c.fecha, c.hora
    """)
    citas = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": c[0],
            "paciente_id": c[1],
            "paciente_nombre": c[2],
            "paciente_email": c[3],
            "doctor": c[4],
            "fecha": c[5],
            "hora": c[6],
            "estado": c[7]
        }
        for c in citas
    ]

@app.delete("/citas/{cita_id}")
def cancelar_cita(cita_id: int):
    conn = sqlite3.connect('medical_appointments.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM citas WHERE id = ? AND estado = 'activa'", (cita_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Cita no encontrada o ya cancelada")
    
    cursor.execute("UPDATE citas SET estado = 'cancelada' WHERE id = ?", (cita_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Cita cancelada exitosamente"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
