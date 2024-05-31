let gameId = -1
// Enter lobby endpoint , list of ppl in a lobby and who is in lobby and click play game with you where you cna use react 

// make a new curl enter lobby and whos in lobby  or get list of players of whos in the lobby first then  use react and build it out into components 

//show me all the active games
//game cant start unless two players
async function newGame(){
  console.log("I am inside new game method")
  const url = '/newGame'
  
  try {
    const response = await fetch(url, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const responseData = await response.json();
    gameId = responseData.gameId
    console.log('Response data:', responseData);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

async function makeGuess() {
  const url = '/guess';
  const guessOne = document.getElementById("guesses-input-1").value
  const guessTwo = document.getElementById("guesses-input-2").value
  const guessThree = document.getElementById("guesses-input-3").value
  const guessFour = document.getElementById("guesses-input-4").value
  const codebreakerFourGuesses = [guessOne, guessTwo, guessThree, guessFour]
  const data = {
    gameId: gameId,
    codebreakerFourGuesses: codebreakerFourGuesses
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
// where i get feedback
    const responseData = await response.json();
    console.log('Response data:', responseData);// put this on the dom like multiplayer and etc....
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

document.querySelector("#startgame").addEventListener("click", newGame)
document.querySelector("#submitguess").addEventListener("click", makeGuess)

