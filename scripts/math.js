Math.rotate = function(angle, cx, cy, x, y) {
    let x2 = Math.cos(angle) * (x - cx) - Math.sin(angle) * (y - cy) + cx
    let y2 = Math.sin(angle) * (x - cx) + Math.cos(angle) * (y - cy) + cy

    return [x2, y2]
}

Math.randInt = function(min, max) {
    const ceil = Math.ceil(min)
    const floor = Math.floor(max)

    return Math.floor(Math.random() * (floor - ceil) + ceil)
}

Math.randFloat = function(min, max) {
    return Math.random() * (max - min) + min
}
  
Math.norm = function(value) {
    return value >= 0 ? 1 : -1
}

Math.clamp = function(max, min, value) {
    return Math.min(Math.max(value, min), max)
}

Math.lerp = function(start, end, t) {
    return start + (end - start) * t
}

Math.normVec = function(x, y) {
    var length = Math.sqrt(x*x+y*y)

    return {
        x: x/length, 
        y: y/length 
    } 
}