function SpreadsheetList(props) {

    var items = props.items
    var item_content = []
    for (var i = 0; i < items.length; i++) {
        item_content.push(<h5>{items[i].filePath}</h5>)
    }
    return (items.length === 0) ?
        (
            <span>
                No connected spreadsheets.
                &nbsp;
                <span onClick={props.handleConnectSpreadsheet}
                    style={{ textDecoration: 'underline', cursor: 'pointer', userSelect: 'none' }}
                    className='w3-text-blue'
                >Connect New Spreadsheet</span>
            </span>

        ) : (
            <>
                <h3>Connected Spreadsheets:</h3>
                {item_content}
            </>
        )

}

export default SpreadsheetList