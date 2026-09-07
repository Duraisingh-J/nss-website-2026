import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home     from "./pages/Home";
import About    from "./pages/About";
import Sessions from "./pages/Sessions";
import Events   from "./pages/Events";
import People   from "./pages/People";
import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />}     />
        <Route path="/about"    element={<About />}    />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/events"   element={<Events />}   />
        <Route path="/people"   element={<People />}   />
      </Routes>
    </BrowserRouter>
  );
}
