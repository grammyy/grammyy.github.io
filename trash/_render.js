var exts = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff", "ico"]
// ↑ supported image types for file explorer ↑ //

var interface = {
    systems: [],
    orbits: [],
    repos: null,
    alerts: [],
    events: [],
    stack: 0,
    rotate: 0,
    offset: {x: 0, y: 0},
    scale: 1,
    focused: null,
    motion: true,
    cookies: false,
    autoFocus: true,
    orbits: true,
    newsFocus: true,
    inspect: true,
    
    // ↑ variables ↑ //

    svgs:{
        folder: "<svg viewBox='0 0 450 450' width='10' height='10'><g transform='translate(0, 0)'><path stroke='currentcolor' fill='currentcolor' d='M490.667,74.667H205.184L189.76,43.797C186.133,36.565,178.752,32,170.667,32H21.333C9.536,32,0,41.536,0,53.333v405.333 C0,470.464,9.536,480,21.333,480h469.333c11.797,0,21.333-9.536,21.333-21.333V181.333V96 C512,84.203,502.464,74.667,490.667,74.667z M469.333,160H247.851l-21.333-42.667h242.816V160z'/></path></g></svg>"
    },

    // ↑ templates ↑ //

    assemble:function(repos) {
        var planetThreshold = 50

        console.group("Assembling solar systems: [" + repos.length + "]")
    
        repos.forEach(repo => {
            var language = repo.language || "Other"
            var size =  Math.min(repo.size - (repo.size ^ 40 - 50), 150)
            
            if (!interface.systems[language]) {
                console.info("Constructing -> " + language)

                interface.systems[language] = {
                    sun: language,
                    planets: [],
                    moons: [],
                    x: Math.randInt(-10000, 10000),
                    y: Math.randInt(-10000, 10000),
                    dir: Math.randInt(-1,1),
                }
            }

            if (size >= planetThreshold) {
                var planet = interface.systems[language].planets.push({
                    repo: repo,
                    size: size,
                    x: Math.randInt(-200, 200),
                    y: Math.randInt(-200, 200),
                    dir: Math.randInt(-1,1),
                    sun: interface.systems[language]
                })

                repo.self = planet
            } else {
                var moon = interface.systems[language].moons.push(repo)
                
                repo.self = moon
            }
        })
    
        Object.keys(interface.systems).forEach(language => {
            var system = interface.systems[language]
    
            system.moons.forEach(moon => {
                var ranIndex = Math.floor(Math.random() * system.planets.length)
                var ranPlanet = system.planets[ranIndex]
                
                if (!ranPlanet.moons) {
                    ranPlanet.moons = []
                }
                
                moon.x = Math.randInt(-200, 200)
                moon.y = Math.randInt(-200, 200)
                moon.dir = Math.randInt(-1,1),
                moon.planet = ranPlanet
            })
        })

        console.groupEnd()
    },

    forRepo:function(func) {
        for (var i = 0; i < interface.repos.length; i++) {
            func(interface.repos[i], i)
        }
    },

    forSystem:function(func, sun) {
        for (var i = 0; i < sun.planets.length; i++) {
            func(sun.planets[i], true, i)
        }

        for (var i = 0; i < sun.moons.length; i++) {
            func(sun.moons[i], false, i)
        }
        // ↑ returns callback, if its a planet, and the index tied to that body ↑
    },

    find:function(body, func, findDist = Infinity, x = 0, y = 0) {
        var result = null;
        
        Object.keys(body).forEach(obj => {
            var system = body[obj];
            
            var dx = system.x * interface.scale + interface.offset.x + x;
            var dy = system.y * interface.scale + interface.offset.y + y;
            var distance = Math.hypot(dx, dy);
            // ↑ get distance from each object to interface.offset ↑
    
            if (distance < findDist) {
                findDist = distance
                result = system
            }
        })
    
        func(result)
    },

    dumped: function(bool) {
        if (bool) {
            explorer.children[2].classList.add("empty")
        } else {
            explorer.children[2].classList.remove("empty")
        }
    },

    focus:function(body, isPlanet = true) {
        interface.focused = body

        middle.children[0].innerText = isPlanet ? (body.planets ? body.sun : body.repo.name) : body.name
        middle.children[1].innerText = isPlanet ? (body.planets ? body.sun : body.repo.name) : body.name
        middle.children[2].innerText = isPlanet ? (body.planets ? body.sun : body.repo.name) : body.name

        system.innerHTML = ""
        images.innerHTML = ""

        if (body.planets) {
            interface.systems[body.sun].planets.forEach(planet => {
                interface.list(planet)
                interface.display(planet.repo)
            })
        } else {
            if (isPlanet) {
                interface.display(body.repo)
            
                body.sun.planets.forEach(planet => {
                    interface.list(planet)
                })
            } else {
                interface.display(body)
            
                body.planet.sun.planets.forEach(planet => {
                    interface.list(planet)
                })
            }
        }
    },

    zoom:function(mouse) {
        if (mouse.target === render.canvases.main) {
            interface.scale = interface.scale - (interface.scale * mouse.deltaY / 1000)
            interface.scale = Math.max(0.001, interface.scale)
        }
    
        interface.offset = {
            x: interface.offset.x + (Math.norm(mouse.deltaY) * (-interface.offset.x / 9.8)),
            y: interface.offset.y + (Math.norm(mouse.deltaY) * (-interface.offset.y / 9.8))
        }

        if (!interface.focused && interface.scale >= 0.5 && interface.autoFocus) {
            render.closestSun(sun => {
                interface.focus(sun)
            }, 250)
        }
    },

    randFocus:function() {
        var suns = Object.keys(interface.systems)
        var sun = suns[Math.floor(Math.random() * suns.length)]
        
        interface.focus(interface.systems[sun])
    },

    click:function(e) {
        Object.keys(interface.systems).forEach(sun => {
            var system = interface.systems[sun]

            interface.forSystem((body, isPlanet) => {
                var bodyX = render.middle.x + body.x * interface.scale + interface.offset.x + system.x * interface.scale + (!isPlanet ? body.planet.x * interface.scale : 0)
                var bodyY = render.middle.y + body.y * interface.scale + interface.offset.y + system.y * interface.scale + (!isPlanet ? body.planet.y * interface.scale : 0)
                var bodyRadius = (body.size / 2) * interface.scale
                // ↑ calculate radius based on scale ↑
    
                if (Math.hypot(e.x - bodyX, e.y - bodyY) <= bodyRadius) {
                    interface.focus(body, isPlanet)
                }
            }, system)
        })
        //todo: add system clicking, and ignoring already focused objects
    },

    alert:function(i) {
        var alert = interface.alerts[i]
        var event = alert.onclick ? "style='cursor: pointer' onclick='"+alert.onclick+"'" : ""

        console.info(interface.alerts[i])

        if (alert.image) {
            notifications.children[1].insertAdjacentHTML("afterend","<div "+event+"><img src='"+alert.image+"'><p>"+alert.body+"</p></div><whitespace></whitespace>")
        } else {
            notifications.children[1].insertAdjacentHTML("afterend","<div "+event+"><div style='background-color: hsl("+interface.stack+"deg 100 40)'>"+((i >= 9) ? i + 1 : "0"+(i + 1))+"</div><p>"+alert.body+"</p></div><whitespace></whitespace>")

            interface.stack += 45
        }
    },

    event:function(i) {
        var evt = interface.events[i]
        var evt2 = interface.events[i + 1]
        var tmp = [
            "<div onclick='http.viewEvent(\"",
            "\")'>",
            "<h4>",
            "</h4><h3>",
            "</h3><p>",
            "</p></div>"
        ]

        console.info(interface.events[i])

        // evt.link -> http.open
        // evt.image? -> img, random image
        // evt.creation -> h4
        // evt.name -> h3
        // evt.commit -> p

        news.children[0].insertAdjacentHTML("beforeend",tmp[0] + evt.link + tmp[1] + ((evt.images.length > 0) ? "<img src='" + decodeURI(evt.images[Math.randInt(0, evt.images.length - 1)]) + "'>" : "") + tmp[2] + evt.creation + tmp[3] + evt.name + tmp[4] + evt.commit + tmp[5])
        
        if (evt2){
            console.info(interface.events[i + 1])

            news.children[2].insertAdjacentHTML("beforeend",tmp[0] + evt2.link + tmp[1] + ((evt2.images.length > 0) ? "<img src='" + decodeURI(evt2.images[Math.randInt(0, evt2.images.length - 1)]) + "'>" : "") + tmp[2] + evt2.creation + tmp[3] + evt2.name + tmp[4] + evt2.commit + tmp[5])
        }
    },

    list:function(body) {
        system.insertAdjacentHTML("afterbegin","<div><p>" + body.repo.name + "</p></div>")
    },

    display:function(repo) { //todo: make google processing only get showcase images
        if (repo.images.length > 0) {
            for (var i = 0; i < repo.images.length; i++) {
                images.insertAdjacentHTML("afterbegin","<img src=\"" + repo.images[i].url + "\">")
            }
        }
    },

    minimalize:function(bool) {
        if (bool) {
            left.style.width = "20%"
            main.style.width = "50%"
            middle.style.display = "block"
            right.style.width = "15%"
            right.style.borderLeft = "none"
        } else {
            left.style.width = "22%"
            main.style.width = "61%"
            middle.style.display = "none"
            right.style.width = "17%"
            right.style.borderLeft = "2px solid var(--border)"
        }
    },

    save:function() {
        interface.minimalize(interface.inspect)

        if (!interface.cookies) {
            cookieManager.deleteCookie("settings")

            return
        }

        cookieManager.setCookie("settings", JSON.stringify({
            motion: interface.motion,
            cookies: interface.cookies,
            autoFocus: interface.autoFocus,
            orbits: interface.orbits,
            newsFocus: interface.newsFocus,
            inspect: interface.inspect
        }), 0).catch(err => {
            console.error(err) 
        })
    },

    load: function() {
        cookieManager.getCookie('settings').then(cookie => {
            try {
                var json = JSON.parse(cookie)
                
                if (json) {
                    console.group('Retrieved save for Gramweb.')
                    console.info(json)
                    console.groupEnd()

                    for (var setting in json) {
                        switch (setting) {
                            case 'motion':
                                if (!json.motion) {
                                    motion.classList.add("active")

                                    interface.motion = json.motion
                                }

                                break

                            case 'cookies':
                                if (json.cookies) {
                                    cookies.classList.add("active")

                                    interface.cookies = json.cookies
                                }

                                break

                            case 'autoFocus':
                                if (!json.autoFocus) {
                                    autoFocus.classList.remove("active")

                                    interface.autoFocus = json.autoFocus
                                }

                                break

                            case 'orbits':
                                if (!json.orbits) {
                                    orbits.classList.remove("active")

                                    interface.orbits = json.orbits
                                }

                                break

                            case 'newsFocus':
                                if (!json.autoFocus) {
                                    newsFocus.classList.remove("active")

                                    interface.newsFocus = json.newsFocus
                                }

                                break

                            case 'inspect':
                                if (!json.inspect) {
                                    inspect.classList.remove("active")
                                    interface.minimalize(false)
                                    
                                    interface.inspect = json.inspect
                                }

                                break

                            default:
                                console.warn("Unknown setting " + setting + " encountered.")
                        }
                    }
                } else {
                    console.info("%cError occurred or no save found for Gramweb.", "color: #a72e08")
                }
            } catch (error) {
                console.error("Failed to parse settings JSON:", error)
            }
        }).catch(function(error) { 
            console.error("Failed to retrieve cookie:", error) 
        })
    }
}

var render = {
    canvases: {
        main: document.getElementById("context"),
        overlay: document.getElementById("overlay"),
        info: document.getElementById("info")
    },

    context: {
        main: document.getElementById("context").getContext("2d"),
        overlay: document.getElementById("overlay").getContext("2d"),
        info: document.getElementById("info").getContext("2d")
    },

    scale: [1980, 1080],

    // ↑ variables ↑ //

    closestSun:function(func, findDist = Infinity, x = 0, y = 0) {
        interface.find(interface.systems, func, findDist, x, y);
    },
    
    closestPlanet:function(func, findDist = Infinity, x = 0, y = 0) {
        render.closestSun(system => {
            if (system && system.planets) {
                interface.find(system.planets, func, findDist, x, y);
            }
        }, findDist, x, y);
    },

    aspectRatio:function() {
        render.middle = {
            x: solar.offsetLeft + solar.offsetWidth / 2,
            y: solar.offsetTop + solar.offsetHeight / 2,
            // ↑ main context center ↑

            info: {
                x: info.offsetWidth / 2,
                y: info.offsetHeight / 2
            }
        }

        render.canvases.main.width = document.body.clientWidth
        render.canvases.main.height = document.body.clientHeight

        render.canvases.overlay.width = document.body.clientWidth
        render.canvases.overlay.height = document.body.clientHeight
        
        render.canvases.info.width = info.offsetWidth
        render.canvases.info.height = info.offsetHeight
    },

    arc:function(x, y, radius, startAngle, endAngle, fill = false, pie = false, context = render.context.main) {
        context.beginPath()
        
        if (pie) {
            context.moveTo(x, y)
            context.arc(x, y, radius, startAngle, endAngle)
            context.moveTo(x, y)
        } else {
            context.arc(x, y, radius, startAngle, endAngle)
        }

        if (fill) {
            context.fill()
        } else {
            context.stroke()
        }
    },
    
    tick:function() {
        render.context.main.reset()
        render.context.overlay.reset()

        render.context.main.font = "15px Georgia";
        render.context.main.textAlign = "center"

        if (interface.focused) {
            var x, y
                
            if (!interface.focused.planets && !interface.focused.planet) {
                x = -(interface.focused.sun.x + interface.focused.x) * interface.scale
                y = -(interface.focused.sun.y + interface.focused.y) * interface.scale
            } else {
                if (interface.focused.planet) {
                    x = -(interface.focused.planet.sun.x + interface.focused.planet.x + interface.focused.x) * interface.scale
                    y = -(interface.focused.planet.sun.y + interface.focused.planet.y + interface.focused.y) * interface.scale
                } else {
                    x = -(interface.focused.x) * interface.scale
                    y = -(interface.focused.y) * interface.scale
                }
            }
    
            interface.offset.x += (x - interface.offset.x) * 0.08
            interface.offset.y += (y - interface.offset.y) * 0.08
        }
        
        Object.keys(interface.systems).forEach(sun => {
            var system = interface.systems[sun]
            var x = (render.middle.x + interface.systems[sun].x * interface.scale + interface.offset.x)
            var y = (render.middle.y + interface.systems[sun].y * interface.scale + interface.offset.y)
            
            if (interface.motion) {
                var xy = Math.rotate(0.0001 * system.dir, 0, 0, system.x, system.y)

                system.x = xy[0]
                system.y = xy[1]
            }

            var dist = Math.hypot(-system.x, -system.y)

            render.context.main.strokeStyle = "#3e3432"
            render.arc((render.middle.x + interface.offset.x), (render.middle.y + interface.offset.y), dist * interface.scale, 0, 2 * Math.PI);

            render.context.main.fillStyle = "white"
            render.context.main.font = "15px serif"
            render.context.main.textAlign = "left"
            render.context.main.fillText(sun, x + 220 * interface.scale, y + 5)

            interface.forSystem((body, isPlanet) => {
                var x = (render.middle.x + body.x * interface.scale + interface.offset.x + system.x * interface.scale) + (!isPlanet ? body.planet.x * interface.scale : 0)
                var y = (render.middle.y + body.y * interface.scale + interface.offset.y + system.y * interface.scale) + (!isPlanet ? body.planet.y * interface.scale : 0)

                if (interface.motion) {
                    var vel = 0.002 - body.size / 100000
                    var xy = Math.rotate(vel * body.dir, 0, 0, body.x, body.y)

                    body.x = xy[0]
                    body.y = xy[1]
                }

                var dist = Math.hypot(-body.x, -body.y)
                
                render.context.overlay.strokeStyle = "#3e3432"

                if (isPlanet) {
                    if (interface.orbits) {
                        render.arc((render.middle.x + interface.offset.x + system.x * interface.scale), (render.middle.y + interface.offset.y + system.y * interface.scale), dist * interface.scale, 0, 2 * Math.PI)
                    }
                    
                    render.arc(x, y, Math.max(((body.size / 2) * interface.scale), 0), 0, 2 * Math.PI)
                } else {
                    //render.arc((render.middle.x + interface.offset.x + system.x * interface.scale + moon.planet.x * interface.scale), (render.middle.y + interface.offset.y + system.y * interface.scale + moon.planet.y * interface.scale), dist * interface.scale, 0, 2 * Math.PI)
                    render.arc(x, y, (body.size / 2) * interface.scale, 0, 2 * Math.PI, false, false, render.context.overlay)
                }

                if (interface.scale > 0.15) {
                    render.context.overlay.fillStyle = "white"
                    render.context.overlay.font = (isPlanet ? 15 : 5) * interface.scale + "px serif"
                    render.context.overlay.textAlign = "center"
                    render.context.overlay.fillText(isPlanet ? body.repo.name : body.name, x, y + 4)
                }
            }, system)
        })

        interface.rotate += 0.0007

        render.context.info.reset()

        render.context.info.fillStyle = "#e5e2db"
        render.arc(render.middle.info.x, render.middle.info.y, render.middle.info.x / 1.5, 0 , 2 * Math.PI, true, false, render.context.info)

        render.context.info.fillStyle = "#ffffff40"
        render.arc(render.middle.info.x, render.middle.info.y, render.middle.info.x / 1.25, interface.rotate, interface.rotate + Math.PI / 2, true, true, render.context.info)
        render.arc(render.middle.info.x, render.middle.info.y, render.middle.info.x / 1.25, interface.rotate + Math.PI, interface.rotate + (3 * Math.PI) / 2, true, true, render.context.info)

        render.context.info.fillStyle = "white"
        render.arc(render.middle.info.x, render.middle.info.y, render.middle.info.x / 1.8, 0 , 2 * Math.PI, true, false, render.context.info)

        render.context.info.fillStyle = "#ddd4c7"
        render.arc(render.middle.info.x, render.middle.info.y, render.middle.info.x / 4.5, 0 , 2 * Math.PI, true, false, render.context.info)

        render.context.info.strokeStyle = "#a9a090"
        render.arc(render.middle.info.x, render.middle.info.y, render.middle.info.x / 1.8, 0 , 2 * Math.PI, false, false, render.context.info)
        render.arc(render.middle.info.x, render.middle.info.y, render.middle.info.x / 4.5, 0 , 2 * Math.PI, false, false, render.context.info)

        if (interface.focused) {
            interface.forSystem((body, isPlanet) => {
                var normal = isPlanet ? Math.normVec(body.x, body.y) : Math.normVec(body.x + body.planet.x, body.y + body.planet.y)
                var size = isPlanet ? 14 : 22

                render.context.info.fillStyle = "#e5e2db"
                render.arc(render.middle.info.x + (normal.x * 63), render.middle.info.y + (normal.y * 63), render.middle.info.x / size, 0 , 2 * Math.PI, true, false, render.context.info)

                render.context.info.fillStyle = "black"
                render.arc(render.middle.info.x + (normal.x * 63), render.middle.info.y + (normal.y * 63), render.middle.info.x / size, 0 , 2 * Math.PI, false, false, render.context.info)
            }, interface.focused.planet ? interface.focused.planet.sun : (interface.focused.planets ? interface.focused : interface.focused.sun))
        }

        window.requestAnimationFrame(render.tick)
    }
}

window.onload = function() {
    render.aspectRatio()

    var repoPromise = new Promise((resolve, reject) => {
        http.get("https://script.google.com/macros/s/AKfycbwYXzcV_b1Db4hyCcrFZF0PRNho3KBUXkOcEhdpLIKsYeAbj9eEMwSdoSOQgdn27V2g/exec", function(git) {
            interface.repos = git

            for (var i = 0; i < git.length; i++) {
                if(git[i].name == "grammyy.github.io") {
                    interface.git = {
                        recentCommit: git[i].recentCommit,
                        commits: git[i].commits
                    }
                }
            }

            interface.assemble(git)

            resolve()
        }).catch(err => {
            console.error("Repo fetch error:", err)

            reject(err)
        })
    })

    var alertsPromise = new Promise((resolve, reject) => {
        http.get("https://script.google.com/macros/s/AKfycbzAjl6IyaJGFBmIliMVG9_7C_A2TXdfl9We38kzLJKzPmp93_7e-N29D55DUp_xXxl2/exec", function(alerts) {
            interface.alerts = alerts

            console.group("Interface alerts")

            for (var i = 0; i < alerts.length; i++) {
                if (i <= 5) {
                    notifications.children[notifications.childElementCount - 2].remove()
                    notifications.children[notifications.childElementCount - 2].remove()
                }

                interface.alert(i)
            }

            console.groupEnd()

            var style = document.createElement("style")

            document.head.appendChild(style)
            style.sheet.insertRule(".loading div { background: grey !important }", 0)

            alerthttp.classList = ""
            alerthttp.innerText = "NOTIFICATIONS - " + alerts.length + " -"

            resolve()
        }).catch(err => {
            console.error("Alerts fetch error:", err)

            reject(err)
        })
    })

    var eventsPromise = new Promise((resolve, reject) => {
        http.get("https://script.google.com/macros/s/AKfycbwKEO-Os1hQwq9yM2ejzLkHkRyFe2qEJG6kO0pmU9hO5wRkzXH5Inpum1TI4VFFg-xI/exec", function(events) {
            interface.events = events
            news.children[0].innerHTML = ""
            news.children[2].innerHTML = ""

            console.group("Interface events")

            for (var i = 0; i < events.length; i += 2) {
                interface.event(i)
            }

            console.groupEnd()

            resolve()
        }).catch(err => {
            console.error("Events fetch error:", err)

            reject(err)
        })
    })

    Promise.allSettled([repoPromise, alertsPromise, eventsPromise]).then(function(results) {
        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error("Promise " + (index + 1) + " failed:", result.reason)
            }
        })
        
        console.log("%cAll data loaded; Gramweb initialized. Version: [" + (interface.git ? interface.git.commits : "N/A") + "]", "color: green")

        if (interface.git) {
            version.children[1].innerHTML = "Version: [" + interface.git.commits + "; <span>" + 
                interface.git.recentCommit.commit.author.date.split(":")[0] + "</span>]\n" + 
                interface.git.recentCommit.commit.message
        }

        interface.randFocus()

        interface.load()
    })

    http.explore("grammyy.github.io")
    http.explore("grammyy.github.io", "packaging")

    render.canvases.main.addEventListener("mousemove", (mouse) => {
        if (mouse.buttons === 1) {
            interface.offset = {
                x: mouse.movementX + interface.offset.x,
                y: mouse.movementY + interface.offset.y
            }

            if (interface.focused) {
                interface.focused = null
            }
        }
    })

    solar.onclick = interface.click

    solar.onmouseenter = function() {
        document.addEventListener("wheel", interface.zoom)
    }

    solar.onmouseout = function() {
        document.removeEventListener("wheel", interface.zoom)
    }

    render.tick()
}

window.onresize = function(){
    render.aspectRatio()
}