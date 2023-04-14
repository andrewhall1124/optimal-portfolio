const DATA_LENGTH = 30;
let numStocks = 1;

function getEmptyArray(){
  const defaultArray = [];
  for (let i = 0; i < numStocks; i++){
    defaultArray.push(0);
  }
  console.log(defaultArray);
  return defaultArray;
}

const playerNameEl = document.querySelector('.user-name');
playerNameEl.textContent = getUserName();

const stocksTable = document.querySelector("#stocks-table");
const weightTable = document.querySelector("#weights-table");

// Adjust the webSocket protocol to what is being used for HTTP
const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

// Display messages we receive from our friends
socket.onmessage = async (event) => {
  const text = await event.data.text();
  const chat = JSON.parse(text);
  appendMsg( chat.name, chat.msg);
};

// Send a message over the webSocket
function sendMessage() {
  const msg = " created a portfolio";
  const name = document.querySelector('.user-name').textContent;
  socket.send(`{"name":"${name}", "msg":"${msg}"}`);
}

// Create one long list of messages
function appendMsg( from, msg) {
  const chatText = document.querySelector('#messages');
  chatText.innerHTML =
    `<div class="message-data">${from}: ${msg}</div>` + chatText.innerHTML;
}

function getUserName() {
  return localStorage.getItem('userName') ?? 'Mystery player';
}

function calculateCovariance(arr1, arr2) {
  const n = arr1.length;
  const mean1 = arr1.reduce((acc, val) => acc + val) / n;
  const mean2 = arr2.reduce((acc, val) => acc + val) / n;
  
  let cov = 0;
  
  for (let i = 0; i < n; i++) {
    cov += (arr1[i] - mean1) * (arr2[i] - mean2);
  }
  
  cov /= n;
  
  return cov;
}

function matrixMultiply(weightMatrix, covarianceMatrix){
  const n = numStocks;

  console.log(n);

  //initialize newMatrix and innerNewMatrix
  const newMatrix = [];
  const innerNewMatrix = [];
  for(let i = 0; i < n; i++){
    innerNewMatrix.push(0);
  }

  //do matrix multiplication
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      innerNewMatrix[i] += weightMatrix[0][j] * covarianceMatrix[j][i];
    }
  }

  //push results
  newMatrix.push(innerNewMatrix);

  //initialize resultMatrix
  let result = 0;
  for (let i = 0; i < n; i++){
    result += newMatrix[0][i] * weightMatrix[0][i];
  }


  return Math.sqrt(result);
}

function getWeightArray(){
  const weightArray = [];
  const innerWeightArray = [];
  for(let i = 1; i < weightTable.rows.length - 1; i++){
    const weightElement = document.getElementById('weight-' +i);
    const weightValue = (parseFloat(weightElement.value));
    innerWeightArray.push(weightValue);
  }
  weightArray.push(innerWeightArray);
  return weightArray;
}

function fetchData() {
  for(let i = 1; i < stocksTable.rows.length-2; i++){
    const tickerId = 'ticker-' + i;
    const returnId = 'return-' +i;
    const riskId = 'risk-' + i;
    const weightNameId = 'weight-name-' + i;
    const ticker = document.getElementById(tickerId).value;

    if(ticker){

      const apikey = "QGWOX5A1IGEY8FV7";
      const series = "TIME_SERIES_MONTHLY";
      const url = `https://www.alphavantage.co/query?function=${series}&symbol=${ticker}&apikey=${apikey}`;

      fetch(url)
      .then((response) => response.json())
      .then((data) => {

        function roundToFour(num) {
          return +(Math.round(num + "e+4")  + "e-4");
        }
        
        //parse all monthly close data
        const monthlyData = data['Monthly Time Series'];
        const closeData = [];
        if(data['Note'] != 'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency.'){
          for (let i = 0; i < DATA_LENGTH; i++){
              closeData[i] = Number(Object.values(Object.values(monthlyData)[i])[3])
          }
        } else{
          alert('You have reached the api limit. Please wait one minute before adding more stocks!');
        }

        //create an array with the average return of each month 
        const returnData = [];
        for (let i = 0; i < closeData.length; i++){
          returnData[i] = (closeData[i] / closeData[i-1]) -1;
        }
        returnData[0] = 0;
        
        //find the average return of the last 5 years
        const sum = returnData.reduce((accumulator, currentValue) => accumulator + currentValue);
        const mean = roundToFour(sum / returnData.length);

        //calculate standard deviation of returns over the last 5 years
        const variance = returnData.reduce((accumulator, currentValue) => accumulator + Math.pow(currentValue - mean, 2), 0) / closeData.length;
        const standardDeviation = roundToFour(Math.sqrt(variance));

        //output return and standard deviation
        const returnElement = document.getElementById(returnId);
        const riskElement = document.getElementById(riskId);
        const weightNameElement = document.getElementById(weightNameId);
        returnElement.textContent = mean;
        riskElement.textContent = standardDeviation;
        weightNameElement.textContent = ticker;

        //store the stock data in local storage
        localStorage.setItem (`stock-${i}`, JSON.stringify(closeData));
      });
    }
  }
 }

 function calculateData(){
  const portfolioReturnEl = document.getElementById('portfolio-return');
  // const portfolioSharpeEl = document.getElementById('portfolio-sharpe');

  function roundToFour(num) {
    return +(Math.round(num + "e+4")  + "e-4");
  }

  //calculate portfolio expected return
  let sumProduct = 0;
  for(let i = 1; i < stocksTable.rows.length-2; i++){
    const returnElement = document.getElementById('return-' +i);
    const weightElement = document.getElementById('weight-' +i);
    const returnValue = (returnElement.textContent);
    const weightValue = (weightElement.value);

    sumProduct += returnValue * weightValue;
  }
  portfolioReturnEl.textContent = roundToFour(sumProduct);

  //calculate the covariance matrix from a dynamic list of stocks
  const covarianceMatrix = [];
  for(let i = 1; i < stocksTable.rows.length-2; i++){
    const innerArray = [];
    for (let j = 1; j < stocksTable.rows.length-2; j++){
      const stockA = JSON.parse(localStorage.getItem(`stock-${i}`));
      const stockB = JSON.parse(localStorage.getItem(`stock-${j}`));
      const covariance = calculateCovariance(stockA,stockB);
      innerArray.push(covariance);
    }
    covarianceMatrix.push(innerArray);
  }
  
  const weightArray = getWeightArray();

  //calculate portfolio risk
  const portfolioRiskEl = document.getElementById('portfolio-risk');
  portfolioRiskEl.textContent = roundToFour(matrixMultiply(weightArray, covarianceMatrix));

  sendMessage();
}

function addNewRow(){
  //increment numStocks
  numStocks += 1;

  // Get the stocks-table element
  const addRow = document.querySelector("#button-row");
  stocksTable.appendChild(addRow);

  // Create a new row element
  const newStockRow = document.createElement("tr");

  // Add the cells to the row
  const tickerCell = document.createElement("td");
  const tickerInput = document.createElement("input");
  tickerInput.setAttribute("class", "width");
  tickerInput.setAttribute("type", "text");
  tickerInput.setAttribute("id", "ticker-" + (stocksTable.rows.length - 2));
  tickerCell.appendChild(tickerInput);
  newStockRow.appendChild(tickerCell);

  const returnCell = document.createElement("td");
  returnCell.setAttribute("id", "return-" + (stocksTable.rows.length - 2));
  newStockRow.appendChild(returnCell);
  const riskCell = document.createElement("td");
  riskCell.setAttribute("id", "risk-" + (stocksTable.rows.length - 2));
  newStockRow.appendChild(riskCell);

  // Insert the row before the last row
  stocksTable.insertBefore(newStockRow, addRow);

  // Create a new row element
  const newWeightRow = document.createElement("tr");

  // Add the cells to the row
  const tickerCell2 = document.createElement("td");
  tickerCell2.setAttribute("id", "weight-name-" + (weightTable.rows.length - 1));
  newWeightRow.appendChild(tickerCell2);

  const weightCell = document.createElement("td");
  const weightInput = document.createElement("input");
  weightInput.setAttribute("class", "width");
  weightInput.setAttribute("type", "text");
  weightInput.setAttribute("id", "weight-" + (weightTable.rows.length - 1));
  weightInput.setAttribute("value", ".3333");
  weightCell.appendChild(weightInput);
  newWeightRow.appendChild(weightCell);

  // Insert the row before the last row
  weightTable.append(newWeightRow);
}

function deleteLastRow(){
  //decrement numStocks
  numStocks -= 1;

  const stockRows = stocksTable.rows;
  const weightRows = weightTable.rows;
  if (stockRows.length > 4) {
    stocksTable.deleteRow(stockRows.length - 1);
    weightTable.deleteRow(weightRows.length -1)
  }

}


function testFunction(arr1, arr2){
  // Perform matrix multiplication
  const newMatrix = [];
  const innerNewMatrix = [0,0,0]
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      innerNewMatrix[i] += arr1[0][j] * arr2[j][i];
    }
  }
  console.log(innerNewMatrix);
  newMatrix.push(innerNewMatrix);

  console.log(newMatrix);

  // console.log(newMatrix[0][0]);
  // console.log(newMatrix[0][1]);
  // console.log(newMatrix[0][2]);
  // console.log(arr1[0][0]);
  // console.log(arr1[0][1]);
  // console.log(arr1[0][2]);

  // Compute sumproduct of new matrix and weight matrix 
  let result = 0;
  for (let i = 0; i < 3; i++){
    result += newMatrix[0][i] * arr1[0][i];
  }

  return result;
}

  const array1 = [];
  array1.push([1,2,3]);
  const array2 = [];
  array2.push([1,2,3]);
  array2.push([1,2,3]);
  array2.push([1,2,3]);
  console.log(array1);
  console.log(array2);
  const result = testFunction(array1, array2);
  console.log(result);