import React from 'react';
import './portfolio.css';

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
      <GraphContainer/>
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
    <div className='stats-container'>
      <UpperStatsContainer 
      stockRows={stockRows} setStockRows = {setStockRows}
      addRow={addRow} removeRow = {removeRow}
      fetchData={fetchData} handleTicker = {handleTicker}
      />
      <LowerStatsContainer
      weightRows={weightRows} setWeightRows = {setWeightRows}
      addRow={addRow} removeRow = {removeRow}
      handleWeight={handleWeight}
      />
      <MessagesContainer/>
    </div>
  )
}

function UpperStatsContainer(props){

  return(
    <div className='inner-stats-container'>
      <StocksTable 
      stockRows={props.stockRows} setStockRows={props.setStockRows}
      addRow={props.addRow} removeRow = {props.removeRow}
      handleTicker={props.handleTicker}
      />
      <Button 
      buttonName = "Fetch"
      function={props.fetchData}
      />
    </div>
  )
}

function StocksTable(props){

  return(
    <div className='stocks-container'>
      <table id="stocks-table">
        <ContainerHeader 
        tableWidth="4" 
        tableName="Stocks"
        />
        <tr>
          <th>Ticker</th>
          <th>Er</th>
          <th>SD</th>
        </tr>
        {props.stockRows.map(stockRow => (
          <StocksTableRow 
          stockRow={stockRow}
          handleTicker={props.handleTicker} 
          removeRow={props.removeRow}
          />
        ))}
        <tr>
          <td colSpan={'4'}>
            <button className='plus-button' onClick={props.addRow}>+</button>
          </td>
        </tr>
      </table>
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
        <button className='minus-button' onClick={() => props.removeRow(props.stockRow.id)}>-</button>
      </td>
    </tr>
  )
}

function ContainerHeader(props){
  return(
    <tr>
      <th colSpan={props.tableWidth}>{props.tableName}</th>
    </tr>
  )
}

function Button(props){
  return(
    <div className='button-container-1'>
      <button className='submit-button' onClick={props.function}>
        {props.buttonName}
      </button>
    </div>
  )
}

function LowerStatsContainer(props){
  return(
    <div className='inner-stats-container'>
      <WeightsTable 
      weightRows={props.weightRows} 
      handleWeight={props.handleWeight}
      />
      <PortfolioTable/>
      <Button buttonName="Calculate"/>
    </div>
  )
}

function WeightsTable(props){
  return(
    <div className='weights-container'>
      <table id="weights-table">
        <ContainerHeader 
          tableWidth="2" 
          tableName="Weights"
        />
        <tr>
          <th>Ticker</th>
          <th>Weight</th>
        </tr>
        {props.weightRows.map(weightRow => (
          <WeightsTableRow 
          weightRow={weightRow} 
          handleWeight={props.handleWeight}
          />
        ))}
        </table>
    </div>
  )
}

function WeightsTableRow(props){

  return(
    <tr>
    <td>{props.weightRow.ticker}</td>
    <td>
      <input value={props.weightRow.weight} onChange={(event) => props.handleWeight(props.weightRow.id, event)}/>
    </td>
  </tr> 
  )
}

function PortfolioTable(){
  return(
    <div className='portfolio-container'>
      <table>
        <ContainerHeader
          tableWidth="2"
          tableName="Portfolio"
        />
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
  )
}

function MessagesContainer(){
  return(
    <div className="messages-container">
    <div className="message-header">Messages</div>
      <span className="user-name"></span>
      <div id="messages"></div>
    </div>
  )
}

function GraphContainer(){
  return(
    <div className = "graph-container">
      <div className="graph">A graph will go here for the react deliverable</div>
    </div>
  )
}