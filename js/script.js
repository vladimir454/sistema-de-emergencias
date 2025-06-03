 // Variables globales
        let patients = [];
        const GRAVITY_ORDER = {
            'critico': 4,
            'urgente': 3,
            'moderado': 2,
            'leve': 1
        };
        const USERS_STORAGE_KEY = 'emergencyPatientsAppUsers';
        const PATIENTS_STORAGE_KEY = 'emergencyPatientsAppPatients';
        let currentUser = null;

        // Referencias a elementos del DOM
        const loginContainer = document.querySelector('.login-container');
        const mainAppContainer = document.querySelector('.main-app-container');
        const authForm = document.getElementById('authForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const passwordFeedback = document.getElementById('passwordFeedback');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const loggedInUsernameSpan = document.getElementById('loggedInUsername'); // New element for username
        const logoutBtn = document.getElementById('logoutBtn'); // Logout button

        const patientForm = document.getElementById('patientForm');
        const patientTableBody = document.getElementById('patientTableBody');
        const criticalPatientAlertContainer = document.getElementById('criticalPatientAlertContainer');
        const alertPatientName = document.getElementById('alertPatientName');
        const criticalPatientToast = new bootstrap.Toast(document.getElementById('criticalPatientToast'));
        const criticalPatientNameToast = document.getElementById('criticalPatientName');

        const countCritical = document.getElementById('countCritical');
        const countUrgent = document.getElementById('countUrgent');
        const countModerate = document.getElementById('countModerate');
        const countMild = document.getElementById('countMild');

        // New DOM elements for sections
        const patientRegistrationSection = document.getElementById('patientRegistrationSection');
        const patientStatisticsSection = document.getElementById('patientStatisticsSection');
        const navLinks = document.querySelectorAll('.nav-link[data-target]');
        const fecha_actual = Date.now();

        // --- Funciones de Utilidad ---

        /**
         * Guarda los usuarios en el almacenamiento local.
         * @param {Object} users - Objeto de usuarios.
         */
        function saveUsers(users) {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }

        /**
         * Carga los usuarios del almacenamiento local.
         * @returns {Object} Objeto de usuarios.
         */
        function loadUsers() {
            const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
            return usersJson ? JSON.parse(usersJson) : {};
        }

        /**
         * Guarda los pacientes para el usuario actual en el almacenamiento local.
         */
        function savePatients() {
            if (currentUser) {
                const allPatients = loadAllPatientsData();
                allPatients[currentUser] = patients;
                localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(allPatients));
            }
        }

        /**
         * Carga todos los datos de pacientes de todos los usuarios.
         * @returns {Object} Objeto que contiene los pacientes por usuario.
         */
        function loadAllPatientsData() {
            const patientsJson = localStorage.getItem(PATIENTS_STORAGE_KEY);
            return patientsJson ? JSON.parse(patientsJson) : {};
        }

        /**
         * Carga los pacientes del usuario actual del almacenamiento local.
         */
        function loadPatients() {
            if (currentUser) {
                const allPatients = loadAllPatientsData();
                patients = allPatients[currentUser] || [];
            } else {
                patients = [];
            }
        }

        /**
         * Muestra un mensaje de tostada (toast) de Bootstrap.
         * @param {string} message - El mensaje a mostrar.
         * @param {string} type - El tipo de alerta (e.g., 'success', 'danger', 'warning').
         */
        function showToast(message, type = 'info') {
            const toastElement = document.createElement('div');
            toastElement.classList.add('toast', 'align-items-center', 'text-white', `bg-${type}`, 'border-0');
            toastElement.setAttribute('role', 'alert');
            toastElement.setAttribute('aria-live', 'assertive');
            toastElement.setAttribute('aria-atomic', 'true');
            toastElement.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            `;
            document.querySelector('.toast-container').appendChild(toastElement);
            const bsToast = new bootstrap.Toast(toastElement, { delay: 3000 });
            bsToast.show();
            toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
        }

        // --- Funciones de Autenticación ---

        /**
         * Maneja el envío del formulario de autenticación.
         * @param {Event} event - El evento de envío.
         */
        authForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const users = loadUsers();

            // Validación de contraseña
            if (password.length < 8) {
                passwordInput.classList.add('is-invalid');
                passwordFeedback.style.display = 'block';
                return;
            } else {
                passwordInput.classList.remove('is-invalid');
                passwordFeedback.style.display = 'none';
            }

            if (event.submitter === loginBtn) {
                // Lógica de inicio de sesión
                if (users[username] && users[username] === password) { // En un entorno real, la contraseña estaría hasheada
                    currentUser = username;
                    localStorage.setItem('currentUser', currentUser); // Store current user session
                    loggedInUsernameSpan.textContent = currentUser; // Display username in navbar
                    loadPatients(); // Cargar pacientes del usuario logueado
                    renderPatientTable();
                    updatePatientCounts();
                    loginContainer.classList.remove('active');
                    mainAppContainer.classList.add('active');
                    showSection('patientRegistrationSection'); // Show registration section by default
                    showToast('Inicio de sesión exitoso.', 'success');
                } else {
                    showToast('Usuario o contraseña incorrectos.', 'danger');
                }
            }
        });

        /**
         * Maneja el registro de un nuevo usuario.
         */
        registerBtn.addEventListener('click', function() {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
             const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&/]{8,}$/;
            const users = loadUsers();

            // Validación de contraseña
            
            if (!passwordRegex.test(password)) {
                
                passwordInput.classList.add('is-invalid');
                passwordFeedback.style.display = 'block';

                return;
            } else {
                passwordInput.classList.remove('is-invalid');
                passwordFeedback.style.display = 'none';
            }

            if (username && password) {
                if (users[username]) {
                    showToast('El usuario ya existe. Por favor, inicie sesión.', 'warning');
                } else {
                    users[username] = password; // En un entorno real, la contraseña estaría hasheada
                    saveUsers(users);
                    showToast('Registro exitoso. Ahora puede iniciar sesión.', 'success');
                    // Limpiar campos después de registrar
                    usernameInput.value = '';
                    passwordInput.value = '';
                  
                }
            } else {
                showToast('Por favor, ingrese un nombre de usuario y contraseña.', 'warning');
            }
        });

        /**
         * Maneja el cierre de sesión del usuario.
         */
        logoutBtn.addEventListener('click', function() {
            currentUser = null;
            localStorage.removeItem('currentUser'); // Clear current user session
            patients = []; // Clear patient data on logout
            renderPatientTable(); // Clear table
            updatePatientCounts(); // Reset counts
            // mainAppContainer.classList.remove('active');
            // loginContainer.classList.add('active');
            usernameInput.value = ''; // Clear login form fields
            passwordInput.value = '';
            criticalPatientAlertContainer.classList.add('d-none'); // Hide critical alert
            showToast('Sesión cerrada.', 'info');
           location.reload();
            
        });

        // --- Funciones de Navegación de Secciones ---

        /**
         * Muestra la sección del contenido especificada y oculta las demás.
         * @param {string} sectionId - El ID de la sección a mostrar.
         */
        function showSection(sectionId) {
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');

            // Update active state in nav links
            navLinks.forEach(link => {
                if (link.dataset.target === sectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        /**
         * Agrega listeners para los enlaces de navegación.
         */
        navLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                showSection(this.dataset.target);
            });
        });

        // --- Funciones de Validación de Formulario de Pacientes ---

        /**
         * Valida un campo de entrada y aplica las clases de Bootstrap correspondientes.
         * @param {HTMLElement} inputElement - El elemento de entrada a validar.
         * @returns {boolean} True si el campo es válido, false en caso contrario.
         */
        function validateInput(inputElement) {
            if (inputElement.type === 'radio') {
                const radioGroup = document.querySelectorAll(`input[name="${inputElement.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked) {
                    radioGroup.forEach(radio => radio.classList.add('is-invalid'));
                    return false;
                } else {
                    radioGroup.forEach(radio => radio.classList.remove('is-invalid'));
                    return true;
                }
            } else if (inputElement.tagName === 'SELECT') {
                if (!inputElement.value) {
                    inputElement.classList.add('is-invalid');
                    return false;
                } else {
                    inputElement.classList.remove('is-invalid');
                    return true;
                }
            } else {
                if (!inputElement.value.trim()) {
                    inputElement.classList.add('is-invalid');
                    return false;
                } else {
                    inputElement.classList.remove('is-invalid');
                    return true;
                }
            }
        }

        /**
         * Valida la edad del paciente.
         * @returns {boolean} True si la edad es válida, false en caso contrario.
         */
        function validateEdad() {
            const edadInput = document.getElementById('edad');
            const edad = parseInt(edadInput.value);
            if (isNaN(edad) || edad <= 0) {
                edadInput.classList.add('is-invalid');
                return false;
            } else {
                edadInput.classList.remove('is-invalid');
                return true;
            }
        }

        /**
         * Valida el documento de identidad.
         * @returns {boolean} True si el documento es válido, false en caso contrario.
         */
        function validateDocumento() {
            const documentoInput = document.getElementById('documentoIdentidad');
            if (documentoInput.value.trim().length < 5) {
                documentoInput.classList.add('is-invalid');
                return false;
            } else {
                documentoInput.classList.remove('is-invalid');
                return true;
            }
        }

        /**
         * Agrega listeners para validación en tiempo real.
         */
        function addRealtimeValidationListeners() {
            document.getElementById('edad').addEventListener('input', validateEdad);
            document.getElementById('documentoIdentidad').addEventListener('input', validateDocumento);

            const requiredInputs = patientForm.querySelectorAll('[required]');
            requiredInputs.forEach(input => {
                input.addEventListener('input', () => validateInput(input));
                if (input.type === 'radio') {
                    input.addEventListener('change', () => validateInput(input));
                }
            });
        }

        // --- Funciones de Gestión de Pacientes ---

        /**
         * Maneja el envío del formulario de registro de pacientes.
         * @param {Event} event - El evento de envío.
         */
        patientForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevenir el envío por defecto del formulario

            let formIsValid = true;

            // Validar todos los campos requeridos
            const requiredInputs = patientForm.querySelectorAll('[required]');
            requiredInputs.forEach(input => {
                if (!validateInput(input)) {
                    formIsValid = false;
                }
            });

            // Validaciones específicas
            if (!validateEdad()) {
                formIsValid = false;
            }
            if (!validateDocumento()) {
                formIsValid = false;
            }

            if (!formIsValid) {
                showToast('Por favor, complete todos los campos requeridos y corrija los errores.', 'danger');
                return;
            }
            
            // Recopilar datos del formulario
            const newPatient = {
                id: Date.now(), // ID único para el paciente
                nombreCompleto: document.getElementById('nombreCompleto').value.trim(),
                edad: parseInt(document.getElementById('edad').value),
                genero: document.querySelector('input[name="genero"]:checked').value,
                documentoIdentidad: document.getElementById('documentoIdentidad').value.trim(),
                sintomas: document.getElementById('sintomas').value.trim(),
                nivelGravedad: document.getElementById('nivelGravedad').value,
                tratamiento: document.getElementById('tratamiento').value.trim(),
                medicamentos: document.getElementById('medicamentos').value.trim(),
                examenes: document.getElementById('examenes').value
                        
            };

            patients.push(newPatient);
            savePatients(); // Guardar pacientes en localStorage

            renderPatientTable(); // Actualizar la tabla
            updatePatientCounts(); // Actualizar contadores
            patientForm.reset(); // Limpiar el formulario

            // Remover clases de validación después de un registro exitoso
            patientForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            patientForm.classList.remove('was-validated'); // Remover la clase de Bootstrap si se usó
            showSection('patientStatisticsSection');
            showToast('Paciente registrado exitosamente.', 'success');

            // Mostrar alerta si el paciente es crítico
            if (newPatient.nivelGravedad === 'critico') {
                alertPatientName.textContent = newPatient.nombreCompleto;
                criticalPatientAlertContainer.classList.remove('d-none');
                criticalPatientToast.show();
                criticalPatientNameToast.textContent = newPatient.nombreCompleto;
            }
        });

        /**
         * Renderiza la tabla de pacientes, ordenándolos por gravedad.
         */
        function renderPatientTable() {
            // Ordenar pacientes por nivel de gravedad
            const sortedPatients = [...patients].sort((a, b) => {
                return GRAVITY_ORDER[b.nivelGravedad] - GRAVITY_ORDER[a.nivelGravedad];
            });

            patientTableBody.innerHTML = ''; // Limpiar tabla antes de renderizar

            if (sortedPatients.length === 0) {
                patientTableBody.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-muted">No hay pacientes registrados.</td></tr>`;
                return;
            }

            sortedPatients.forEach(patient => {
                const row = patientTableBody.insertRow();
                let gravityClass = '';
                switch (patient.nivelGravedad) {
                    case 'critico':
                        gravityClass = 'bg-critical';
                        break;
                    case 'urgente':
                        gravityClass = 'bg-urgent';
                        break;
                    case 'moderado':
                        gravityClass = 'bg-moderate';
                        break;
                    case 'leve':
                        gravityClass = 'bg-mild';
                        break;
                }

                row.classList.add(gravityClass);

                row.innerHTML = `
                    <td>${patient.nombreCompleto}</td>
                    <td>${patient.edad}</td>
                    <td>${patient.genero}</td>
                    <td>${patient.documentoIdentidad}</td>
                    <td>${patient.nivelGravedad.charAt(0).toUpperCase() + patient.nivelGravedad.slice(1)}</td>
                    <td>${patient.sintomas}</td>
                    <td>${patient.tratamiento}</td>
                    <td>${patient.medicamentos}</td>
                    <td>${patient.examenes.charAt(0).toUpperCase() + patient.examenes.slice(1).replace(/_/g, ' ')}</td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm" data-id="${patient.id}">Eliminar</button>
                    </td>
                `;
            });

            // Añadir event listeners a los botones de eliminar
            patientTableBody.querySelectorAll('.btn-danger').forEach(button => {
                button.addEventListener('click', function() {
                    const patientId = parseInt(this.dataset.id);
                    deletePatient(patientId);
                });
            });
        }

        /**
         * Elimina un paciente de la lista.
         * @param {number} id - El ID del paciente a eliminar.
         */
        function deletePatient(id) {
            patients = patients.filter(patient => patient.id !== id);
            savePatients();
            renderPatientTable();
            updatePatientCounts();
            showToast('Paciente eliminado exitosamente.', 'info');
        }

        /**
         * Actualiza los contadores de pacientes por nivel de gravedad.
         */
        function updatePatientCounts() {
            const counts = {
                critico: 0,
                urgente: 0,
                moderado: 0,
                leve: 0
            };

            patients.forEach(patient => {
                counts[patient.nivelGravedad]++;
            });

            countCritical.textContent = counts.critico;
            countUrgent.textContent = counts.urgente;
            countModerate.textContent = counts.moderado;
            countMild.textContent = counts.leve;
        }

        // --- Inicialización ---

        /**
         * Función para inicializar la aplicación al cargar la página.
         */
        document.addEventListener('DOMContentLoaded', function() {
            addRealtimeValidationListeners(); // Configurar validación en tiempo real

            // Ocultar la alerta crítica al inicio
            criticalPatientAlertContainer.classList.add('d-none');

            // Check for existing user session
            currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                loggedInUsernameSpan.textContent = currentUser;
                loadPatients();
                renderPatientTable();
                updatePatientCounts();
                loginContainer.classList.remove('active');
                mainAppContainer.classList.add('active');
                showSection('patientStatisticsSection'); // Show registration section by default on login
            } else {
                loginContainer.classList.add('active'); // Show login if no session
            }
        });  