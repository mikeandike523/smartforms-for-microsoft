function getPathComponents(path) {

    path = path.replace(/\\/g, "/")
    path = path.replace(/\/+/g, "/")
    path = path.replace(/^\//g, "")
    path = path.replace(/\/$/g, "")

    if (path === "") {
        return []
    }

    return path.split("/")

}

function fusePathComponents(components) {
    return components.join("/")
}

export { getPathComponents, fusePathComponents }