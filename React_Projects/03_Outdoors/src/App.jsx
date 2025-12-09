import { createHashRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import ToursContextProvider, { ToursContext } from './Context/Tours/toursContext';
import UsersContextProvider from './Context/Users/usersContext';
import { useContext } from 'react';
import { Toaster } from 'react-hot-toast';

import Layout from './Components/Layout/Layout';
import Home from './Components/Pages/Home/Home';
import Tours from './Components/Pages/Tours/Tours';

import TourDetails from './Components/Pages/Tours/TourDetails/TourDetails';
import Login from './Components/Pages/Login/Login';
import Signup from './Components/Pages/Signup/Signup';
import Profile from './Components/Pages/Profile/Profile';
import NotFound from './Components/Pages/NotFound/NotFound';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

function AppRoutes() {
  const { ToursData } = useContext(ToursContext);
  const router = createHashRouter([
    {
      path: '/',
      element: <><Layout /></>,
      children: [
        { path: '/', element: <Home /> },
        { path: '/tours', element: <Tours Tours={ToursData} /> },
        { path: '/tours/:id', element: <TourDetails /> },
        { path: '/login', element: <Login /> },
        { path: '/signup', element: <Signup /> },
        { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <div className="App">
      <UsersContextProvider>
        <ToursContextProvider>
          <Toaster />
          <AppRoutes />
        </ToursContextProvider>
      </UsersContextProvider>
    </div>
  );
}


