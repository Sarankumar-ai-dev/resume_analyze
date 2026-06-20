import {BrowserRouter,Routes,Route} from "react-router-dom"
import Home from './components/Home'
import Chat from './components/Chat'
import BuildResumePage from "./components/BuildResumePage"
import ATSPage from "./components/ATSPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<Home />} />
         <Route path="/chat" element={<Chat />} />
         <Route path="/build" element={<BuildResumePage />} />
         <Route path="/ats" element={<ATSPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
