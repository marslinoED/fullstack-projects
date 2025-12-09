import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
export let UsersContext = createContext();

export default function UsersContextProvider(props) {
    const BaseUrl = "https://tours-app-api-drab.vercel.app/api/v1/users";
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    async function login(email, password) {
        try {
            const res = await axios.post(`${BaseUrl}/login`, { email, password });
            console.log(res);
            if (res.data.status === 'success') {
                const userData = {
                    name: res.data.data.user.name,
                    email: res.data.data.user.email,
                    photo: res.data.data.user.photo,
                    token: res.data.data.token
                };
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData); // Update state immediately
            }
            return res;
        } catch (error) {
            return error;
        }
    }

    async function signup(name, email, password, confirmPassword) {
        return await axios.post(`${BaseUrl}/signup`, { "name": name, "email": email, "password": password, "passwordConfirm": confirmPassword })
            .then((res) => res)
            .catch((error) => error);
    }

    async function forgotPassword(email) {
        return await axios.post(`${BaseUrl}/forgotPassword`, { email }).then((res) => res).catch((error) => error);
    }

    async function updatePassword(passwordCurrent, password, passwordConfirm) {
        try {
            const token = user?.token;
            if (!token) return { response: { data: { message: 'Not authenticated' } } };

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const res = await axios.patch(`${BaseUrl}/updatePassword`, {
                "currentPassword": passwordCurrent,
                "newPassword": password,
                "newPasswordConfirm": passwordConfirm
            }, config);

            if (res.data.status === 'success') {
                logout();
            }
            return res;
        } catch (error) {
            return error;
        }
    }

    function logout() {
        localStorage.removeItem('user');
        setUser(null);
    }

    return (
        <UsersContext.Provider value={{
            login,
            signup,
            forgotPassword,
            updatePassword,
            logout,
            user,
            setUser
        }}>
            {props.children}
        </UsersContext.Provider>
    )
}

