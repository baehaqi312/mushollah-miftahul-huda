import { getUsers, getLoggedInUser, setLoggedInUser, clearLoggedInUser } from './storageService';

export const login = async (email, password, remember = false) => {
    return new Promise(async (resolve) => {
        setTimeout(async () => { // Simulasi API call
            try {
                const users = await getUsers();
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    setLoggedInUser(user);
                    resolve({
                        success: true,
                        user: user,
                        message: 'Login successful'
                    });
                } else {
                    resolve({
                        success: false,
                        errors: {
                            email: email ? null : 'Email is required',
                            password: password ? 'Invalid credentials' : 'Password is required'
                        },
                        message: 'Invalid credentials'
                    });
                }
            } catch (error) {
                console.error('Login error:', error);
                resolve({
                    success: false,
                    errors: {
                        general: 'Unable to connect to authentication service'
                    },
                    message: 'Authentication service error'
                });
            }
        }, 500); // Simulasi delay network
    });
};

export const logout = () => {
    clearLoggedInUser();
};

export const getCurrentUser = () => {
    return getLoggedInUser();
};

export const isAuthenticated = () => {
    return !!getLoggedInUser();
};

export const isAdmin = () => {
    const user = getLoggedInUser();
    return user && user.role === 'admin';
};