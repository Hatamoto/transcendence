import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Home from './pages/homePage'
import Login from './pages/loginPage'
import Registration from './pages/registrationPage'
import GameRoom from './pages/gameRoomPage'
import UserPage from './pages/userPage'
import NoPage from './pages/noPage'
import TournamentsPage from './pages/tournamentPage.js'
import ProfilePage from './pages/profilePage'
import ProtectedRoutes from './components/authRoutes'

// //import "./index.css";

export const router = createBrowserRouter([
  {path: "/", element:<Home />},
  {path: "/home", element:<Home />},
  {path: "/login", element:<Login/> },
  {path: "/register", element: <Registration />},
{	path: "/game", element: <ProtectedRoutes> <GameRoom matchType="normal" /></ProtectedRoutes> },
	{path: "/solo-game", element: <ProtectedRoutes> <GameRoom matchType="solo" /></ProtectedRoutes> },
	{path: "/tour-game", element: <ProtectedRoutes> <GameRoom matchType="tournament" /></ProtectedRoutes> },
  {path: "/tournaments", element: <ProtectedRoutes> <TournamentsPage /></ProtectedRoutes>},
  {path: "/user", element: <ProtectedRoutes><UserPage /></ProtectedRoutes>},
  {path: "*", element: <NoPage />},
  {path: "/user/profile", element: <ProtectedRoutes><ProfilePage /></ProtectedRoutes>}
]);

const App: React.FC = () => {

  return (
    <div
      style={{ cursor: "url('cursor.png'), auto" }}
      className="min-h-screen"
    >
      <RouterProvider router={router}></RouterProvider>
    </div>
  )
}

export default App;
