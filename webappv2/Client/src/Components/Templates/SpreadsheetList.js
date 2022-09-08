function SpreadsheetList(props){

    var items = props.items
    return items.length === 0 ? <>
        <span>No connected spreadsheets.&nbsp;<span onClick={props.handleConnectSpreadsheet} style={{textDecoration:'underline',cursor:'pointer',}} className='w3-text-blue'>Connect New Spreadsheet</span></span>
    </> : <>
    <h3>Connected Spreadsheets:</h3>
    </>

    
}

export default SpreadsheetList