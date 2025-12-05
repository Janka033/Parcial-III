const API_URL = 'http://localhost:8000';

document.getElementById('formPaciente').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    
    try {
        const response = await fetch(`${API_URL}/pacientes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, telefono })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarMensaje('mensajePaciente', data.message, 'exito');
            document.getElementById('formPaciente').reset();
            cargarPacientes();
        } else {
            mostrarMensaje('mensajePaciente', data.detail || 'Error al registrar paciente', 'error');
        }
    } catch (error) {
        mostrarMensaje('mensajePaciente', 'Error de conexion con el servidor', 'error');
    }
});

document.getElementById('formCita').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const paciente_id = parseInt(document.getElementById('pacienteId').value);
    const doctor = document.getElementById('doctor').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    
    try {
        const response = await fetch(`${API_URL}/citas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paciente_id, doctor, fecha, hora })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarMensaje('mensajeCita', data.message, 'exito');
            document.getElementById('formCita').reset();
            cargarCitas();
        } else {
            mostrarMensaje('mensajeCita', data.detail || 'Error al crear cita', 'error');
        }
    } catch (error) {
        mostrarMensaje('mensajeCita', 'Error de conexion con el servidor', 'error');
    }
});

document.getElementById('btnActualizar').addEventListener('click', () => {
    cargarCitas();
});

async function cargarPacientes() {
    try {
        const response = await fetch(`${API_URL}/pacientes`);
        const pacientes = await response.json();
        
        const select = document.getElementById('pacienteId');
        select.innerHTML = '<option value="">Seleccione un paciente</option>';
        
        pacientes.forEach(paciente => {
            const option = document.createElement('option');
            option.value = paciente.id;
            option.textContent = `${paciente.nombre} (${paciente.email})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
    }
}

async function cargarCitas() {
    try {
        const response = await fetch(`${API_URL}/citas`);
        const citas = await response.json();
        
        const listaCitas = document.getElementById('listaCitas');
        listaCitas.innerHTML = '';
        
        if (citas.length === 0) {
            listaCitas.innerHTML = '<p>No hay citas agendadas</p>';
            return;
        }
        
        citas.forEach(cita => {
            const citaCard = document.createElement('div');
            citaCard.className = 'cita-card';
            citaCard.innerHTML = `
                <h3>Cita #${cita.id}</h3>
                <p><strong>Paciente:</strong> ${cita.paciente_nombre}</p>
                <p><strong>Email:</strong> ${cita.paciente_email}</p>
                <p><strong>Doctor:</strong> ${cita.doctor}</p>
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
                <button class="btn-cancelar" onclick="cancelarCita(${cita.id})">Cancelar Cita</button>
            `;
            listaCitas.appendChild(citaCard);
        });
    } catch (error) {
        console.error('Error al cargar citas:', error);
    }
}

async function cancelarCita(citaId) {
    if (!confirm('¿Está seguro de que desea cancelar esta cita?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/citas/${citaId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Cita cancelada exitosamente');
            cargarCitas();
        } else {
            const data = await response.json();
            alert(data.detail || 'Error al cancelar cita');
        }
    } catch (error) {
        alert('Error de conexion con el servidor');
    }
}

function mostrarMensaje(elementId, mensaje, tipo) {
    const elemento = document.getElementById(elementId);
    elemento.textContent = mensaje;
    elemento.className = `mensaje ${tipo}`;
    
    setTimeout(() => {
        elemento.style.display = 'none';
    }, 5000);
}

cargarPacientes();
cargarCitas();
