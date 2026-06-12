import { createHashRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import Layout from './Components/Layout/Layout';
import Home from './Components/Pages/Home/Home';
import Chating from './Components/Pages/Chating/Chating';
import NotFound from './Components/Shared/Notfound/Notfound';

function AppRoutes() {
  const router = createHashRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/chat/:roomCode', element: <Chating /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
}
