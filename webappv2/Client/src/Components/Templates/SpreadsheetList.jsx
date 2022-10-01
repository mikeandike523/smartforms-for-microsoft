import { Link } from 'react-router-dom'

function SpreadsheetList(props) {

    var items = props.items
    console.log(items.length)
    var item_content = []
    for (var i = 0; i < items.length; i++) {
        item_content.push(<h5>{items[i].filePath}&nbsp;&nbsp;<Link to={"/end-user-facing/" + items[i].id} style={{
            color: "blue",
            textDecoration: "underline",
            cursor: "pointer",
            userSelect: "none"
        }}>Go To URL</Link>&nbsp;&nbsp;<span style={
            {
                color: "blue",
                textDecoration: "underline",
                cursor: "pointer",
                userSelect: "none"
            }
        }>Copy URL To Clipboard</span></h5>) //@TODO: Implement this. 
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
                <h5>Connected Spreadsheets:</h5>
                {item_content}
            </>
        )

}

export default SpreadsheetList