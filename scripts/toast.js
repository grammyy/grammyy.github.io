class toast {
    constructor(message, duration = 3000) {
        this.element = document.createElement("div")
        this.element.classList.add("toast")
        
        this.text = document.createElement("p")
        this.text.innerText = message
        this.element.appendChild(this.text)

        document.body.appendChild(this.element);
    
        (async () => {
            await new Promise(resolve => requestAnimationFrame(resolve))
            
            this.element.style.opacity = "100%"

            setTimeout(() => {
                this.flash()
                this.element.classList.add("expanded")

                // ↓ todo: probably refactor this later to be cleaner ↓
                this.element.addEventListener("transitionend", (e) => {
                    if (e.propertyName !== "width") return

                    if (this.text.scrollWidth > this.element.clientWidth) {
                        this.text.style.animation = "scroll 10s linear infinite"
                    }
                })
            }, 250)
        })()
   
        console.info(`${message} %c(Toast)`, "color: grey")

        setTimeout(() => {
            this.flash()
            this.destroy()
        }, duration)
    }

    flash(){
        this.element.classList.toggle("flash")
        
        setTimeout(() => this.element.classList.toggle("flash"), 250)
    }

    destroy() {
        if (this.element) {
            this.element.classList.remove("expanded")

            setTimeout(() => this.element.style.opacity = "0%", 500)

            setTimeout(() => {
                document.body.removeChild(this.element)
                
                this.element = null
            }, 1000)
        }
    }
}
