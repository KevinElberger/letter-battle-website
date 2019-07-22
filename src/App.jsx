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
      searchedWords: {},
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

    window.mobilecheck = function() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    };

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

  characterClick(e) {
    e.persist();
    let target = e.target;

    if (target.className === '') {
      target = target.parentNode;
    }

    const text = target.innerText;
    const orderClasses = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

    target.classList.toggle('active');

    if (this.state.word.indexOf(text) === -1) {
      this.setState({ word: this.state.word + text }, () => {
        const word = this.state.word;

        if (word.length > 1 && (!this.state.foundWords[word] && !this.state.searchedWords[word])) {
          this.checkWordValidity(this.state.word);
        }
      });
    } else {
      this.setState({ word: this.state.word.replace(text, '') });
    }
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
        return this.setState(prevState => ({
          word: '',
          ...prevState,
          searchedWords: {
            ...prevState.searchedWords,
            [newWord]: true
          }
        }));
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
    const characters = letters.length > 0 && letters.split('').map((character, i) => {
      return (
        <div className={'character' + (word.indexOf(character) > -1 ? ' active' : '')} key={i} onClick={this.characterClick.bind(this)}>
          <h3>{ character } </h3>
        </div>
      );
    });

    return (
      <div className="app">
        <ToastContainer />
        <div className="game-status">
          { inProgress ? <Stats round={round} seconds={seconds} foundWords={foundWords} /> : isWaitingMsg }
          { gameOverMsg }
        </div>

        <div className="characters">
          { letters && letters.length > 0 && characters }
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