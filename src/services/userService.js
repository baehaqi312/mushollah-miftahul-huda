import { getUsers, saveUsers } from './storageService';

export const fetchUsers = () => getUsers();

export const addUser = (user) => {
    console.log('userService - addUser called with:', user);
    const users = getUsers();
    const newUser = {
        ...user,
        id: Date.now(), // ID unik sederhana
    };
    console.log('userService - Adding new user:', newUser);
    users.push(newUser);
    saveUsers(users);
};

export const updateUser = (updatedUser) => {
    console.log('userService - updateUser called with:', updatedUser);
    let users = getUsers();
    console.log('userService - users before update:', users);

    users = users.map(user => {
        if (user.id === updatedUser.id) {
            // Jika password tidak dikirim (edit mode), gunakan password lama
            if (!updatedUser.password) {
                return { ...updatedUser, password: user.password };
            }
            return updatedUser;
        }
        return user;
    });

    console.log('userService - users after update:', users);
    saveUsers(users);
};

export const deleteUser = (userId) => {
    console.log('userService - deleteUser called with ID:', userId);
    let users = getUsers();
    users = users.filter(user => user.id !== userId);
    console.log('userService - users after delete:', users);
    saveUsers(users);
};