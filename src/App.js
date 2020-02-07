import React from "react";
import "./style.scss";
import Board from "./component/Board";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const height = 8;
  const width = 8;
  const mines = 10;

  return (
    <div className="game">
      <Board height={height} width={width} mines={mines} />
    </div>
  );
}

export default App;
