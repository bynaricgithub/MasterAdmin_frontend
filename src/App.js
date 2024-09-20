import React from "react";
import { Route, Routes } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.css";

import Error404 from "./component/Error404";

function App() {
  return (
    <div className="content">
      <Routes>
        <Route path="/*" element={<Error404 />} />
      </Routes>
    </div>
  );
}

export default App;
