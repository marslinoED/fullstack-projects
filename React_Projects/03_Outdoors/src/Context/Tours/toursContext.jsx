import axios from 'axios';
import React, { createContext, useCallback, useEffect, useState } from 'react'
export let ToursContext = createContext();
export default function ToursContextProvider(props) {
    const BaseUrl = "https://tours-app-api-drab.vercel.app/api/v1/tours";

    const [ToursData, setToursData] = useState(null);

    const fetchTours = useCallback(async (queryParams = '') => {
        try {
            const url = queryParams ? `${BaseUrl}?${queryParams}` : BaseUrl;
            const res = await axios.get(url);
            if (res.data.status === 'success') {
                setToursData(res.data.data);
            }
            return res;
        } catch (error) {
            return error;
        }
    }, []);

    const fetchTour = useCallback(async (id) => {
        return await axios.get(`${BaseUrl}/${id}`).then((res) => res).catch((error) => error);
    }, []);

    useEffect(() => {
        fetchTours();
    }, []);
    return (
        <ToursContext.Provider value={{
            fetchTours,
            fetchTour,
            ToursData,
            setToursData
        }}>
            {props.children}
        </ToursContext.Provider>
    )
}

