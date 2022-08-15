function VHCenteredFlexboxWithNavbar(props){

    return (

        <div style={{
            width: "100%", height: "100%", display: "flex", flexDirection: "row", alignItems:"center", justifyContent: "center"
        }}>

            <div style = {{
                display: "flex", flexDirection: "column", alignItems: "center", flexWrap: "nowrap"
            }}>

                {props.children}

            </div>


        </div>

    );

}

export default VHCenteredFlexboxWithNavbar;