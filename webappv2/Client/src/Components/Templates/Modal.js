import 'w3-css/w3.css'

import {useState} from 'react'

function ModalContent(props){

    return (
        <div className='w3-modal' style={{display: props.visible?'block':undefined}}>  
            <div className='w3-modal-content'>
                <div className='w3-bar w3-khaki'>
                    <span style={{fontSize:"16pt"}} className="w3-bar-item">
                        {props.title}   
                    </span>
                    <span style={{
                        fontSize:"16pt",
                    }}
                    onClick={props.closeHook}
                    className = 'w3-btn w3-red w3-bar-item w3-right'
                    >
                        &times;
                    </span>
                </div>
                {props.children}
            </div>
        </div>
    );

}

function useModal(){
    const [visible, setVisible] = useState(false)
    const [content, setContent] = useState(<></>)
    const open = (content)=>{
        setContent(content)
        setVisible(true)
    }
    const close = () => {
        setVisible(false)
    }
    const modal_content = (
        <ModalContent visible={visible} closeHook={close} title={content.title}>{content.body}</ModalContent>
    )
    return [modal_content,open,close]
}

export default useModal;