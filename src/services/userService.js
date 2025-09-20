import { getUsers, saveUsers } from './storageService';

// Loading state untuk user service
const loading = {
    fetch: false,
    add: false,
    update: false,
    delete: false
};

// Export loading state
export const getLoadingState = () => ({ ...loading });
export const isLoading = () => Object.values(loading).some(state => state);
export const isLoadingOperation = (operation) => loading[operation] || false;

export const fetchUsers = async () => {
    loading.fetch = true;
    try {
        return await getUsers();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    } finally {
        loading.fetch = false;
    }
};

export const addUser = async (user) => {
    loading.add = true;
    try {
        console.log('userService - addUser called with:', user);
        const users = await getUsers();
        const newUser = {
            ...user,
            id: Date.now(), // ID unik sederhana
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        console.log('userService - Adding new user:', newUser);
        users.push(newUser);
        await saveUsers(users);
        return newUser;
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    } finally {
        loading.add = false;
    }
};

export const updateUser = async (updatedUser) => {
    loading.update = true;
    try {
        console.log('userService - updateUser called with:', updatedUser);
        let users = await getUsers();
        console.log('userService - users before update:', users);

        const updatedUserWithTimestamp = {
            ...updatedUser,
            updated_at: new Date().toISOString()
        };

        users = users.map(user => {
            if (user.id === updatedUser.id) {
                // Jika password tidak dikirim (edit mode), gunakan password lama
                if (!updatedUser.password) {
                    return {
                        ...updatedUserWithTimestamp,
                        password: user.password,
                        created_at: user.created_at // Preserve created_at
                    };
                }
                return {
                    ...updatedUserWithTimestamp,
                    created_at: user.created_at // Preserve created_at
                };
            }
            return user;
        });

        console.log('userService - users after update:', users);
        await saveUsers(users);
        return updatedUserWithTimestamp;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    } finally {
        loading.update = false;
    }
};

export const deleteUser = async (userId) => {
    loading.delete = true;
    try {
        console.log('userService - deleteUser called with ID:', userId);
        let users = await getUsers();
        users = users.filter(user => user.id !== userId);
        console.log('userService - users after delete:', users);
        await saveUsers(users);
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    } finally {
        loading.delete = false;
    }
};