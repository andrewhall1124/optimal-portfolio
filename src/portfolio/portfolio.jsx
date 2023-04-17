import React from 'react';
import './portfolio.css'

const DATA_LENGTH = 30;
let numStocks = 1;
const RISK_FREE = .0345;
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
        closeData.reverse();
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
        localStorage.setItem (`stock-${i}`, JSON.stringify(returnData));
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
  const portfolioReturn = sumProduct;

  portfolioReturnEl.textContent = roundToFour(portfolioReturn);

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
  const portfolioRisk = matrixMultiply(weightArray, covarianceMatrix);
  portfolioRiskEl.textContent = roundToFour(portfolioRisk);

  //calculate portfolio sharpe ratio
  const sharpeRatioEl = document.getElementById('portfolio-sharpe');
  const portfolioSharpe = (portfolioReturn - RISK_FREE)/portfolioRisk;
  sharpeRatioEl.textContent = roundToFour(portfolioSharpe);

  sendMessage();
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

function matrixMultiply(weightMatrix, covarianceMatrix){
  const n = numStocks;

  //initialize newMatrix and innerNewMatrix
  const newMatrix = [];
  const innerNewMatrix = [];
  for(let i = 0; i < n; i++){
    innerNewMatrix.push(0);
  }

  //do matrix multiplication
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        innerNewMatrix[i] += weightMatrix[0][j] * covarianceMatrix[j][i];
      }
    }
    newMatrix.push(innerNewMatrix);

  //initialize resultMatrix
  let result = 0;
  for (let i = 0; i < n; i++){
    result += newMatrix[0][i] * weightMatrix[0][i];
  }


  return Math.sqrt(result);
}

export function Portfolio() {

  return (
    <main>
      <div className="stats-container">
        <div className="inner-stats-container">
          <div className="stocks-container">
            <table id="stocks-table">
              <tr>
                <th colSpan='3'>Stocks</th>
              </tr>
              <tr>
                <th>Ticker</th>
                <th>Er</th>
                <th>SD</th>
              </tr>
              <tr>
                <td><input class="width" type="text" id="ticker-1"/></td>
                <td id="return-1"></td>
                <td id="risk-1"></td>
              </tr>
              <tr>
                <td id="button-row" >
                  <input type="submit" class="add-row-button" value="+" onclick="addNewRow()"/>
                  <input type="submit" class="minus-row-button" value="-" onclick="deleteLastRow()"/>
                </td>
              </tr>
            </table>
          </div>
          <div className="button-container-1">
            <input class='submit-button' type = "Submit" value="Fetch" onClick={fetchData}/>
          </div>
        </div>
        <div className="inner-stats-container">
          <div className ='weights-container'>
            <table id="weights-table">
              <tr>
                <th colSpan='2'>Weights</th>
              </tr>
              <tr>
                <th>Ticker</th>
                <th>Weight</th>
              </tr>
              <tr>
                <td id = "weight-name-1"></td>
                <td><input class="width" type="text" id="weight-1" value=".3333"/></td>
              </tr> 
            </table>
          </div>
          <div className="portfolio-container">
            <table>
              <tr>
                <th colSpan='2'>Portfolio</th>
              </tr>
              <tr>
                <td>Er</td>
                <td id="portfolio-return"></td>
              </tr>
              <tr>
                <td>SD</td>
                <td id="portfolio-risk"></td>
              </tr>
              <tr>
                <td>Sharpe</td>
                <td id="portfolio-sharpe"></td>
              </tr>
            </table>
          </div>
          <div className="button-container-1">
            <input class='submit-button' type = "Submit" value="Calculate" onClick={calculateData}/>
          </div>
          <div className="messages-container">
            <div className="message-header">Messages</div>
              <span className="user-name"></span>
              <div id="messages"></div>
            </div>
          </div>
        </div>
      <div className="graph-container">
        <div className="graph">
        </div>
      </div>
    </main>
  );
}