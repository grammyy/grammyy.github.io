
var interface = {
    ready: false,

    // ↑ variables ↑ //

    load:function() {
        //render.canvas.volume
        render.canvas.volume.onmouseenter = function() {
            document.addEventListener("wheel", interface.zoom)
        }

        render.canvas.volume.onmouseout = function() {
            document.removeEventListener("wheel", interface.zoom)
        }
    },

    flash: function(object, func) {
        if (object.flash) {
            object.style.animation = ""

            object.flash.restart()

            return
        }
        
        object.flash = anime.createTimeline({defaults: { duration: 750 }})
            .call(() => object.style.animation = "hoverLeave 0.2s linear", 50)
            .call(() => object.style.animation = "", 100)
            .call(() => object.style.animation = "hoverLeave 0.2s linear", 150)
            .call(() => {
                object.style.animation = ""
                object.flash = null

                func?.()
            }, 200)
    }
}

var render = {
    middle: {},

    canvas: {
        main: document.getElementById("context"),
        volume: volume.getElementsByClassName("dial")[0],
    },

    context: {
        main: document.getElementById("context").getContext("2d"),
        volume: volume.getElementsByClassName("dial")[0].getContext("2d"),
    },

    // ↑ variables ↑ //

    aspectRatio:function() {
        render.canvas.volume.width = render.canvas.volume.height
        
        render.middle.volume = {
            x: render.canvas.volume.width / 2,
            y: render.canvas.volume.height / 2
        }

        render.middle.main = {
            x: render.canvas.main.width / 2,
            y: render.canvas.main.height / 2
        }

        //render.canvases.main.width = document.body.clientWidth
        //render.canvases.main.height = document.body.clientHeight

        //render.canvases.volume.width = document.body.clientWidth
        //render.canvases.volume.height = document.body.clientHeight
    },

    drawVolume:function() {
        render.context.volume.reset()
        render.context.volume.translate(render.middle.volume.x, render.middle.volume.x)

        render.context.volume.fillStyle = "red"

        render.context.volume.arc(0,0,45,0,2 * Math.PI)
        render.context.volume.fill()

        render.context.volume.resetTransform()
    },

    tick:function() {
        render.drawVolume()

        window.requestAnimationFrame(render.tick)
    }
}

window.onload = function() {
    render.aspectRatio()

    var repoPromise = new Promise((resolve, reject) => {
        http.get("https://script.google.com/macros/s/AKfycbwYXzcV_b1Db4hyCcrFZF0PRNho3KBUXkOcEhdpLIKsYeAbj9eEMwSdoSOQgdn27V2g/exec", function(git) {
            interface.repos = git

            resolve()
        }).catch(err => {
            console.error(`Repo fetch error: ${err}`)

            reject(err)
        })
    })

    Promise.allSettled([repoPromise]).then(function(results) {
        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(`Promise ${index + 1} failed: ${result.reason}`)
            }
        })
        
        console.info(`%cAll data loaded; Gramweb initialized. Version: [${interface.git ? interface.git.commits : "N/A"}]`, "color: green")

        interface.load()

        setTimeout(() => {
            loading.style.opacity = "0%"
            
            interface.ready = true
        }, 2000)

        new toast("Welcome back @Grammy!")

        render.tick()
    })
}

window.onresize = function(){
    render.aspectRatio()
}
