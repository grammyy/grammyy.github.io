window.addEventListener("load", (e) => {
    console.info("%cPreloading Gramweb...", "color: grey") //maybe add more info about networking n stuff
})

window.onresize = function(){
    render.aspectRatio()
}