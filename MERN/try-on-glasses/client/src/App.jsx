import { createHashRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import Layout from './Components/Layout/Layout';
import Home from './Components/Pages/Home/Home';
import NotFound from './Components/Shared/Notfound/Notfound';
import Widget from './Components/Shared/Widget/Widget';
function AppRoutes() {
  const router = createHashRouter([
    {
      path: '/',
      element: <><Layout /></>,
      children: [
        { path: '/', element: <Home /> },
        { path: '/widget', element: <Widget /> },
        { path: '*', element: <NotFound /> },
      ],
    },
    { path: '*', element: <NotFound /> }
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
