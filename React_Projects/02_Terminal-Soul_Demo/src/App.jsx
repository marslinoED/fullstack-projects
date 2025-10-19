import './App.css';
import { createHashRouter } from 'react-router-dom';
import Notfound from './Components/Shared/Notfound/Notfound';
import { RouterProvider } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import Game from './Components/Pages/Game/Game';
import { GameProvider } from './Context/GameContext';
import { GuessingGameProvider } from './Context/GuessingGameContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {

  const router = createHashRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: '/game',
          element: <Game />
        },
        {
          path: '*',
          element: <Notfound />
        }
      ]
    }
  ]);
  return (
    <GuessingGameProvider>
      <GameProvider>
        <div className="App">
          <RouterProvider router={router} />
        </div>
      </GameProvider>
    </GuessingGameProvider>
  );
}

export default App;
