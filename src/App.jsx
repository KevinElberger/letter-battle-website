import React, { Component } from "react";
import { hot } from "react-hot-loader";
import * as Colyseus from 'colyseus.js';

import Stats from './Stats';
import FoundWords from './FoundWords';
import Characters from './Characters';
import { ToastContainer, toast } from 'react-toastify';

import '../public/styles/styles.scss';
import 'react-toastify/dist/ReactToastify.css';

class App extends Component {
  constructor() {
    super();

    const endpoint = 'ws://letter-battle.herokuapp.com/:45303';

    this.colyseus = new Colyseus.Client(endpoint);
    this.handleChange = this.handleChange.bind(this);
    this.timer = 0;
    this.state = {
      word: '',
      foundWords: {},
      players: {},
      round: 1,
      letters: [],
      inProgress: false,
      winner: false,
      draw: false,
      seconds: 60,
      gameOverMessage: '',
      waiting: true
    };
  }

  componentDidMount() {
    const roomName = location.hash.split('#/').pop() || 'room';

    fetch('https://letter-battle.herokuapp.com/' + roomName)
    .then(() => {
      this.room = this.colyseus.join(roomName);
      this.room.onMessage.add(message => this.onMessage(message));
      this.room.onStateChange.add(state => this.onStateChange(state));
    });
  }

  success = () => toast.success('Word added!', {
    position: toast.POSITION.TOP_LEFT,
    autoClose: 2000
  });

  info = () => toast.success('Link copied!', {
    position: toast.POSITION.TOP_LEFT,
    autoClose: 2000
  })

  onStateChange(newState) {
    if (newState.inProgress && newState.round === 1) {
      this.startTimer();
      this.setState({ waiting: false });
    } else if (newState.round > this.state.round && newState.inProgress) {
      this.restartCounter();
    } else {
      clearInterval(this.timer);
    }

    this.setState(prevState => ({
      ...prevState,
      word: '',
      ...newState
    }));
  }

  // TODO: Handle forfeit via leaving the game
  onMessage(message) {
    const { update } = message;

    console.log(update);

    if (!update.winner) return;

    let msg = '';
    const wonByScore = update.winner._score === this.state.players[this.colyseus.id]._score;
    if (update.winner && wonByScore) {
      msg = '🥳 You won!';
    } else {
      msg = '😢 You lost!';
    }

    this.setState({
      winner: true,
      gameOverMessage: msg
    })
  }

  startTimer() {
    if (this.timer == 0 && this.state.seconds > 0) {
      this.timer = setInterval(this.countDown.bind(this), 1000);
    }
  }

  restartCounter() {
    clearInterval(this.timer);
    this.setState({ seconds: 60 }, () => {
      this.timer = setInterval(this.countDown.bind(this), 1000);
    });
  }

  countDown() {
    const seconds = this.state.seconds - 1;

    this.setState(prevState => ({
      ...prevState,
      seconds
    }));

    if (seconds == 0) {
      clearInterval(this.timer);
    }
  }

  handleChange(e) {
    if (!this.state.inProgress) return;

    const value = e.target.value;

    if (!value) return this.setState({ word: '' });

    const lastLetter = value.split('').pop();

    if (this.state.letters.indexOf(lastLetter) > -1) {
      this.setState({
        word: value
      });
    }
  }

  search() {
    if (!this.state.inProgress) return;

    const value = this.state.word;

    if (this.state.foundWords[this.state.word]) {
      return this.setState({ word: '' });
    }

    this.setState({ word: value }, () => {
      if (this.state.word.length > 1) {
        this.checkWordValidity(this.state.word);
      }
    });
  }

  checkWordValidity(newWord) {
    fetch('https://letter-battle.herokuapp.com/word', {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
       "word": newWord
      })
    })
    .then(response => response.json())
    .then(data => {
      if (!data || data.data === -1) {
        return this.setState({ word: '' });
      }

      this.setState(prevState => ({
        word: '',
        ...prevState,
        foundWords: {
          ...prevState.foundWords,
          [newWord]: true
        }
      }), () => {
        const player = this.state.players[this.colyseus.id];
        player._score++;
        this.room.send({ player });
        this.success();
      });
    })
  }

  handleClick() {
    var textField = document.createElement('textarea');
    textField.innerText = location.href;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    this.info();
  }

  render() {
    const {
      round,
      inProgress,
      players,
      letters,
      foundWords,
      word,
      draw,
      countDown,
      seconds,
      winner,
      gameOverMessage,
      waiting
    } = this.state;
    const isWaiting = !draw && !winner && waiting;
    const isWaitingMsg = isWaiting && (<h1>Waiting for player 2 to join...</h1>);
    const gameOverMsg = !inProgress && !waiting && (draw ? <h1>It's a draw!</h1> : <h1>{ gameOverMessage }</h1>);

    return (
      <div className="app">
        <ToastContainer />
        <div className="game-status">
          { inProgress ? <Stats round={round} seconds={seconds} foundWords={foundWords} /> : isWaitingMsg }
          { gameOverMsg }
        </div>

        <div className="characters">
          { letters && letters.length > 0 && <Characters letters={letters} word={word} /> }
        </div>

        <div className="content">
          { inProgress && (<p>Try to make as many words as you can from the letters above!</p>) }

          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Create a word"
              className="input"
              autoFocus
              value={this.state.word}
              onChange={ this.handleChange.bind(this) }
              onKeyPress={event => { if (event.key === 'Enter') this.search() }}
            />
          </div>

          <div className="copy">
            { (isWaiting && Object.keys(players).length === 1) ? (<button onClick={this.handleClick.bind(this)}>Copy link</button>) : '' }
          </div>

          <div className="found-words">
            <FoundWords foundWords={foundWords} />
          </div>
        </div>
      </div>
    )
  }
}

export default hot(module)(App);