import React from 'react';
import './portfolio.css';

// const DATA_LENGTH = 36;

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
  const [stockRows, setStockRows] = React.useState([
    {ticker: '', return: '', risk: ''},
  ]);
  const [weightRows, setWeightRows] = React.useState([
    {weightName: '',weight: ''}
  ])

  //Sets first rows of stocks and weights table
  React.useEffect(() => {
    if (stockRows.length === 0) {
      setStockRows([{ ticker: "", return: "", risk: "" }]);
    }
    if (weightRows.length === 0) {
      setWeightRows([{weightName: '',weight: ''}]);
    }
  }, [stockRows, weightRows]);

  //Handle ticker input changes
  const handleTicker = (rowId, event) => {
    setStockRows(
        stockRows.map((row) => {
          if (row.id === rowId) {
          return { id: row.id, ticker: event.target.value, return: row.return, risk: row.risk}
        }
        return row;
      })
    );
  };

  //add and subtract row functions
  const addRow = () => {
    setStockRows([...stockRows, {ticker: '', return: '', risk: ''}]);
    setWeightRows([...weightRows, {weightName: '',weight: ''}]);
  };
  const removeRow = () => {
    setStockRows(stockRows.slice(0, -1));
    setWeightRows(weightRows.slice(0, -1));
  };

  
  const fetchData = () => {
    console.log(stockRows);
  };

  return(
    <div className='stats-container'>
      <UpperStatsContainer 
      rows={stockRows} setRows = {setStockRows}
      addRow={addRow} removeRow = {removeRow}
      fetchData={fetchData} handleTicker = {handleTicker}
      />
      <LowerStatsContainer
      rows={weightRows} setRows = {setWeightRows}
      addRow={addRow} removeRow = {removeRow}
      />
      <MessagesContainer/>
    </div>
  )
}

function UpperStatsContainer(props){

  return(
    <div className='inner-stats-container'>
      <StocksTable 
      rows={props.rows} setRows={props.setRows}
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
        tableWidth="3" 
        tableName="Stocks"
        />
        <tr>
          <th>Ticker</th>
          <th>Er</th>
          <th>SD</th>
        </tr>
        {props.rows.map((row, index) => (
          <StocksTableRow 
          key={index} 
          rowNumber={index + 1}
          handleTicker={props.handleTicker} 
          />
        ))}
        <tr>
          <PlusMinusRow 
          onAdd={props.addRow} 
          onRemove={props.removeRow}
          />
        </tr>
      </table>
    </div>
  )
}

function StocksTableRow({rowNumber, handleTicker}){
  const tickerId = `ticker-${rowNumber}`;
  const returnId = `return-${rowNumber}`;
  const riskId = `risk-${rowNumber}`;

  return(
    <tr>
      <td>
        <input className="width" type="text" id={tickerId} onChange={handleTicker}/>
      </td>
      <td id={returnId}></td>
      <td id={riskId}></td>
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

function PlusMinusRow({onAdd, onRemove}){
  return(
    <td id="button-row">
      <button className="add-row-button" onClick={onAdd}>
        +
      </button>
      <button className="minus-row-button" onClick={onRemove}>
        -
      </button>
    </td>
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
      rows={props.rows} setRows = {props.setRows}
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
        {props.rows.map((row, index) => (
          <WeightsTableRow key={index} rowNumber={index + 1} />
        ))}      </table>
    </div>
  )
}

function WeightsTableRow({rowNumber}){
  const weightNameId = `weight-name-${rowNumber}`
  const weightId = `weight-${rowNumber}`

  return(
    <tr>
    <td id ={weightNameId}></td>
    <td><input className="width" type="text" id={weightId} value=".3333"/></td>
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