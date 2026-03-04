var http = {
    get: function(link, func) {
        return new Promise((resolve, reject) => {
            fetch(link)
                .then(http => {
                    if (!http.ok) {
                        throw new Error(`HTTP error! Status: ${http.status}`)
                    }
                    
                    return http.json()
                })
                .then(json => {
                    func(json)
                    resolve()
                })
                .catch(err => {
                    console.error("Fetch error:", err)

                    reject(err)
                })
        })
    },

    open: function(url) {
        var width = Math.floor(window.innerWidth * 0.8)
        var height = Math.floor(window.innerHeight * 0.8)
    
        var handle = window.open(
            url,
            url,
            "width="+width+",height="+height
        )
    
        if (!handle) {
            window.location = url
        }
    },

    image: async function(url) {
        var image = new Image()
        image.src = url

        await image.decode()

        return {
            width: image.naturalWidth,
            height: image.naturalHeight
        }
    }
}
