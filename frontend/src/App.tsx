import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Home from './pages/homePage.js'
import Login from './pages/loginPage'
import Registration from './pages/registrationPage'
import GameRoom from './pages/gameRoomPage'
import UserPage from './pages/userPage'
import NoPage from './pages/noPage'

// //import "./index.css";

const router = createBrowserRouter([
  {path: "/", element:<Home />},
  {path: "/login", element:<Login/> },
  {path: "/register", element: <Registration />},
  {path: "/game", element: <GameRoom />},
  {path: "/user", element: <UserPage />},
  {path: "*", element: <NoPage />}
  // {path: "/user:username", element:}
]);

const App: React.FC = () => {

  return (
    <div>
      <RouterProvider router={router}></RouterProvider>
    </div>
  )
}

export default App;
