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

        function roundToTwo(num) {
          return +(Math.round(num + "e+4")  + "e-4");
        }
        
        //parse all monthly close data
        const monthlyData = data['Monthly Time Series'];
        const closeData = [];
        if(data['Note'] != 'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency.'){
          for (let i = 0; i < (Object.keys(monthlyData)).length; i++){
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
        const mean = roundToTwo(sum / returnData.length);

        //calculate standard deviation of returns over the last 5 years
        const variance = returnData.reduce((accumulator, currentValue) => accumulator + Math.pow(currentValue - mean, 2), 0) / closeData.length;
        const standardDeviation = roundToTwo(Math.sqrt(variance));

        //output return and standard deviation
        const returnElement = document.getElementById(returnId);
        const riskElement = document.getElementById(riskId);
        const weightNameElement = document.getElementById(weightNameId);
        returnElement.textContent = mean;
        riskElement.textContent = standardDeviation;
        weightNameElement.textContent = ticker;
      });
    }
  }
 }

 function calculateData(){
  const portfolioReturnEl = document.getElementById('portfolio-return');
  // const portfolioRiskEl = document.getElementById('portfolio-risk');
  // const portfolioSharpeEl = document.getElementById('portfolio-sharpe');

  function roundToTwo(num) {
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
  portfolioReturnEl.textContent = roundToTwo(sumProduct);

  sendMessage();
}

function addNewRow(){
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
  weightCell.appendChild(weightInput);
  newWeightRow.appendChild(weightCell);

  // Insert the row before the last row
  weightTable.append(newWeightRow);
}

function deleteLastRow(){
  const stockRows = stocksTable.rows;
  const weightRows = weightTable.rows;
  if (stockRows.length > 4) {
    stocksTable.deleteRow(stockRows.length - 1);
    weightTable.deleteRow(weightRows.length -1)
  }
}