import React from 'react';
import './portfolio.css'

export function Portfolio(){
  return(
    <main>
      <StatsContainer/>
      <GraphContainer/>
    </main>
  )
}

function StatsContainer(){
  return(
    <div className='stats-container'>
      <UpperStatsContainer/>
      <LowerStatsContainer/>
      <MessagesContainer/>
    </div>
  )
}

function UpperStatsContainer(){
  return(
    <div className='inner-stats-container'>
      <StocksTable/>
      <Button buttonName = "Fetch"/>
    </div>
  )
}

function StocksTable(){
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
        <tr>
          <td><input className="width" type="text" id="ticker-1"/></td>
          <td id="return-1"></td>
          <td id="risk-1"></td>
        </tr>
        <tr>
          <PlusMinusRow/>
        </tr>
      </table>
    </div>
  )
}

function ContainerHeader(props){
  return(
    <tr>
      <th colSpan={props.tableWidth}>{props.tableName}</th>
    </tr>
  )
}

function PlusMinusRow(){
  return(
    <td id="button-row" >
      <input type="submit" className="add-row-button" value="+"/>
      <input type="submit" className="minus-row-button" value="-"/>
    </td>
  )
}

function Button(props){
  return(
    <div className='button-container-1'>
      <input className='submit-button' type = "Submit" value={props.buttonName}/>
    </div>
  )
}

function LowerStatsContainer(){
  return(
    <div className='inner-stats-container'>
      <WeightsTable/>
      <PortfolioTable/>
      <Button buttonName="Calculate"/>
    </div>
  )
}

function WeightsTable(){
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
        <tr>
          <td id = "weight-name-1"></td>
          <td><input className="width" type="text" id="weight-1" value=".3333"/></td>
        </tr> 
      </table>
    </div>
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