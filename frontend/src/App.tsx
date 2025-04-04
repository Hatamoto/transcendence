import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/homePage'
import Login from './pages/loginPage'
import Registration from './pages/registrationPage'
import GameRoom from './pages/gameRoomPage'
import NoPage from './pages/noPage'
import React from 'react'
import "./index.css";

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

// { package.json
// 	"scripts": {
// 	"build": "npx tsc --project ./tsconfig.json  && npx tailwindcss -i ./src/input.css -o ./dist/output.css && cp ./src/index.html ./dist/index.html",
// 	"watch": "npx tsc --project ./tsconfig.json --watch & vite & npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch"
// 	},
// 	"dependencies": {
// 	  "@tailwindcss/cli": "^4.0.8",
// 	  "socket.io-client": "^4.8.1"
// 	},
// 	"devDependencies": {
// 	  "@types/socket.io-client": "^1.4.36",
// 	  "tailwindcss": "^4.0.8",
// 	  "typescript": "^5.8.2",
// 	  "vite": "^5.2.0"
// 	}
//   }
  
// { tsconfig.json
// 	"compilerOptions": {
// 		"target": "ES6",
// 		"module": "ESNext",
// 		"moduleResolution": "Bundler",
// 		"esModuleInterop": true,
// 		"allowSyntheticDefaultImports": true,
// 		"outDir": "./dist",
// 		"rootDir": "./src",
// 		"baseUrl": "./",
// 		"paths": {
// 			// "socket.io-client": ["node_modules/socket.io-client"],
// 			"undici-types": ["node_modules/undici-types"]
// 		},
// 		"lib": ["dom", "es6"],
// 		"strict": false
// 	},
// 	"include": ["src/**/*"],
// 	"exclude": ["node_modules"]
// 	} 