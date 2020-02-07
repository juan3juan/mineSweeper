import React, { useState, useEffect } from "react";
import Cell from "./Cell";
import { render } from "@testing-library/react";

const Board = ({ height, width, mines }) => {
  const [gameStatus, setGameStatus] = useState("Processing");
  const [mineCount, setMineCount] = useState(mines);
  const [boardData, setBoardData] = useState();
  const [start, setStart] = useState(false);

  useEffect(() => {
    // let data = initBoardData(height, width, mines);
    // setBoardData(data);
    // console.log("useEff");
  }, [boardData]);
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [-1, 1],
    [-1, -1],
    [1, 1],
    [1, -1]
  ];

  function startGame() {
    let data = initBoardData(height, width, mines);
    setBoardData(data);
    setGameStatus("Processing");
    setStart(true);
  }
  const initBoardData = (height, width, mines) => {
    let data = createEmptyArray(height, width);
    let mineData = plantMines(data, height, width, mines);
    data = getNeighbours(mineData[0], mineData[1], height, width);
    return data;
  };

  function createEmptyArray(height, width) {
    let data = [];
    for (let i = 0; i < height; i++) {
      data.push([]);
      for (let j = 0; j < width; j++) {
        data[i][j] = {
          x: i,
          y: j,
          isMine: false,
          neighbour: 0,
          isRevealed: false,
          isEmpty: false,
          isFlagged: false
        };
      }
    }
    // console.log("createdata");
    // console.log(data);
    return data;
  }

  function plantMines(data, height, width, mines) {
    let ranx,
      rany,
      minesPlanted = 0;
    let mineArr = [];
    while (minesPlanted < mines) {
      ranx = getRandomNumber(width);
      rany = getRandomNumber(height);
      if (!data[ranx][rany].isMine) {
        data[ranx][rany].isMine = true;
        minesPlanted++;
        mineArr.push([ranx, rany]);
      }
    }
    console.log("mineArr");
    console.log(mineArr);
    return [data, mineArr];
  }

  function getNeighbours(data, mineArr, height, width) {
    for (let i = 0; i < mineArr.length; i++) {
      let x = mineArr[i][0];
      let y = mineArr[i][1];
      for (let j = 0; j < dirs.length; j++) {
        let newX = x + dirs[j][0];
        let newY = y + dirs[j][1];
        if (
          newX >= 0 &&
          newX < width &&
          newY >= 0 &&
          newY < height &&
          data[newX][newY].isMine === false
        ) {
          let neib = data[newX][newY].neighbour;
          neib++;
          data[newX][newY].neighbour = neib;
        }
      }
    }
    return data;
  }

  function getRandomNumber(dimension) {
    return Math.floor(Math.random() * dimension);
  }

  // reveal the whole board
  function revealBoard() {
    let updateData = boardData;
    updateData.map(datarow => {
      datarow.map(dataitem => {
        dataitem.isRevealed = true;
      });
    });
    setBoardData(updateData);
  }

  // reveal empty
  function revealEmpty(data, x, y) {
    if (
      x < 0 ||
      x >= width ||
      y < 0 ||
      y >= height ||
      data[x][y].isFlagged ||
      data[x][y].isRevealed
    )
      return null;
    if (data[x][y].isMine) return null;
    if (!data[x][y].isEmpty) return null;
    data[x][y].isRevealed = true;
    for (let i = 0; i < dirs.length; i++) {
      let newX = x + dirs[0];
      let newY = y + dirs[1];
      revealEmpty(data, newX, newY);
    }
  }

  function getMines(data) {
    let mineArr = [];
    data.map(datarow => {
      datarow.map(dataitem => {
        if (dataitem.isMine) mineArr.push(dataitem);
      });
    });
    return mineArr;
  }

  function getFlags(data) {
    let flagArr = [];
    data.map(datarow => {
      datarow.map(dataitem => {
        if (dataitem.isFlagged) {
          flagArr.push(dataitem);
        }
      });
    });
    return flagArr;
  }

  function getUnReveal(data) {
    let unReavelArr = [];
    data.map(datarow => {
      datarow.map(dataitem => {
        if (!dataitem.isRevealed) {
          unReavelArr.push(dataitem);
        }
      });
    });
    return unReavelArr;
  }

  function handleCellClick(x, y) {
    console.log(x);
    console.log(y);
    if (boardData[x][y].isRevealed || boardData[x][y].isFlagged) return null;
    if (boardData[x][y].isMine) {
      setGameStatus("Lost");
      revealBoard();
      alert("Game Over");
    }
    let updateData = boardData;
    updateData[x][y].isFlagged = false;
    updateData[x][y].isRevealed = true;

    if (updateData[x][y].isEmpty) {
      updateData = revealEmpty(x, y, updateData);
    }
    if (getUnReveal(updateData).length === mines) {
      setMineCount(0);
      setGameStatus("Win");
      revealBoard();
      alert("You win");
    }
    // alert(x, y);
    setBoardData(updateData);
    setMineCount(mines - getFlags(updateData).length);
  }

  // right click to flag
  function handleContextMenu(event, x, y) {
    event.preventDefault();
    let updateData = boardData;
    let mineFlag = mineCount;

    if (updateData[x][y].isRevealed) return null;
    if (updateData[x][y].isFlagged) {
      updateData[x][y].isFlagged = false;
      mineFlag++;
    } else {
      updateData[x][y].isFlagged = true;
      mineFlag--;
    }
    if (mineFlag === 0) {
      const mineArr = getMines(updateData);
      const flagArr = getFlags(updateData);
      if (JSON.stringify(mineArr) === JSON.stringify(flagArr)) {
        setMineCount(0);
        setGameStatus("Win");
        revealBoard();
        alert("Win");
      }
    }
    setBoardData(updateData);
    setMineCount(mineFlag);
  }

  function renderBoard(data) {
    return data.map(datarow => {
      return datarow.map(dataitem => {
        return (
          <div key={dataitem.x * datarow.length + dataitem.y}>
            <Cell
              onClick={() => handleCellClick(dataitem.x, dataitem.y)}
              cMenu={e => handleContextMenu(e, dataitem.x, dataitem.y)}
              value={dataitem}
            />
            {datarow[datarow.length - 1] === dataitem ? (
              <div className="clear" />
            ) : (
              ""
            )}
          </div>
        );
      });
    });
  }
  console.log("boardData");
  console.log(boardData);

  return (
    <div className="board">
      <div className="game-info">
        <span className="info">Mines remaining: {mineCount}</span>
        <h1 className="info">{gameStatus}</h1>
      </div>
      <button className="btn btn-Primary" onClick={startGame}>
        Start Game
      </button>
      {start === true && renderBoard(boardData)}
      {/* {boardData !== undefined && boardData} */}
      {/* {boardData} */}
      {/* {renderBoard(boardData)} */}
    </div>
  );
};

export default Board;
