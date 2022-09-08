function getPathComponents(path) {

    path = path.replace(/\\/g,"/")
    path = path.replace(/\/+/g,"/")
    path = path.replace(/^\//g,"")
    path = path.replace(/\/$/g,"")

    if (path==""){
        return []
    }

    return path.split("/")

}

export {getPathComponents}