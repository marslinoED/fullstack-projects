import axios from 'axios';
import toast from 'react-hot-toast';
import React, { createContext, useCallback, useEffect, useState } from 'react'
export let AuthContext = createContext();
export default function AuthContextProvider(props) {
    const BaseUrl = "https://ecommerce.routemisr.com/api/v1";

    const [User, setUser] = useState({
        email: "",
        password: "",
    });
    const [Token, setToken] = useState(null);

    async function loginAPI(values) {
        return await axios.post(`${BaseUrl}/auth/signin`, values).then((res) => res).catch((error) => error);
    }
    async function registerAPI(values) {
        return await axios.post(`${BaseUrl}/auth/signup`, values).then((res) => res).catch((error) => error);
    }
    async function VerifyTokenAPI(token) {
        return await axios.get(`${BaseUrl}/auth/verifyToken`, { headers: { "token": token } })
            .then((res) => {
                toast.success("Token verified successfully.");
                localStorage.setItem("id", JSON.stringify(res.data.decoded.id));
                return res.data.message === "verified";
            })
            .catch((error) => {
                console.log("Token verification failed:", error);
                toast.error("Session expired. Please log in again.");
                return false; // Return false instead of error object
            });
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('id');
        setToken(null);
        setUser(null);
    }
    async function changePasswordAPI(currentPassword, newPassword) {

        try {
            await axios.put(`${BaseUrl}/users/changeMyPassword`, {
                "currentPassword": currentPassword,
                "password": newPassword,
                "rePassword": newPassword
            }, {
                headers: { "token": Token }
            })
            logout();
            toast.success("Password changed successfully, please log in again.");
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error("Error changing password. Please check your current password and try again later.");
        }
    }

    const getUser = useCallback(async () => {
        let user = JSON.parse(localStorage.getItem("user"));
        let token = JSON.parse(localStorage.getItem("token"));
        localStorage.setItem("token", JSON.stringify(token));
        if (user && token) {
            if (await VerifyTokenAPI(token)) {
                setUser(user);
                setToken(token);

            }
            else {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
        }
    }, [])

    useEffect(() => {
        getUser();
    }, [getUser, Token])


    return (
        <AuthContext.Provider value={{
            User,
            Token,
            setUser,
            setToken,
            loginAPI,
            registerAPI,
            changePasswordAPI,
            logout
        }}>
            {props.children}
        </AuthContext.Provider>
    )
}

