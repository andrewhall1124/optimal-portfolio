import React from 'react';
import './portfolio.css';
import { Line } from 'react-chartjs-2';
import {Chart} from 'chart.js/auto';

const DATA_LENGTH = 36;
const API_KEY = 'QGWOX5A1IGEY8FV7'; 
const TIME_SERIES = "TIME_SERIES_MONTHLY";
const ROUND = 4;

function createId(){
  return Math.round(Math.random()*10000);
}

export function Portfolio(){
  return(
    <main>
      <StatsContainer/>
      <MetricsContainer/>
    </main>
  )
}

function StatsContainer(){
  //declare stock and weight row arrays
  let newId = createId();

  const [stockRows, setStockRows] = React.useState([
    {id: newId,ticker: '', return: '', risk: '', monthlyCloseData: []},
  ]);
  const [weightRows, setWeightRows] = React.useState([
    {id: newId, ticker: '',weight: ''}
  ])

  //Handle ticker input changes
  const handleTicker = (stockRowId, event) => {
    setStockRows(
        stockRows.map((stockRow) => {
          if (stockRow.id === stockRowId) {
          return { id: stockRow.id, ticker: event.target.value, return: '', risk: '', monthlyCloseData: []}
        }
        return stockRow;
      })
    );
    setWeightRows(
      weightRows.map((weightRow) => {
        if (weightRow.id === stockRowId) {
        return { id: weightRow.id, ticker: event.target.value, weight: weightRow.weight,}
      }
      return weightRow;
    })
  );
  };

  //Handle weight input changes
  const handleWeight = (weightRowId, event) => {
    setWeightRows(
      weightRows.map(weightRow => {
        if (weightRow.id === weightRowId) {
          return {id: weightRow.id, ticker: weightRow.ticker, weight: event.target.value}
        }
        return weightRow;
      })
    );
  };

  //add and subtract row functions
  const addRow = () => {
    let newId = createId();
    setStockRows([...stockRows, {id: newId, ticker: '', return: '', risk: '', monthlyCloseData: []}]);
    setWeightRows([...weightRows, {id: newId, ticker: '',weight: ''}]);
    console.log(stockRows);
  };
  const removeRow = (stockRowId) => {
    let updatedStockRows = stockRows.filter(stockRow => stockRow.id !== stockRowId);
    setStockRows(updatedStockRows);
    let updatedWeightRows = weightRows.filter(weightRow => weightRow.id !== stockRowId);
    setWeightRows(updatedWeightRows);
  };
  
  const fetchData = async () => {
    const newStockRows = await Promise.all(stockRows.map(async (stockRow) => {
      const tickerInput = stockRow.ticker;
      const response = await fetch(`https://www.alphavantage.co/query?function=${TIME_SERIES}&symbol=${tickerInput}&apikey=${API_KEY}`);
      const json = await response.json();
      const monthlyData = json['Monthly Time Series'];
      const closeData = [];
      if(json['Note'] != 'Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day. Please visit https://www.alphavantage.co/premium/ if you would like to target a higher API call frequency.'){
        for (let i = 0; i < DATA_LENGTH; i++){
            closeData[i] = Number(Object.values(Object.values(monthlyData)[i])[3]);
        }
        closeData.reverse();
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
      const mean = (sum / returnData.length).toFixed(ROUND);

      //calculate standard deviation of returns over the last 5 years
      const variance = returnData.reduce((accumulator, currentValue) => accumulator + Math.pow(currentValue - mean, 2), 0) / closeData.length;
      const standardDeviation = (Math.sqrt(variance)).toFixed(ROUND);
      return { id: stockRow.id, ticker: stockRow.ticker, return: mean, risk: standardDeviation, monthlyCloseData: closeData, 'Monthly Return Data': returnData };
    }));
    setStockRows(newStockRows);
  };

  return(
    <div className='stocks-container'>
      <div className='stats-container-header'>Stocks</div>
      <StocksTable 
      stockRows={stockRows} setStockRows={setStockRows}
      addRow={addRow} removeRow = {removeRow}
      handleTicker={handleTicker}
      />
    </div>
  )
}

function StocksTable(props){

  return(
    <div className='stocks-table-container'>
      <table id="stocks-table">
        <tr>
          <th>Ticker</th>
          <th>Er</th>
          <th>SD</th>
          <th>Weight</th>
        </tr>
        {props.stockRows.map(stockRow => (
          <StocksTableRow 
          stockRow={stockRow}
          handleTicker={props.handleTicker} 
          removeRow={props.removeRow}
          />
        ))}
        <tr>
          <td colSpan={'5'}>
            <button className='plus-button' onClick={props.addRow}>+</button>
          </td>
        </tr>
      </table>
      <Button 
      buttonName = "Fetch"
      function={props.fetchData}
      />
    </div>
  )
}

function StocksTableRow(props){

  return(
    <tr>
      <td>
        <input value={props.stockRow.ticker} onChange={(event) => props.handleTicker(props.stockRow.id, event)}></input>
      </td>
      <td>{props.stockRow.return}</td>
      <td>{props.stockRow.risk}</td>
      <td>
        <input value={props.stockRow.weight} onChange={(event) => props.handleWeight(props.weightRow.id, event)}/>
      </td>
      <td>
        <button className='minus-button' onClick={() => props.removeRow(props.stockRow.id)}>-</button>
      </td>
    </tr>
  )
}


function Button(props){
  return(
    <div className='button-container'>
      <button className='submit-button' onClick={props.function}>
        {props.buttonName}
      </button>
    </div>
  )
}

function MetricsContainer(){

  return(
    <div className='metrics-container'>
      <GraphContainer/>
      <PortfolioContainer/>
    </div>
  )
}


function GraphContainer(){
  return(
    <div className = "graph-container">
      <Charts/>
    </div>
  )
}

const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
    },
  ],
};

export function Charts(){
  return(
    <div className='chart-container'>
      <Line data={data} />
    </div>
  )
}

function PortfolioContainer(){
  return(
    <div className='portfolio-container'>
      <div className='portfolio-container-header'>Portfolio</div>
      <table className='portfolio-table'>
        <tr>
          <th>Er</th>
          <th>SD</th>
          <th>Sharpe</th>
          <th>Alpha</th>
        </tr>
        <tr>
          <td>xx</td>
          <td>xx</td>
          <td>xx</td>
          <td>xx</td>
        </tr>
      </table>
    </div>
  )
}