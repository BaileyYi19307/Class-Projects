// tic-tac-toe.js

function repeat(initVal, length) {
    return Array(length).fill(initVal);
}    


function generateBoard(rows, cols, initialValue) {
    const blankValue = initialValue || " ";
    return repeat(blankValue, rows * cols);
}


/**
 * Converts a string representation of a Tic Tac Toe board into a single dimensional array
 * 
 * @param {String} s - A string representing the board
 * @return {Array|null} A single dimensional array representing the board
 *                       - returns null if the string contains characters other than " ", "X", "O"
 *                       - returns null if string length is not a perfect square
 */
export function boardFromString(s){
    let board=[];
    const squareRoot= Math.sqrt(s.length);

    //ensure board dimensions are a perfect square
    if (squareRoot!==Math.floor(squareRoot)){
        board=null;
    }
    else{
        for (let i=0; i<s.length;i++){
            //check if all the characters are valid; if not, return null
            if (!( s[i]===" " || s[i] === "X" || s[i] === "O")){
                return null;
            }
            //put valid characters into the board array
            board.push(s[i]);
        }
    }
    return board;
}


/**
 * Translates a row and a column to an index in the one dimensional Array representation of
 * a Tic Tac Toe board
 * 
 * @param {Array} board - The board where the row and col come from
 * @param {Number} row - The row number to be converted to an index in a one dimensional Array representation
 * @param {Number} col - The column number to be converted to an index in a one dimensional Array representation
 * @returns {Number} - the index that's mapped to by the given row and col
 */
export function rowColToIndex(board, row, col){
    //calculate width of the board
    const width= Math.sqrt(board.length);

    //convert row and column to index
        // for each row, we add on the width of the board
        // for each column, we add on one 
    const index=row*width + col;
    return index;
}


/**
 * Translates a single index in a one dimensional Array representation of a board to that cell's row and column.
 * 
 * @param {*} board - The board where the rowNumber and columnNumber come from
 * @param {*} i - The index to be converted into a row and column
 * @returns {Object} - containing two properties, row and col, representing the row and column numbers that the index
 * maps to
 */
export function indexToRowCol(board,i){
    const width= Math.sqrt(board.length);

    //calculate column index using modulo with the board width
    const columnIndex= i % width;

    //calculate row index using floor of the index/board width
    const rowIndex= Math.floor(i/width);

    const rowCol={row:rowIndex,col:columnIndex};
    return rowCol;
}


/**
 * Sets the value of the cell at the specified row and column on the board to the given letter
 * Creates a shallow copy of the board, modifies the copy, and returns it
 * 
 * @param {Array} board - The one-dimensional array representing the board
 * @param {String} letter - The letter to set in the specified cell
 * @param {Number} row - The row number of the cell to set
 * @param {Number} col - The column number of the cell to set
 * @returns {Array} - A new array representing the board with the updated cell
 */
export function setBoardCell(board, letter, row, col) {
    // Make shallow copy of the board
    const boardCopy = board.slice();

    // Get the index in the one-dimensional array
    const index = rowColToIndex(board, row, col);

    // Set the specified index in the shallow copy to the letter
    boardCopy[index] = letter;
    return boardCopy;
}



/**
 * Translates algebraic notation (e.g., "A1") into an object containing the row and column numbers
 * If the notation is invalid, returns undefined
 * 
 * @param {String} algebraicNotation - A string in algebraic notation specifying the position of a cell (e.g., "A1")
 * @returns {Object|undefined} - An object with `row` and `col` properties representing the row and column, or undefined if the input is invalid
 */
export function algebraicToRowCol(algebraicNotation){
    if(algebraicNotation){
        const arr=algebraicNotation.split("");
        // check that input is 2 characters long (letter followed by a number)
        if (arr.length === 2 && typeof(arr[0]) === 'string' && !isNaN(arr[1])){
            
            //if so, convert to row and column index
            const rowCol= {};
            
            //for row index, use character's ASCII value and subtract ASCII of 'A' (65) to turn into 0 based indexing
            const row=arr[0].charCodeAt()-65;
            
            // for col index, convert the number to a 0-based column index by subtracting 1
            const col=parseInt(arr[1])-1;

            rowCol['row']=row;
            rowCol['col']=col;
            return rowCol;
        }
    }
    return undefined; // return undefined if input is invalid
}

/**
 * Converts a row and column index to algebraic notation
 * 
 * @param {Object} rowCol - object with 0-based index of row, 0-based index of the col 
 * @returns {String} - algebraic notation for given row and column
 */
export function rowColToAlgebraic(rowCol){
    if (rowCol){
        //what the letter
        //what's the number
        const row=String.fromCharCode(rowCol.row+65);
        const col=String(rowCol.col+1);
        return row+col;
    }
    return undefined;
}


/**
 * Places the letter at the algebraic notation specified
 * No validation is required
 * 
 * @param {Array} board - The board where a cell will be set to the letter
 * @param {String} letter - The string to set the cell to
 * @param {String} algebraicNotation - A string that specifies the position of a cell using algebraic notation
 * @returns {Array} - A single dimensional array representing the board with the updated cell
 */
export function placeLetter(board, letter, algebraicNotation){
    //convert algebraic notation to row column
    const rowCol =algebraicToRowCol(algebraicNotation);

    // convert row column to index
    const index = rowColToIndex(board,rowCol.row,rowCol.col);
    
    //set board at specified index to letter
    board[index]=letter;

    return board;
}


/**
 * Helper function to check if any row in the board is completely filled with the same letter
 * Returns the letter of the winner if the row is filled, otherwise returns undefined
 * 
 * @param {Array} board - A single dimensional array representing the board
 * @returns {String|undefined} - The letter ('X' or 'O') if a row is filled, or undefined if no row is completely filled
 */
export function areRowsFilled(board){
    // calculate the width of the board 
    const width=Math.sqrt(board.length);

    //loop through the board row by row
    for (let i=0; i<board.length;i+=width){
        const firstElement=board[i];

        // if first element of row is empty, row isn't filled
        // skip to next row 
        if (firstElement === " "){
            continue;
        }
        
        //otherwise assume row is filled
        let isRowFilled=true;

        //check assumption by examining remaining elements in row
        for (let j=1; j<width;j++){
            if (board[i+j]!==firstElement){
                //if element in row doesn't equal first, row isn't filled
                isRowFilled=false;
                break;
            }
        }
        // if row isn't filled, will skip this step
        //otherwise returns winner
        if (isRowFilled){
            return firstElement;
        }
    }

    //if no rows are filled, return undefined
    return undefined;
}


/**
 * Helper function to check if any column in the board is completely filled with the same letter
 * Returns the letter if a column is filled, otherwise returns undefined
 * 
 * @param {Array} board - A single dimensional array representing the board
 * @returns {String|undefined} - The letter ('X' or 'O') if a column is filled, or undefined if no column is completely filled
 */
export function areColumnsFilled(board) {
    const width = Math.sqrt(board.length);
    
    // loop through each column
    for (let col = 0; col < width; col++) {
        const firstElement = board[col];

        //if first element of column is empty, column isn't filled; skip to next
        if (firstElement === " ") {
            continue; 
        }
        //assume column is filled for now
        let isColumnFilled = true;

        //check assumption by examining remaining elements in column
        for (let row = 1; row < width; row++) {
            if (board[col + row * width] !== firstElement) {
                //if element in column doesn't equal first, column isn't filled
                isColumnFilled = false;
                //stop checking this column 
                break;
            }
        }
        // if column isn't filled, will skip this step
        //otherwise returns winner
        if (isColumnFilled) {
            return firstElement; 
        }
    }
    //if no columns are filled, return undefined
    return undefined; 
}

/**
 * Helper function to check if any diagonal in the board is completely filled with the same letter
 * Returns the letter if a diagonal is filled, otherwise returns undefined
 * 
 * @param {Array} board - A single dimensional array representing the board
 * @returns {String|undefined} - The letter ('X' or 'O') if a diagonal is filled, or undefined if no diagonal is completely filled
 */
export function areDiagonalsFilled(board){
    const width = Math.sqrt(board.length);

    //get first elements of the left-to-right/right-to-left diagonal
    const leftCorner=board[0];
    const rightCorner=board[width-1];

    //assume diagonals are filled
    let isLeftDiaFilled=true;    
    let isRightDiaFilled=true;

    //check if the left to right diagonal is filled
    //if corner is empty, diagonal is unfilled
    if (leftCorner === " ") {
        isLeftDiaFilled = false;
    } else {
        //loop through other element in diagonal
        for (let i = 0; i < board.length; i += width + 1) {
            if (board[i] !== leftCorner) {
                isLeftDiaFilled = false;
                //break if any element in diagaonl doesn't match first element
                break;
            }
        }
    }

    //check if the right to left diagonal is filled
    // if corner is empty, diagonal is unfilled
    if (rightCorner === " ") {
        isRightDiaFilled = false;
    } else {
        for (let j = width - 1; j < board.length - 1; j += width - 1) {
            if (board[j] !== rightCorner) {
                isRightDiaFilled = false;
                break;
            }
        }
    }

    //return the winner if either diagonal is filled
    if (isLeftDiaFilled){
        console.log("Left diagonal is filled");
        return leftCorner;
    }
    else if(isRightDiaFilled){
        console.log("Right diagonal is filled!");
        return rightCorner;
    }

    //if no diagonals are filled, return undefined
    return undefined;
}


/**
 * Determines the winner by checking rows, columns, and diagonals of the board
 * 
 * @param {Array} board - A single dimensional array representing the board
 * @returns {String|undefined} - The letter of the winning player ('X' or 'O'), or undefined if no winner
 */
export function getWinner(board) {
    const rowsWinner = areRowsFilled(board); // Check if any row is filled
    const columnsWinner = areColumnsFilled(board); // Check if any column is filled
    const diagonalWinner = areDiagonalsFilled(board); // Check if any diagonal is filled

    const winner = rowsWinner || columnsWinner || diagonalWinner; // Return the first winner found
    return winner;
}


/**
 * Checks if the board is full (i.e., no empty spaces left)
 * 
 * @param {Array} board - The board to examine
 * @returns {Boolean} - Returns true if the board is full, false if there are any empty spaces
 */
export function isBoardFull(board) {
    for (let i = 0; i < board.length; i++) {
        if (board[i] === " ") {
            // if an empty cell is found, the board is not full
            return false;
        }
    }
    // if no empty cells are found, the board is full
    return true;  
}


/**
 * Determines whether or not a move to the specified algebraic notation is valid
 * 
 * @param {Array} board - The board where the move will be performed
 * @param {String} algebraicNotation - The algebraic notation representing a move on the board
 * @returns {Boolean} - Returns true if the move is valid, false otherwise
 */
export function isValidMove(board, algebraicNotation){
    const width=Math.sqrt(board.length);

    if (algebraicNotation){
        // 1) Check: is the board full?
        const boardFull=isBoardFull(board);

        // 2) Check: is the move within bounds of the board?
        const rowCol=algebraicToRowCol(algebraicNotation);

        //if the rowcolumn exists

        const index=rowColToIndex(board, rowCol.row, rowCol.col);

        //check if the row/col index is within the width of the board
        const rowInBounds= rowCol.row < width;
        const colInBounds= rowCol.col < width;

        //if both row and col indexes are within bound, then move is within bounds
        const indexInBounds= rowInBounds && colInBounds;

        //if index is in bounds, target square exists
        //3) Check: is the target square empty?
        let targetSqEmpty=indexInBounds; 
        if (indexInBounds){
            targetSqEmpty = board[index]===" ";
        }
        
        // if board isn't full, index is in bounds, target square is empty
        // return true (is a Valid move)
        return !boardFull && indexInBounds && targetSqEmpty;
    }
    //if the algebraic notation doesn't exist, return false;
    return false;
}


export {generateBoard};

