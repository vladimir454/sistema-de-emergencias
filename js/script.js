// --- Global variables and initial setup (existing) ---
const authForm = document.getElementById('authForm');
const registerBtn = document.getElementById('registerBtn'); // This will now be a simple link in index.html
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const passwordFeedback = document.getElementById('passwordFeedback');

// Add new elements for registration form
const registerForm = document.getElementById('registerForm'); // This will only exist on register.html
const registerUsernameInput = document.getElementById('registerUsername');
const registerPasswordInput = document.getElementById('registerPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const registerPasswordFeedback = document.getElementById('registerPasswordFeedback');
const confirmPasswordFeedback = document.getElementById('confirmPasswordFeedback');


// Function to save users (simplified for client-side storage)
function saveUser(username, password) {
    let users = JSON.parse(localStorage.getItem('users')) || {};
    users[username] = password; // Store username and password
    localStorage.setItem('users', JSON.stringify(users));
}

// Function to validate password strength
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

// --- Page routing logic (adapt if you have it) ---
document.addEventListener('DOMContentLoaded', () => {
    
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'index.html' || currentPage === '') { // Login page logic
        const loginContainer = document.querySelector('.login-container');
        const mainAppContainer = document.querySelector('.main-app-container');

        // Check if user is already logged in
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            loginContainer.classList.remove('active');
            mainAppContainer.classList.add('active'); // Show main app
            document.getElementById('loggedInUsername').textContent = loggedInUser;
            // Load patient statistics if applicable (your existing logic)
            loadPatientStatistics();
            loadPatientsIntoTable();
        } else {
            loginContainer.classList.add('active'); // Show login
            mainAppContainer.classList.remove('active'); // Hide main app
        }

        // --- Login Form Submission ---
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = usernameInput.value;
                const password = passwordInput.value;

                let users = JSON.parse(localStorage.getItem('users')) || {};

                if (users[username] && users[username] === password) {
                    localStorage.setItem('loggedInUser', username);
                    loginContainer.classList.remove('active');
                    mainAppContainer.classList.add('active');
                    document.getElementById('loggedInUsername').textContent = username;
                    // Load patient statistics and table after successful login
                    loadPatientStatistics();
                    loadPatientsIntoTable();
                } else {
                    alert('Usuario o contraseña incorrectos.');
                }
            });
        }

        // --- Password input validation (for login form) ---
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                if (!validatePassword(passwordInput.value) && passwordInput.value.length > 0) {
                    passwordInput.classList.add('is-invalid');
                    passwordFeedback.style.display = 'block';
                } else {
                    passwordInput.classList.remove('is-invalid');
                    passwordFeedback.style.display = 'none';
                }
            });
        }

    } else if (currentPage === 'register.html') { // Registration page logic
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent default Bootstrap validation behavior for now

                const username = registerUsernameInput.value.trim();
                const password = registerPasswordInput.value;
                const confirmPassword = confirmPasswordInput.value;

                let isValid = true;

                // Validate Username
                if (username === '') {
                    registerUsernameInput.classList.add('is-invalid');
                    isValid = false;
                } else {
                    registerUsernameInput.classList.remove('is-invalid');
                }

                // Validate Password Strength
                if (!validatePassword(password)) {
                    registerPasswordInput.classList.add('is-invalid');
                    registerPasswordFeedback.style.display = 'block';
                    isValid = false;
                } else {
                    registerPasswordInput.classList.remove('is-invalid');
                    registerPasswordFeedback.style.display = 'none';
                }

                // Validate Password Match
                if (password !== confirmPassword) {
                    confirmPasswordInput.classList.add('is-invalid');
                    confirmPasswordFeedback.style.display = 'block';
                    isValid = false;
                } else {
                    confirmPasswordInput.classList.remove('is-invalid');
                    confirmPasswordFeedback.style.display = 'none';
                }

                if (isValid) {
                    let users = JSON.parse(localStorage.getItem('users')) || {};
                    
                    if (users[username]) {
                        alert('El nombre de usuario ya existe. Por favor, elija otro.');
                        registerUsernameInput.classList.add('is-invalid'); // Mark username as invalid
                    } else {
                        saveUser(username, password);
                        alert('Registro exitoso. Ahora puede iniciar sesión.');
                        window.location.href = 'index.html'; // Redirect to login page
                    }
                } else {
                    alert('Por favor, corrija los errores en el formulario.');
                }
            });
        }
    }

    // --- Logout Button (remains the same) ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html'; // Redirect to login page
        });
    }

    // --- Tab/Section Switching (existing) ---
    document.querySelectorAll('[data-target]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');

            // Remove 'active' from all content sections and add 'active' to the target
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');

            // Update active class for nav links
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // --- Patient form submission (existing) ---
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation(); // Stop event propagation for Bootstrap validation

            // Check if form is valid using Bootstrap's built-in validation
            if (!this.checkValidity()) {
                this.classList.add('was-validated');
                return; // Stop if form is invalid
            }

            const patientData = {
                nombreCompleto: document.getElementById('nombreCompleto').value,
                edad: parseInt(document.getElementById('edad').value),
                genero: document.querySelector('input[name="genero"]:checked')?.value || '',
                documentoIdentidad: document.getElementById('documentoIdentidad').value,
                nivelGravedad: document.getElementById('nivelGravedad').value,
                sintomas: document.getElementById('sintomas').value,
                tratamiento: document.getElementById('tratamiento').value,
                medicamentos: document.getElementById('medicamentos').value,
                examenes: document.getElementById('examenes').value,
                fechaRegistro: new Date().toLocaleString()
            };

            savePatient(patientData);
            updateStatistics();
            loadPatientsIntoTable();
            
            // Show critical patient toast if applicable
            if (patientData.nivelGravedad === 'critico') {
                document.getElementById('criticalPatientName').textContent = patientData.nombreCompleto;
                const toastLiveExample = document.getElementById('criticalPatientToast');
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
                toastBootstrap.show();

                document.getElementById('alertPatientName').textContent = patientData.nombreCompleto;
                document.getElementById('criticalPatientAlertContainer').classList.remove('d-none');
            } else {
                document.getElementById('criticalPatientAlertContainer').classList.add('d-none');
            }

            this.reset(); // Reset the form after submission
            this.classList.remove('was-validated'); // Remove validation styles
            // Reset gender radio buttons validation style manually
            document.querySelectorAll('input[name="genero"]').forEach(radio => {
                radio.classList.remove('is-invalid');
            });
            // Reset select elements as well
            document.getElementById('nivelGravedad').classList.remove('is-invalid');
            document.getElementById('examenes').classList.remove('is-invalid');
        });
    }

    // --- Patient data storage and statistics (existing) ---
    function getPatients() {
        return JSON.parse(localStorage.getItem('patients')) || [];
    }

    function savePatient(patient) {
        const patients = getPatients();
        patients.push(patient);
        localStorage.setItem('patients', JSON.stringify(patients));
    }

    function updateStatistics() {
        const patients = getPatients();
        let criticalCount = 0;
        let urgentCount = 0;
        let moderateCount = 0;
        let mildCount = 0;

        patients.forEach(patient => {
            switch (patient.nivelGravedad) {
                case 'critico':
                    criticalCount++;
                    break;
                case 'urgente':
                    urgentCount++;
                    break;
                case 'moderado':
                    moderateCount++;
                    break;
                case 'leve':
                    mildCount++;
                    break;
            }
        });

        document.getElementById('countCritical').textContent = criticalCount;
        document.getElementById('countUrgent').textContent = urgentCount;
        document.getElementById('countModerate').textContent = moderateCount;
        document.getElementById('countMild').textContent = mildCount;
    }

    function loadPatientStatistics() {
        // Ensure this function is called when relevant data might be available
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            // Only update stats if we're on the main app page after login
            const mainAppContainer = document.querySelector('.main-app-container');
            if (mainAppContainer && mainAppContainer.classList.contains('active')) {
                updateStatistics();
            }
        }
    }


    function loadPatientsIntoTable() {
        const patientTableBody = document.getElementById('patientTableBody');
        if (patientTableBody) { // Check if the table body exists (i.e., we are on the stats page)
            const patients = getPatients();
            patientTableBody.innerHTML = ''; // Clear existing rows

            patients.forEach((patient, index) => {
                const row = patientTableBody.insertRow();

                // Add a class based on severity for styling (if you have these in style.css)
                let severityClass = '';
                switch (patient.nivelGravedad) {
                    case 'critico':
                        severityClass = 'table-danger';
                        break;
                    case 'urgente':
                        severityClass = 'table-warning';
                        break;
                    case 'moderado':
                        severityClass = 'table-info';
                        break;
                    case 'leve':
                        severityClass = 'table-success';
                        break;
                }
                row.classList.add(severityClass);


                row.insertCell().textContent = patient.nombreCompleto;
                row.insertCell().textContent = patient.edad;
                row.insertCell().textContent = patient.genero;
                row.insertCell().textContent = patient.documentoIdentidad;
                row.insertCell().textContent = patient.nivelGravedad;
                row.insertCell().textContent = patient.sintomas;
                row.insertCell().textContent = patient.tratamiento;
                row.insertCell().textContent = patient.medicamentos;
                row.insertCell().textContent = patient.examenes;

                const actionsCell = row.insertCell();
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Eliminar';
                deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
                deleteButton.addEventListener('click', () => {
                    deletePatient(index);
                });
                actionsCell.appendChild(deleteButton);
            });
        }
    }

    function deletePatient(index) {
        let patients = getPatients();
        patients.splice(index, 1); // Remove patient at the given index
        localStorage.setItem('patients', JSON.stringify(patients));
        updateStatistics(); // Update counts
        loadPatientsIntoTable(); // Reload table
        // Hide critical alert if the deleted patient was the critical one and no others exist
        const criticalPatients = patients.filter(p => p.nivelGravedad === 'critico');
        if (criticalPatients.length === 0) {
            document.getElementById('criticalPatientAlertContainer').classList.add('d-none');
        }
    }

    // Call functions on initial load for relevant sections
    loadPatientStatistics();
    loadPatientsIntoTable();

}); // End of DOMContentLoaded