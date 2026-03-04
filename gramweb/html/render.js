var interface = {
    ready: false,

    // ↑ variables ↑ //

    objects: {
        update: function(img, name) {
            return `<div><img src="${img}"><h3>${name}</h3></div>`
        },

        post: function(name, img, lang, commit) {
            const imgHTML = img ? `<img src="${img}">` : ""

            return `<div class="card"><h1>${name}<button onclick="interface.flash(this)"></button></h1>${imgHTML}<div><h2>${lang}</h2><div><h2>${commit.message}</h2><p>unused for now</p></div></div></div>`
        }
    },

    // ↑ objects, maybe redo this; its kinda scrappy ↑ //

    load:function() {
        // ↓ todo: absolutely make a post editor for this another time; too much work for now ↓

        updates.innerHTML = null

        // ↓ console intercept for dom, will move later for more generalized usage ↓
        // todo: make this cleaner or something, it feels really out of place here
        
        var _console = {}
        var methods = ["log", "warn", "error", "info", "debug"]

        methods.forEach(method => {
            _console[method] = console[method]

            console[method] = (...args) => {
                _console[method].apply(console, args)
                // ↑ call wrapped console class ↑ 

                // ↓ format message for dom ↓
                var cleanedArgs = []
                var skip = 0

                for (let i = 0; i < args.length; i++) {
                    if (skip > 0) {
                        skip--

                        continue
                    }

                    const arg = args[i]

                    if (typeof arg === "string" && arg.includes("%c")) {
                        var count = (arg.match(/%c/g) || []).length
                        
                        skip = count // skip css args used by %c
                        cleanedArgs.push(arg.replace(/%c/g, ""))
                    } else {
                        cleanedArgs.push(arg)
                    }
                }

                var message = cleanedArgs
                    .map(arg =>
                        typeof arg === "object"
                            ? JSON.stringify(arg, null, 2)
                            : String(arg)
                    )
                    .join(" ")

                output.innerText = `${method} > ${message}`
            }
        })

        for (var i = 0; i < interface.repos.length; i++) {
            var repo = interface.repos[i]

            console.info(`Adding: ${repo.name} to update list, index is: [${i}].`)

            // ↓ add click function to inspect shit later ↓
            if (repo.images.length > 0 && updates.children.length < 4) {
                updates.insertAdjacentHTML("beforeend", interface.objects.update(repo.images[Math.randInt(0, repo.images.length)].url, repo.name))
            }

            if (i < 7) {
                var test = repos.children[Math.round(i % 3)].insertAdjacentHTML(
                    "beforeend", 
                    interface.objects.post(
                        repo.name, 
                        repo.images[Math.randInt(0, repo.images.length)]?.url, 
                        repo.language, 
                        repo.recentCommit.commit
                    )
                )
            }
        }
        
        // ↓ add more categories based on inserted repos ↓
        
        /*
            render.canvas.volume.onmouseenter = function() {
                document.addEventListener("wheel", interface.zoom)
            }

            render.canvas.volume.onmouseout = function() {
                document.removeEventListener("wheel", interface.zoom)
            }    
        */
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
    },

    none: function(object, duration) {
        if (!object) return

        interface.flash(object)
        new toast(`This feature for "${object.id}" is currently unfinished!`, duration)
    }
}

var render = {
    middle: {},

    canvas: {
        main: document.getElementById("context"),
    },

    context: {
        main: document.getElementById("context").getContext("2d"),
        // ↑ make into function with except catch ↑ 
    },

    // ↑ variables ↑ //

    aspectRatio:function() {
        //render.canvas.volume.width = render.canvas.volume.height
        
        /*
            render.middle.volume = {
                x: render.canvas.volume.width / 2,
                y: render.canvas.volume.height / 2
            }
        */

        render.middle.main = {
            x: render.canvas.main.width / 2,
            y: render.canvas.main.height / 2
        }

        //render.canvases.main.width = document.body.clientWidth
        //render.canvases.main.height = document.body.clientHeight

        //render.canvases.volume.width = document.body.clientWidth
        //render.canvases.volume.height = document.body.clientHeight
    },

    tick:function() {
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

    // ↓ add catch for no internet access ↓
    Promise.allSettled([repoPromise]).then(function(results) {
        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(`Promise ${index + 1} failed: ${result.reason}`)
            }
        })
        // ↑ catches error from promise (url fetching) and logs error on except ↑ 
        
        interface.repos.sort((a, b) => 
            new Date(b.recentCommit.commit.committer.date) - 
            new Date(a.recentCommit.commit.committer.date)
        )
        // ↑ sorts repo list by time last updated ↑ 

        console.info(`%cAll data loaded; Gramweb initialized. Version: [${interface.git ? interface.git.commits : "N/A"}]`, "color: green")

        new toast("Welcome back @Grammy!")
        
        interface.load()

        setTimeout(() => {
            loading.style.opacity = "0%"
            
            interface.ready = true

            new toast("This site is under beta access, expect things to not work and look ugly for now.", 10000)
        }, 2000)

        render.tick()
    })
}

window.onresize = function(){
    render.aspectRatio()
}
