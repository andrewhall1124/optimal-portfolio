const playerNameEl = document.querySelector('.player-name');
playerNameEl.textContent = getPlayerName();

function getPlayerName() {
  return localStorage.getItem('userName') ?? 'Mystery player';
}

function fetchData() {
  for(let i = 1; i < 4; i++){
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
  for(let i = 1; i < 4; i++){
    const returnElement = document.getElementById('return-' +i);
    const weightElement = document.getElementById('weight-' +i);
    const returnValue = returnElement.textContent;
    const weightValue = weightElement.value;
    console.log(returnValue);
    console.log(weightValue);

    sumProduct += returnValue * weightValue;
  }
  portfolioReturnEl.textContent = roundToTwo(sumProduct);

  // Adjust the webSocket protocol to what is being used for HTTP
  const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
  const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

  // Display that we have opened the webSocket
  // socket.onopen = (event) => {
  //   appendMsg('system', 'websocket', 'connected');
  // };

  // Display messages we receive from our friends
  socket.onmessage = async (event) => {
    const text = await event.data.text();
    const chat = JSON.parse(text);
    appendMsg( chat.name, chat.msg);
  };

  // Send a message over the webSocket
  function sendMessage() {
    const msg = " created a portfolio";
    const name = document.querySelector('.player-name').textContent;
    appendMsg(name, msg);
    socket.send(`{"name":"${name}", "msg":"${msg}"}`);
  }

  // Create one long list of messages
  function appendMsg( from, msg) {
    const chatText = document.querySelector('#player-messages');
    chatText.innerHTML =
      `<div>${from}: ${msg}</div>` +
      chatText.innerHTML;
  }

  sendMessage();
}