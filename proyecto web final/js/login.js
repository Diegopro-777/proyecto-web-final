const DB_NAME = 'SupplemenStoreDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';
let db;



/**
 * 
 * 
 */
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {

                const store = db.createObjectStore(STORE_NAME, { keyPath: 'email' });
                console.log('Object Store "users" creada o actualizada.');
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject(new Error("Error al abrir IndexedDB: " + event.target.errorCode));
        };
    });
};

/**
 * 
 */
const registerUser = async(email, name, password) => {
    try {
        await openDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const newUser = {
            email: email,
            password: password,
            name: name,
            createdAt: new Date()
        };


        const request = store.add(newUser);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve({ success: true });
            };
            request.onerror = () => {

                if (request.error.name === 'ConstraintError') {
                    reject({ success: false, message: 'El email ya está registrado.' });
                } else {
                    reject({ success: false, message: 'Error desconocido al registrar.' });
                }
            };
            transaction.oncomplete = () => {
                db.close();
            };
        });

    } catch (error) {
        console.error("Error en registro:", error);
        return { success: false, message: 'Error de base de datos.' };
    }
};

/**
 * 
 */
const validateCredentials = (email, password) => {
    return new Promise(async(resolve, reject) => {
        try {
            await openDB();
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.get(email);

            request.onsuccess = (event) => {
                const user = event.target.result;
                if (user && user.password === password) {
                    // Éxito
                    resolve({ success: true, user });
                } else {
                    // Falla
                    resolve({ success: false, message: 'Usuario o contraseña inválidos.' });
                }
            };

            request.onerror = (event) => {
                console.error("Error al buscar usuario:", event.target.error);
                reject(event.target.error);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        } catch (error) {
            reject(error);
        }
    });
};


const handleLogin = async(event) => {
    event.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';
    const loginErrorDiv = document.getElementById('login-error-message');
    const loginButton = document.querySelector('#login-form button[type="submit"]');

    if (loginErrorDiv) loginErrorDiv.textContent = '';

    if (!email || !password) {
        if (loginErrorDiv) loginErrorDiv.textContent = 'Por favor, ingrese email y contraseña.';
        return;
    }

    try {
        if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = 'Verificando...';
        }

        const result = await validateCredentials(email, password);

        if (result.success) {

            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', result.user.email);
            localStorage.setItem('userName', result.user.name);

            alert(`Bienvenido de nuevo, ${result.user.name}!`);
            window.location.href = 'index.html';
        } else {

            if (loginErrorDiv) {
                loginErrorDiv.textContent = result.message;
            }
        }
    } catch (error) {
        console.error('Error durante el proceso de login:', error);
        if (loginErrorDiv) {
            loginErrorDiv.textContent = 'Ocurrió un error al intentar acceder a la base de datos.';
        }
    } finally {
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = 'Acceder';
        }
    }
};


const handleRegister = async(event) => {
    event.preventDefault();

    const nameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmInput = document.getElementById('confirm-password');
    const registerErrorDiv = document.getElementById('register-error-message');
    const registerButton = document.querySelector('#register-form button[type="submit"]');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (registerErrorDiv) registerErrorDiv.textContent = '';

    if (password !== confirmPassword) {
        if (registerErrorDiv) registerErrorDiv.textContent = 'Las contraseñas no coinciden.';
        return;
    }

    try {
        if (registerButton) {
            registerButton.disabled = true;
            registerButton.textContent = 'Registrando...';
        }

        const result = await registerUser(email, name, password);

        if (result.success) {
            alert(`Registro exitoso para ${name}. Ahora puedes iniciar sesión!`);
            event.target.reset();
        } else {
            if (registerErrorDiv) {
                registerErrorDiv.textContent = result.message;
            }
        }
    } catch (error) {
        console.error('Error durante el proceso de registro:', error);
        if (registerErrorDiv) {
            registerErrorDiv.textContent = 'Error de conexión. Inténtelo de nuevo.';
        }
    } finally {
        if (registerButton) {
            registerButton.disabled = false;
            registerButton.textContent = 'Registrarse';
        }
    }
};



document.addEventListener('DOMContentLoaded', () => {

    openDB().catch(console.error);

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});