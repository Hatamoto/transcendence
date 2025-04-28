import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Home from './pages/homePage'
import Login from './pages/loginPage'
import Registration from './pages/registrationPage'
import GameRoom from './pages/gameRoomPage'
import UserPage from './pages/userPage'
import NoPage from './pages/noPage'
import ProfilePage from './pages/profilePage'
import EditProfile from './pages/editProfile'

// //import "./index.css";

const router = createBrowserRouter([
  {path: "/", element:<Home />},
  {path: "/home", element:<Home />},
  {path: "/login", element:<Login/> },
  {path: "/register", element: <Registration />},
  {path: "/game", element: <GameRoom />},
  {path: "/user", element: <UserPage />},
  {path: "*", element: <NoPage />},
  {path: "/user/profile", element: <ProfilePage />},
  {path: "/user/edit", element: <EditProfile />}
]);

const App: React.FC = () => {

  return (
    <div>
      <RouterProvider router={router}></RouterProvider>
    </div>
  )
}

export default App;
