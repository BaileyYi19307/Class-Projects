// app.js
import { question } from 'readline-sync';
import {rowColToAlgebraic,boardFromString,isValidMove, placeLetter,algebraicToRowCol,rowColToIndex,getWinner, isBoardFull, indexToRowCol} from './src/tic-tac-toe.js';
import { readFile } from 'fs';


/**
 * Checks if the game is over by determining if there is a winner or if the board is full
 * 
 * @param {Array} board - The board to check for game status
 * @returns {Boolean} - Returns true if the game is over (either a winner or the board is full), false otherwise
 */
function isGameOver(board){
    const winner=getWinner(board);
    if (winner){
        return true; 
    }
    //game is not over yet
    return false;
}

/**
 * Helper function that splits a one-dimensional board array into an array of rows
 * Each row contains the same number of elements as the board width
 * 
 * @param {Array} board - The board represented as a single dimensional array
 * @returns {Array} - An array of rows, where each row is an array
 */
function rowsFromBoard(board){
    const rowsArr = [];

    // calaculate how many elements are in a row
    const boardWidth=Math.sqrt(board.length);
    const sizeOfRow=boardWidth;
    
    // loop through board array, slice into rows of sizeOfRow length
    for (let i = 0; i < board.length; i += sizeOfRow) {
        rowsArr.push(board.slice(i, i + sizeOfRow));
    }
    // return array of rows
    return rowsArr;
}


/**
 * Formats a row of the board along with its row index for display
 * 
 * @param {Array} row - The array representing a row of the board
 * @param {Number} rowIndex - The index of the row (0-based)
 * @returns {String} - The formatted row as a string for display
 */
function formatRow(row, rowIndex,cellWidth){
    //convert row number to letter by using ASCII code 
    const label = String.fromCharCode(rowIndex+65);
    const formattedRow=[];

    //begin formatted row with letter label and separator
    formattedRow.push(label," |");

    //iterate through row elements and format each cell
    for (let i=0; i<row.length;i++){
        if (row[i]===" "){
            //if cell is empty, fill with spaces to cellWidth
            formattedRow.push(" ".repeat(cellWidth)+"|");
        }
        else{
            //otherwise, place the element in the cell 
            //assumption is that dimensions of the board will be no more than 26 x 26
            //so largest number in the col headers will be two digits (hence cellwidth-2)
            formattedRow.push(" ",row[i]," ".repeat(cellWidth-2),"|");
        }
    }
    //join formatted elements into a string and return
    return formattedRow.join("");
}



/**
 * Displays the board with formatted rows, column headers, and borders
 * 
 * @param {Array} board - The board represented as a single dimensional array
 */
function displayBoard(board){
    const numOfColumns=Math.sqrt(board.length);
    const largestNumInColHeader=String(numOfColumns);

    //want the cell size to be atleast as big as the # of digits of largest number in the col header
    //added 2 to indicate padding on both sides
    const cellWidth=largestNumInColHeader.length + 2; 
    
    
    //create the top border line
    let borderLine="  +";
    for(let i=0; i<numOfColumns; i++){
        borderLine+="-".repeat(cellWidth)+ "+";
    }

   // Create the column headers
   let rowHeader = "    "; 
   for (let j = 1; j < numOfColumns + 1; j++) {
       //padded column numbers w/ " " so that result is cellwidth+1 size 
       rowHeader += String(j).padEnd(cellWidth+1, " ");
   }

    // get rows from the board
    const rowsInBoard=rowsFromBoard(board);

    //Show the board with headers and borders
    console.log(rowHeader);
    console.log(borderLine);
  
    //format each row
    const boardWidth=numOfColumns;
    for (let whichRow=0; whichRow<boardWidth;whichRow++){
        console.log(formatRow(rowsInBoard[whichRow],whichRow, cellWidth));
        console.log(borderLine);
    }
    console.log("");
}




// array to track the indices of empty cells on the board
let emptySpots=[];

/**
 * Initializes the emptySpots array with the indices of all empty cells in the board
 * 
 * @param {Array} board - The board represented as a single dimensional array
 */
function initializeCellsLeftEmpty(board) {
    for (let i = 0; i < board.length; i++) {
        if (board[i] === " ") {
             // Add index of empty cell to the array
            emptySpots.push(i); 
        }
    }
}

/**
 * Updates the emptySpots array by removing the index of a cell that has been filled
 * 
 * @param {Number} index - The index of the cell that has been filled
 */
function updateCellsLeftEmpty(index) {
    // Remove the filled spot from the emptySpots array
    emptySpots = emptySpots.filter(spot => spot !== index);  
}


/**
 * Selects a random number from the indices indicating an empty spot on the Tic Tac Toe board
 * 
 * @returns {Number} - A randomly selected element from the emptySpots array
 */
function pickRandomEmptySpot() {
    // generate a random index
    const randIndex = Math.floor(Math.random() * emptySpots.length);

    // return the element at the random index
    return emptySpots[randIndex];  
}



//determine which player goes first
const determineFirstPlayer = playerLetter => playerLetter === "X" ? "player": "computer";

//determine which player goes next
const whichPlayerNext = currentPlayer => currentPlayer === "player" ? "computer" : "player";


/**
 * Helper function to execute player's turn
 * @param {Array} board - array representing current state of the game board
 * @param {Object} config - configuration object that contains game settings
 */
const executePlayerTurn =(board, config) => {
    //ask the player what their move is
    let answer = question('What\'s your move?\n');

    //validate answer
    while (!isValidMove(board,answer)){
        console.log("Your move must be in the correct format and specify an existing empty cell!");
        answer = question('What\'s your move?\n');
    }
    //place down answer
    board = placeLetter(board, config.playerLetter, answer);
    displayBoard(board);


    //once the letter is placed, update the array of empty cells
    const cellIndex = rowColToIndex(board,algebraicToRowCol(answer).row, algebraicToRowCol(answer).col);
    updateCellsLeftEmpty(cellIndex);

    //only if the game has not yet ended, ask if the user want's to see the computer's move
    if (!isGameOver(board)) {
        question("Press <ENTER> to show computer's move...");
    }
};


/**
 * Helper function to execute the computer's turn by using either predefined scripted moves
 * or random moves if no valid scripted moves left
 * 
 * @param {Array} board - array representing current state of the game board
 * @param {Object} config - configuration object that contains game settings
 */
const executeComputerTurn =(board, config) => {
    const computerMovesArr = config.computerMoves;
    let cellIndex;
    let move;
    let algebraicMove;

    // if there are scripted moves left
    if (computerMovesArr.length>0){

        //iterate over scripted moves to find a valid move
        for (let i=0;i<computerMovesArr.length;i++){
            algebraicMove= computerMovesArr[i];

            //if move is valid, calculate cellIndex to update empty spots later
            if (isValidMove(board, algebraicMove)){
                move=algebraicToRowCol(algebraicMove);
                cellIndex=rowColToIndex(board,move.row,move.col);
                break;
            }
        }

        //if no valid scripted moves left, use a randomly generated empty spot
        if (cellIndex === undefined){
           cellIndex = pickRandomEmptySpot();
           move = indexToRowCol(board,cellIndex);
           algebraicMove=rowColToAlgebraic(move);
        } 
    }
    else{
        //if no scripted moves at all, use a randomly generated empty spot
        cellIndex = pickRandomEmptySpot();
        move = indexToRowCol(board,cellIndex);
        algebraicMove=rowColToAlgebraic(move);
    }
    
    //place down the letter at the valid spot
    board = placeLetter(board, config.computerLetter, algebraicMove);
    
    //update the empty spots array to indicate another spot has been occupied
    updateCellsLeftEmpty(cellIndex);
    displayBoard(board);
};



/**
 * Initializes and manages flow of the game using provided configuration
 * @param {Object} config - the configuration object for starting the game
 */
const startGame = config => {
    
    // check if there are scripted moves for the computer
    if (config.computerMoves.length!==0){
        console.log("Computer will make the following moves:", config.computerMoves);
    }
    
    // display player and computer letters
    console.log("Player is", config.playerLetter,", Computer is", config.computerLetter);

    // use configuration data to construct a board
    //check the board supplied has valid dimensions
    if (boardFromString(config.board)){
        const board= boardFromString(config.board);

        // intialize empty cells tracking
        initializeCellsLeftEmpty(board);
        displayBoard(board);

        //determine the current player
        let currentPlayer = determineFirstPlayer(config.playerLetter);
        
        let winnerExists=false;
        while (!winnerExists){
            if (currentPlayer==="player"){
                executePlayerTurn(board,config);
            }

            //check if there exists a winner; if so, stop the game
            winnerExists=isGameOver(board);
            const winner=getWinner(board);
            if (winnerExists){
                if (isBoardFull(board)){
                    console.log("It's a draw!");
                }
                else{
                    console.log("Player", winner,"won!!!");
                }
                break;
            }

            if (currentPlayer==="computer"){
                //handle computer's turn
                executeComputerTurn(board,config);
            }
            //who goes next?
            currentPlayer=whichPlayerNext(currentPlayer);
        }

    }
    else{
        //board supplied does not have valid dimensions
        console.log("board dimensions are invalid");
    }
};


const configFilePath = process.argv[2];
// TODO: conditional to check if path is passed 
// if not, start game with default config object
if (configFilePath){
    readFile(configFilePath, (err, data) => {
    if (err){
        console.log("Configuration file not found");
    }else{
        const s = data + '';
        const config = JSON.parse(s);
        startGame(config);
        }
    });
}
else{
    const defaultConfig={
        "board": "         ",
        "playerLetter": "X",
        "computerLetter": "O",
        "computerMoves": []
    };
    startGame(defaultConfig);
}



