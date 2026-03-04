interface.insert = async function(repo) {
    var images = repo.images

    if (images.length > 0) {
        // ↓ get random image ↓
        var image = await http.image(images[Math.randInt(0, images.length)].url)

        console.log(image)

        switch(image.width) {
        }
    } else {
        //insert view with no image
    }
}
