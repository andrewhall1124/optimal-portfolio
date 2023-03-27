const apikey = "QGWOX5A1IGEY8FV7";
const symbol = "meta";
const series = "TIME_SERIES_MONTHLY";
const url = `https://www.alphavantage.co/query?function=${series}&symbol=${symbol}&apikey=${apikey}`;
const closeArray = [];

function getStockData (url, dataFunction){
  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      dataFunction(data);
  });
}

function getStockClose(data){
  for(let i=0; i < 60; i++){
    let close = Object.values(Object.values(data["Monthly Time Series"])[i])[3];
    closeArray.unshift(close);
  }
}

console.log(closeArray);

getStockData(url, getStockClose);