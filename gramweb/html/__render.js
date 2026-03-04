var render = {
    canvas: document.getElementById("context"),
    context: document.getElementById("context").getContext("2d"),
    arcPath: new Path2D("M0-440.625C-117.5-117.5-117.5 117.5 0 440.625L58.75 440.625C-58.75 117.5-58.75-117.5 58.75-440.625L0-440.625"),
    slidePath: new Path2D("M50.375-495.625C-95.125-117.5-95.125 117.5 50.375 495.625"),
    menuPath: new Path2D("M0-470C-132.1875-117.5-132.1875 117.5 0 470L470 470 470-470 0-470"),
    borderPath: new Path2D("M763.224-470.4 792.624-470.4 792.624-441M792.624 441 792.624 470.4 763.224 470.4M-638.224 470.4-667.624 470.4-667.624 441M-667.624-441-667.624-470.4-638.224-470.4M-638.224-470.4Z"),
    scale: [],

    // ↑ variables ↑ //

    withinArc:function(pos, x, y) {
        var y = ((interface.mouse.y / render.scale.y) + 18) / 18
        var x = (interface.mouse.x / render.scale.x) - (pos + 960) 

        var efficient = 0.155 * Math.pow(y - 28.5, 2) - 0.00001 * Math.pow(y - 28.5, 4)

        return (efficient - 85 < x && x < efficient - 30)
    },

    aspectRatio:function() {
        render.scale = {
            x: window.innerWidth / 1920,
            y: window.innerHeight / 992
        }

        render.middle = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        }

        render.canvas.width = window.innerWidth
        render.canvas.height = window.innerHeight
    },

    arc:function(x, y) {
        render.context.scale(render.scale.x, render.scale.y)
        render.context.translate(x / render.scale.x, y / render.scale.y)
        
        render.context.fillStyle = "#181818"
        render.context.strokeStyle = "#626263"
        render.context.fill(render.arcPath)
        render.context.stroke(render.arcPath)
        // ↑ dial rendering ↑
        
        render.context.strokeStyle = "#343434"
        render.context.stroke(render.slidePath)
        // ↑ dial path ↑
        
        render.context.resetTransform()
    },
    
    tick:function() {
        render.context.reset()

        render.context.strokeStyle = "#111111"
        
        for (var i = 1; i < 6; i++) {
            render.context.lineWidth = 3
            render.context.translate((render.middle.x + 390 * render.scale.x) - (140 * i * render.scale.x), render.middle.y)
            render.context.scale(render.scale.x, render.scale.y)
            render.context.stroke(render.slidePath)
            render.context.resetTransform()
        }

        render.context.scale(render.scale.x, render.scale.y)
        render.context.rect(430, 26, 1460, 940)
        render.context.resetTransform()
        // ↑ misc & background ↑

        //if (interface.ready) {
        //    var transition = (current, target, speed) => current + (target - current) * speed
        //
        //    interface.d1 = transition(interface.d1, 125, 0.03)
        //    interface.d2 = transition(interface.d2, -25, 0.03)
        //    interface.d3 = transition(interface.d3, -340, 0.03)
        //}
        
        render.context.strokeStyle = "#161616"
        render.context.scale(render.scale.x, render.scale.y)
        render.context.translate((render.middle.x + 460 * render.scale.x) / render.scale.x, (render.middle.y) / render.scale.y)
        render.context.stroke()
        render.context.resetTransform()
        // ↑ border outline ↑

        render.arc(render.middle.x + interface.d1 * render.scale.x, render.middle.y)
        render.arc(render.middle.x + interface.d2 * render.scale.x, render.middle.y)
        render.arc(render.middle.x + interface.d3 * render.scale.x, render.middle.y)
        // ↑ arc dials excluding the menu attached dial ↑ 

        render.context.strokeStyle = "#343434"
        render.context.scale(render.scale.x, render.scale.y)
        render.context.translate((render.middle.x + 460 * render.scale.x) / render.scale.x, (render.middle.y) / render.scale.y)
        render.context.fill(render.menuPath)
        render.context.stroke(render.menuPath)
        render.context.resetTransform()
        // ↑ right menu ↑
        
        render.context.strokeStyle = "white"
        render.context.lineWidth = 3
        render.context.scale(render.scale.x, render.scale.y)
        render.context.translate((render.middle.x + 138 * render.scale.x) / render.scale.x, (render.middle.y) / render.scale.y)
        render.context.stroke(render.borderPath) //todo: make lengths smaller later
        render.context.resetTransform()
        // ↑ border ↑

        render.arc(render.middle.x + 390 * render.scale.x, render.middle.y)
        // ↑ menu attached dial ↑

        window.requestAnimationFrame(render.tick)
    }
}

window.countFPS = (function () {
  var lastLoop = (new Date()).getMilliseconds();
  var count = 1;
  var fps = 0;

  return function () {
    var currentLoop = (new Date()).getMilliseconds();
    if (lastLoop > currentLoop) {
      fps = count;
      count = 1;
    } else {
      count += 1;
    }
    lastLoop = currentLoop;
    return fps;
  };
}());

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

        //interface.load()

        setTimeout(() => {
            loading.style.opacity = "0%"
            
            interface.ready = true
        }, 2000)

        new toast("Welcome back @Grammy!")
    })

    render.canvas.addEventListener("mousemove", (mouse) => {
        interface.mouse = mouse
    })

    render.canvas.onmousedown = interface.onmousedown
    render.canvas.onmouseup = interface.onmouseup

    render.canvas.onmouseenter = function() {
        document.addEventListener("wheel", interface.zoom)

        interface.hover = true
    }

    render.canvas.onmouseout = function() {
        document.removeEventListener("wheel", interface.zoom)

        interface.hover = false
    }

    render.tick()
}

window.onresize = function(){
    render.aspectRatio()
}