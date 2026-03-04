var cookieUtils = {
    encodeBase64: function(value) {
        var bytes = new TextEncoder().encode(value)
        var str = btoa(String.fromCharCode(...bytes))
        // ↑ encodes to utf-8 bytes then to base64 ↑

        return str
    },
    decodeBase64: function(value) {
        var str = atob(value)
        var array = Uint8Array.from(str, char => char.charCodeAt(0))
        var decode = new TextDecoder().decode(array)
        // ↑ decodes base64 to binary, converts to array, and decodes utf 8 bytes to string ↑

        return decode
    }
}

var cookieManager = {
    setCookie: function(name, value, days) {
        return new Promise(function(resolve, reject) {
            try {
                var encode = cookieUtils.encodeBase64(value)
                var date = new Date()

                date.setTime(date.getTime() + (days || 7) * 24 * 60 * 60 * 1000)
                var expires = "; expires=" + date.toUTCString()
                
                document.cookie = name + "=" + encode + expires + "; path=/"

                resolve("Cookie " + name + " set successfully")
            } catch (error) {
                reject("Failed to set cookie " + name + ": " + error)
            }
        })
    },

    getCookie: function(name) {
        return new Promise(function(resolve, reject) {
            try {
                var nameEQ = name + "="
                var cookiesArray = document.cookie.split(';')
                
                for (var i = 0; i < cookiesArray.length; i++) {
                    var cookie = cookiesArray[i].trim()

                    if (cookie.indexOf(nameEQ) === 0) {
                        var decodedValue = cookieUtils.decodeBase64(cookie.substring(nameEQ.length))
                        
                        resolve(decodedValue)
                        
                        return
                    }
                }

                resolve(null)
                // ↑ returns none on error ↑
            } catch (error) {
                reject("Failed to get cookie " + name + ": " + error)
            }
        })
    },

    deleteCookie: function(name) {
        return new Promise(function(resolve, reject) {
            try {
                document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
                
                resolve("Cookie " + name + " deleted successfully")
            } catch (error) {
                reject("Failed to delete cookie " + name + ": " + error)
            }
        })
    }
}

// Usage examples:

/*
cookieManager.setCookie('username', 'ExampleUser', 7)
    .then(function(message) { console.log(message) })
    .catch(function(error) { console.error(error) })

// Getting a cookie
cookieManager.getCookie('username')
    .then(function(value) {
        if (value) {
            console.log('Retrieved cookie value:', value)
        } else {
            console.log('Cookie not found')
        }
    })
    .catch(function(error) { console.error(error) })

// Deleting a cookie
cookieManager.deleteCookie('username')
    .then(function(message) { console.log(message) })
    .catch(function(error) { console.error(error) })
*/