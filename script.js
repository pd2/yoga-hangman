const share =  document.getElementById("share");
const newGame =  document.getElementById("new-game");
// const tooltip = document.getElementById("myTooltip");


let is_random, index;
let elapsedTime, startTime;

let image;

// import {ref} from 'vue';

// Change this if you want the possibility of longer or shorter puzzles.
const maxLength = 50; // (Typically, the lower this number, the harder the puzzle.)

//Change this if you want more or fewer strikes allowed
const allowedStrikes = 3; //If you set this and maxLength both too high, the puzzle will be impossible to lose.

const defaultStrikes = new Array(allowedStrikes).fill({ icon: '⚪', guess: '' });

const app = new Vue({
  el: "#app",
  data: () => ({
    letters: Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    quotes: [], //Filled by the mounted hook
    benefit: '', //Filled by the mounted hook
    asana: '',
    lead: '',
    path:'https://cdn.glitch.global/9fcaeb22-d52b-455e-bcc8-820c4a9fd067/',
    file: '',
    guesses: [],
    strikes: [...defaultStrikes],
    share: false,
    gameOver: false }),

  mounted() {
    fetch('/asanas.txt').
    then(response => response.json()).
    then(fetchedQuotes => {
      fetchedQuotes = fetchedQuotes.filter(quote => quote.text.length <= maxLength); // Get rid of any quotes that are too long
      this.quotes = fetchedQuotes;
      this.pickAQuote();
      this.focusOnNewGameButton();
    });
  },
  methods: {
    //Can enter guesses with a keyboard, but it doesn't work super great because you need to be focusing a non-disabled element to use it currently. Needs some refinement.
    handleKeyPress(e) {
      const key = e.key.toUpperCase();
      if (key === '1') {
        this.newGame();
      }
      if (key === '@') {
        console.log("Cheat code used for testing");
        [...this.benefit].filter(letter => {
          if (!this.guesses.includes(letter)) {
            this.guess(letter);
          }
        });
      }
      if (key.length === 1 && key.match(/[a-zA-Z]/) && !this.guesses.includes(key)) {
        // console.log(key);
        this.guess(key);
      }
    },
    pickAQuote() {
      // console.log(this.quotes);
      
      is_random = document.getElementById('rand').checked;
      
      if (is_random == true) {
        index = Math.floor(Math.random() * this.quotes.length);
      } else {
        index++;
        if (index == this.quotes.length) {
          index = 0;
        }
      }
      // const random = Math.floor(Math.random() * this.quotes.length);
      this.benefit = this.quotes[index].text.toUpperCase();
      this.lead = this.quotes[index].lead.toUpperCase();
      this.asana = this.quotes[index].asana;
      this.file = this.quotes[index].file;
      // image = ([this.path, this.file, ".png"]);
    },
    //The function that turns unguessed letters into blank spots
    isRevealed(letter) {
      if (!letter.match(/[a-zA-Z\s]/)) {
        return letter;
      }
      return this.guesses.includes(letter) || this.gameOver ? letter : '_';
    },
    
    //Handles the guess and all possible results
    guess(letter) {
      // console.log(letter);
      this.guesses.push(letter);
      if (!this.benefit.includes(letter)) {
        this.strikes.pop();
        this.strikes = [{ icon: '🚫', guess: letter }, ...this.strikes];
      }
      if (this.strikeout || this.puzzleComplete) {
        this.gameOver = true;
        if (this.puzzleComplete) {
          fireEmAll();
          this.share = true;
          elapsedTime = new Date().getTime() - startTime;
          if (is_random == false) {
            save_history();
          }
          // share.style.display = "revert";
          ShareIt();
          // this.focusOnShareButton()
        }
      }
      // this.focusOnNewGameButton();
    },
    newGame() {
      const confirmation = true; // confirm('End this game and start a new one?');
      if (!confirmation) return;
      this.pickAQuote();
      this.guesses = [];
      this.strikes = [...defaultStrikes];
      this.gameOver = false;
      this.share = false;
      startTime = new Date().getTime();
      // share.style.display = "none";
      // this.focusOnNewGameButton();
    },
    focusOnNewGameButton() {
      this.$nextTick(() => {
        const newGameButtonRef = this.$refs.newGameBtn;
        newGameButtonRef.focus();
      });
    },
    focusOnShareButton() {
      this.$nextTick(() => {
        const shareButtonRef = this.$refs.shareBtn;
        shareButtonRef.focus();
      });
    }
  },

  computed: {
    splitQuote() {
      return this.benefit.split(' ');
    },
    badGuesses() {
      return this.strikes.filter(s => s.guess).map(s => s.guess);
    },
    strikeout() {
      return this.badGuesses.length >= allowedStrikes;
    },
    puzzleComplete() {
      return this.unrevealed === 0;
    },
    unrevealed() {
      return [...this.benefit].filter(letter => {
        return letter.match(/[a-zA-Z]/) && !this.guesses.includes(letter);
      }).length;
    },
    message() {
      if (!this.gameOver) {
        return '☝️ Pick a letter';
      } else if (this.strikeout) {
        return '❌ You lost this round. Try again?';
      } else if (this.puzzleComplete) {
        return '🎉 You win!';
      }
      //You can never be too safe ¯\_(ツ)_/¯
      return '😬 Unforeseen error state, maybe try a new game?';
    } } });




//Confetti! 🎉
//All the below code is just for the confetti. Could've brought it into Vue but didn't seem like there was any real reason to. Library is linked in the HTML tab's header settings.
let count = 200;
let defaults = {
  origin: { y: 0.5 },
  colors: ['#ffd100', '#a7a8aa', '#ff6a13', '#e4002b', '#7ba7bc', '#34657f'] };


const fire = (particleRatio, opts) => {
  confetti(
  Object.assign({}, defaults, opts, {
    particleCount: Math.floor(count * particleRatio) }));


};

const fireEmAll = () => {
  fire(0.25, {
    spread: 26,
    startVelocity: 55 });

  fire(0.2, {
    spread: 60 });

  fire(0.35, {
    spread: 100,
    decay: 0.91 });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92 });

  fire(0.1, {
    spread: 120,
    startVelocity: 45 });

};

let copyText;

function ShareIt() {
  
  let linkURL = "https://yoga-hangman.glitch.me/"; // window.location.href;//
  
  copyText = `#Yoga-Hangman I learnt the benefit of ${app.asana} in ${Math.round(elapsedTime/1000)} sec at ${linkURL}`;
  
  navigator.clipboard.writeText(copyText);
  
   if (navigator.canShare) {
    navigator.share({
      title: 'Share results',
      text: `#Yoga-Hangman I learnt the benefit of ${app.asana} in ${Math.round(elapsedTime/1000)} sec at ${linkURL}`,
     // url: linkURL,
    })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
  }
  newGame.focus()
  
//  alert("Copied the results to clipboard");
//  tooltip.innerHTML = "Results copied";
}

function outFunc() {
//  tooltip.innerHTML = "Copy to clipboard";
}

function get_history() {
  const noItemsFound = -1;
  const ind = localStorage.getItem('index') || noItemsFound;
  index = JSON.parse(ind);
}

function save_history() {
  const ind = JSON.stringify(index);
  localStorage.setItem('index', ind);
}


get_history();
// share.style.display = "none";
startTime = new Date().getTime();