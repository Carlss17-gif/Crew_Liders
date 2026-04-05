
async function registrar() {
  const errorEl = document.getElementById('regError');

  const data = {
    id_empleado:document.getElementById('id_empleado').value.trim(),
    nombre:document.getElementById('nombre').value.trim(),
    fecha_ingreso:document.getElementById('fecha').value,
    entrenador:document.getElementById('entrenador').value.trim(),
    distrito:document.getElementById('distrito').value.trim(),
    sucursal:document.getElementById('sucursal').value.trim(),
    email:document.getElementById('email').value.trim(),
    password:document.getElementById('password').value
  };

  const vacios = Object.values(data).some(v => !v);
  if (vacios) {
    if (errorEl) errorEl.classList.add('show');
    return;
  }

  const { error } = await mysupabase
    .from('empleados')
    .insert([data]);

  if (error) {
    console.error('Error al registrar:', error);
    if (errorEl) {
      errorEl.textContent = 'Error al registrar. Intenta de nuevo.';
      errorEl.classList.add('show');
    }
    return;
  }

  alert('¡Registro exitoso! Ya puedes iniciar sesión.');
  window.location.href = 'index.html';
}

async function login() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('loginError');

  if (!email || !password) {
    if (errorEl) errorEl.classList.add('show');
    return;
  }

  const { data, error } = await mysupabase
    .from('empleados')
    .select('*')          
    .eq('email', email)   
    .eq('password', password)
    .single();            

  if (error || !data) {
    console.error('Error de login:', error);
    if (errorEl) errorEl.classList.add('show');
    return;
  }

  localStorage.setItem('empleado', JSON.stringify(data));

  const recordar = document.getElementById('recordarme');
  if (recordar && recordar.checked) {
    localStorage.setItem('recordar', 'true');
  }

  window.location.href = 'Indice.html';
}


function irRegistro() {
  window.location.href = 'register.html';
}

document.addEventListener('DOMContentLoaded', function () {
  ['email', 'password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') login();
      });
    }
  });
});
