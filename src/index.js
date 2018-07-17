import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  if (props.highlight) {
    return (
      <button className="squareWin" onClick={props.onClick}>
        {props.value}
      </button>
    )
  }
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  )
}

function Ok(props) {
  if (props.coor != null) {
    return (
      <ul>
        <li key = {props.coor}>Coordinate: ({Math.trunc(props.coor / props.cols) + 1}, {props.coor % props.cols + 1})</li>
      </ul>
    )
  }
  return null
}

class Button extends React.Component {
  render() {
    if (this.props.move === this.props.maxx) {
      return (
        <button className="bold" onClick={() => this.props.onClick()}>
          {this.props.desc}
        </button>
      )
    }
    return (
      <button onClick={() => this.props.onClick()}>
        {this.props.desc}
      </button>
    )
  }
}

class Board extends React.Component {

  renderSquare(i, highlight) {
    return (
      <Square key = {i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight = {highlight}
      />
    )
  }

  render() {
    const cols = this.props.cols
    const rows = this.props.rows
    var myRows = []
    for (let i = 0; i < rows; i++) {
      let thisRow = []
      for (let j = 0; j < cols; j++) {
        let highlight = false
        for (let l = 0; l < this.props.highlight.length; l++) {
          let coor = this.props.highlight[l]
          if (coor === i * cols + j) {
            highlight = true
          }
        }
        thisRow.push(this.renderSquare(i * cols + j, highlight))
      }
      myRows.push(<div className="board-row" key = {i}>{thisRow} </div>)
    }

    return (
      <div>
        {myRows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      history: [{
        squares: Array(10000).fill(null),
        coor: null,
        highlight: []
      }],
      moves: [],
      xIsNext: true,
      stepNumber: 0,
      rows: 20,
      cols: 30,
      reverse: 0
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1)
    const current = history[history.length - 1]
    const squares = current.squares.slice()
    var winner = calculateWinner(squares, this.state.rows, this.state.cols)

    var canTick = 0
    if (squares[i] === null && winner === null) {
      squares[i] = this.state.xIsNext ? 'x' : 'o'
      winner = calculateWinner(squares, this.state.rows, this.state.cols)
      this.setState({
        history: history.concat([{
          squares: squares,
          coor: i,
          highlight: [].concat(winner),
        }]),
        xIsNext: !this.state.xIsNext,
        stepNumber: history.length
      })
      canTick = 1
    }

    var history2 = this.state.history.slice(0, this.state.stepNumber + 1)
    if (canTick) {
      history2 = this.state.history.slice(0, this.state.stepNumber + 1).concat([{
        squares: squares,
        coor: i,
      }]).slice()
    }

    var moves = history2.map((step, move) => {
      const desc = move ? 'Go to move ' + move : 'Go to start'
      const coor = history2[move].coor
      return (
        <li key={move}>
          <Button
            move = {move}
            desc = {desc}
            maxx = { this.state.stepNumber + canTick }
            onClick = {() => { this.jumpTo(move) } }
          />
          <Ok
            coor = {coor}
            rows = {this.state.rows}
            cols = {this.state.cols}
          />
        </li>
      )
    })

    if (this.state.reverse) {
      this.setState({
        moves: moves.reverse(),
      })
    } else {
      this.setState({
        moves: moves,
      })
    }
  }

  reverse() {
    this.setState({
      reverse: 1 - this.state.reverse,
      moves: this.state.moves.reverse()
    })
  }

  jumpTo(thisStep) {
    this.setState({
      stepNumber: thisStep,
      xIsNext: (thisStep % 2) === 0
    })
    const history = this.state.history.slice()
    const moves = history.map((step, move) => {
      const desc = move ? 'Go to move ' + move : 'Go to start'
      const coor = history[move].coor
      return (
        <li key={move}>
          <Button
            move = {move}
            desc = {desc}
            maxx = { thisStep }
            onClick = {() => { this.jumpTo(move) } }
          />
          <Ok
            coor = {coor}
            rows = {this.state.rows}
            cols = {this.state.cols}
          />
        </li>
      )
    })
    if (this.state.reverse) {
      this.setState({
        moves: moves.reverse()
      })
    } else {
      this.setState({
        moves: moves
      })
    }
  }

  render() {
    const history = this.state.history
    const current = history[this.state.stepNumber]
    const winner = calculateWinner(current.squares, this.state.rows, this.state.cols)

    let status
    if (winner === null) {
      status = 'Next player: ' + (this.state.xIsNext ? 'x' : 'o')
    } else if (winner === -1) {
      status = "It's a DRAW!"
    } else {
      status = 'Winner: ' + (current.squares[winner[0]])
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares = {current.squares}
            onClick = {(i) => {this.handleClick(i)} }
            rows = {this.state.rows}
            cols = {this.state.cols}
            highlight = {current.highlight}
          />
        </div>
        <div className="game-info">
          <div>
            <button onClick = {() => {this.reverse()} }>Reverse</button>
          </div>
          <div>{status}</div>
          <ol>{this.state.moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function inRange(x, y, rows, cols) {
  if (x >= 0 && y >= 0 && x < rows && y < cols) {
    return true
  }
  return false
}

function calculateWinner(squares, rows, cols) {
  var dx = [0, 1, 1, 1]
  var dy = [1, 1, 0, -1]
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let l = 0; l < 4; l++) {
        let cnt = 0
        let result = []
        let cur = squares[i * cols + j]
        if (cur === null) {
          continue
        }
        let x = i
        let y = j
        while (inRange(x, y, rows, cols) && squares[x * cols + y] === cur) {
          result.push(x * cols + y)
          x += dx[l]
          y += dy[l]
          cnt++
        }

        if (cnt === 5 && ((!inRange(x, y, rows, cols) || squares[x * cols + y] === null) ||
          (inRange(i - dx[l], j - dy[l], rows, cols) && squares[(i - dx[l]) * cols + j - dy[l]] === null) ||
          !inRange(i - dx[l], j - dy[l], rows, cols))) {
          return result
        }
        if (cnt > 5) {
          return result
        }
      }
    }
  }
  let foundNull = false
  for (let i = 0; i < rows * cols; i++) {
    if (squares[i] === null) {
      foundNull = true
    }
  }
  if (foundNull === false) {
    return -1
  }
  return null
}