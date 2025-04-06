import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/homePage.js'
import Login from './pages/loginPage'
import Registration from './pages/registrationPage'
import GameRoom from './pages/gameRoomPage'
import NoPage from './pages/noPage'
import React from 'react'
//import "./index.css";

const App: React.FC = () => {

  return (
  <div>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Registration/>} />
        <Route path="/game" element={<GameRoom/>} />
        <Route path="*" element={<NoPage/>} />
      </Routes>
    </BrowserRouter>
  </div>
  )
}

export default App
