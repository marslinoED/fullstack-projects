import { createHashRouter, RouterProvider } from 'react-router-dom';
import './App.css';

import Home from './Components/Pages/Home/Home';
import Notfound from './Components/Shared/Notfound/Notfound';
import Layout from './Components/Layout/Layout';
import Register from './Components/Pages/Auth/Register';
import Login from './Components/Pages/Auth/Login';
import Profile from './Components/Pages/Auth/Profile';
import Productdetails from './Components/Pages/Products/Cards/Productdetails';
import Wishlist from './Components/Pages/Wishlist/Wishlist';
import Brands from './Components/Pages/Brands/Brands';
import Branddetails from './Components/Pages/Brands/BrandSlider/Branddetails';
import AuthContextProvider, { AuthContext } from './Context/Auth/AuthContext';
import ProductsContextProvider from './Context/Products/ProductsContext';
import ScrollToTop from './Components/Shared/ScrollToTop/ScrollToTop';
import Cart from './Components/Pages/Cart/Cart';
import Checkout from './Components/Pages/Checkout/Checkout';
import { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import Orders from './Components/Pages/Orders/Orders';


function AppRoutes() {
  const { User, Token } = useContext(AuthContext);
  const router = createHashRouter([
    {
      path: '/',
      element: <><ScrollToTop /><Layout /></>,
      children: [
        { path: '/', element: <Home /> },
        { path: '/register', element: User && Token ? <Home /> : <Register /> },
        { path: '/login', element: User && Token ? <Home /> : <Login /> },
        { path: '/profile', element: User && Token ? <Profile /> : <Register /> },
        { path: '/productdetails/:id', element: <Productdetails /> },
        { path: '/checkout/:id', element: <Checkout /> },
        { path: '/wishlist', element: User && Token ? <Wishlist /> : <Register /> },
        { path: '/cart', element: User && Token ? <Cart /> : <Register /> },
        { path: '/orders', element: User && Token ? <Orders /> : <Register /> },
        { path: '/brands', element: <Brands />, children: [{ path: ':id', element: <Branddetails /> }] },
        { path: '*', element: <Notfound /> },
      ]
    },
  ]);
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <div className="App">
      <AuthContextProvider>
        <ProductsContextProvider>
          <Toaster />
          <AppRoutes />
        </ProductsContextProvider>
      </AuthContextProvider>
    </div>
  );
}


