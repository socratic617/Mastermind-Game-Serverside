const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

//Static Folder
app.use(express.static("public"));

let nextGameId = 0;
//mongoDB subsitute "games"
const games = [];
const numsColumns = 4;
const maxRange = 7
//creating new game and adding it to "games" (monogoDB) (i recieve gameid )
app.post('/newGame', async (req, res) => {
  console.log('im inside generate secret code ')
  console.log('req.body', req.body)
  //on my frontend i have to create objects to call those objects numsColumns, maxRange
  const urlRandomNumGenerator = `https://www.random.org/integers/?num=${numsColumns}&min=0&max=${maxRange}&col=1&base=10&format=plain&rnd=new`;
  console.log('req.body numsColumns:', req.body.numsColumns)
  console.log('req.body maxRange:', req.body.maxRange)

  try {
    // make api request
    const response = await fetch(urlRandomNumGenerator);
    const responseText = await response.text();

    // Trim the extra whitespace/new lines then Split the responseText by '\n' to get an array of strings
    const numbersArray = responseText.trim().split('\n');

    // Convert array of strings to array of numbers
    const computerSecretCode = numbersArray.map(Number);
    console.log("generated secret code :")
    console.log(computerSecretCode)

    const gameId = nextGameId

    // Return the generated secret code and the created round object
    res.status(201).json({
      message: 'Game created successfully',
      gameId: gameId
    });
    
    //create new game
    games[gameId] = { secretCode: computerSecretCode, round: 0, guesses: [], feedback: [] }
    nextGameId++
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while generating the secret code' });
  }
})
  app.post('/guess', (req, res) => {
    // console.log("Games that exist: ", games)
    const { codebreakerFourGuesses, gameId } = req.body;
    console.log("game ID : ", gameId)
    const game = games[gameId]
    //want to put guess into guesses into the game to keep track of guesses
    game.guesses.push(codebreakerFourGuesses)
    game.round++
    console.log("game ID: ", gameId)
    console.log("game : " , game)
    const secretCode = game.secretCode
    try {
      console.log("Im inside Submit Game function : ")
      console.log("req.body : ", req.body)
      const feedback = generateFeedback(secretCode, codebreakerFourGuesses)
      game.feedback.push(feedback)
      if(game.round > 3){
        res.status(201).json({
          message: 'You have exceeded your max number of rounds',
        });
      } else{
        // return res.redirect(303,"/game/leadership-board")
        res.status(201).json({
          message: 'Feedback  created successfully',
          feedback: feedback
        });
      }
     
    } catch (err) {
      console.log(err);
    }
  });

const generateFeedback = (secretCode, codebreakerFourGuesses) => {
  if (codebreakerFourGuesses.length !== secretCode.length) {
    console.error("Please make sure you have provided exactly 4 guesses to fill in guessingSlots.");
    return null;
  }

  // Hashtable to track the number of occurrences of each number in the secret code
  let occurrences = {};

  // Populate Secret Code Occurrences using a for loop
  for (let i = 0; i < secretCode.length; i++) {
    // Retrieve the current number (element) at index i
    let num = secretCode[i];
    if (occurrences[num]) {
      // Increment the count for the current number
      occurrences[num]++;
    } else {
      // Initialize the count for the current number
      occurrences[num] = 1;
    }
  }

  // Hashtable to track my black & white pegs
  let feedback = { blackPegs: 0, whitePegs: 0 };

  // Loop through each element in the codebreakerFourGuesses array to check for black pegs
  for (let i = 0; i < codebreakerFourGuesses.length; i++) {
    // compare my element in array of codebreakerFourGuesses to the element in secret code array at index i
    const guess = codebreakerFourGuesses[i];
    const secretCodeElement = secretCode[i];
    // if it is the SAME element at index i 
    if (guess === secretCodeElement) {
      // subtract 1 value from the key in secret code hashtable
      occurrences[secretCodeElement]--;
      // Increment black pegs if correct number and right position
      feedback.blackPegs++;
      codebreakerFourGuesses[i] = null;
    }

    //if key is equal to zero  delete the key
    if (occurrences[secretCodeElement] === 0) {
      delete occurrences[secretCodeElement];
    }
  }

  // Loop through each element in the codeBreakerFourGuess array to check for white pegs
  for (let i = 0; i < codebreakerFourGuesses.length; i++) {
    const guess = codebreakerFourGuesses[i];

    // Check if the guess exists in the secret code and is not already matched with a black peg
    if (guess && occurrences[guess]) {
      // Subtract one from the value in the secret code hashtable
      occurrences[guess]--;
      // add one white key peg to my hashtable 
      feedback.whitePegs++;
    }
  }

  return feedback;
}


  app.listen(port, () => {
    console.log(`Guessing game server is running on http://localhost:${port}`);
  });


