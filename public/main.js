 function fetchData() {
  const ticker = [];
  for(let j = 0; j < 3; j++){
    ticker[j] = document.getElementById(`ticker-${j+1}.1`);
  }

  for(let j = 0; j < 3; j++){
    if(ticker[j]){
      const apikey = "QGWOX5A1IGEY8FV7";
      const series = "TIME_SERIES_MONTHLY";
      const url = `https://www.alphavantage.co/query?function=${series}&symbol=${ticker[j]}&apikey=${apikey}`;
      fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        function roundToTwo(num) {
          return +(Math.round(num + "e+2")  + "e-2");
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
          returnData[i] = closeData[i] / closeData[i-1];
        }

        returnData[0] = 0;

        // console.log(returnData);
        
        //find the average return of the last 5 years
        const sum = returnData.reduce((accumulator, currentValue) => accumulator + currentValue);
        const mean = roundToTwo(sum / returnData.length);

        //calculate standard deviation of returns over the last 5 years
        const variance = returnData.reduce((accumulator, currentValue) => accumulator + Math.pow(currentValue - mean, 2), 0) / closeData.length;
        const standardDeviation = roundToTwo(Math.sqrt(variance));

        console.log(mean);
        console.log(standardDeviation);

        const returnElement = document.getElementById(`ticker-${j+1}.2`);
        const riskElement = document.getElementById(`ticker-${j+1}.3`);
        returnElement.textContent = mean;
        riskElement.textContent = standardDeviation;
      });
    }
  }
}