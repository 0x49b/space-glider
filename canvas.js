const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight
let bombCount = 0

const scoreEl = document.getElementById("score")
const startGameBtn = document.getElementById("startGameBtn")
const modalEl = document.getElementById("modalEl")
const bigScoreEl = document.getElementById("bigScoreEl")
const bombsEl = document.getElementById("bombsEl")

const center = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

const colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66']

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX
    mouse.y = event.clientY
})

addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init()
})


class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity, speedModifier) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.speedModifier = speedModifier
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 1.0)`
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x * this.speedModifier
        this.y = this.y + this.velocity.y * this.speedModifier
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity, speedModifier) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.speedModifier = speedModifier
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x * this.speedModifier
        this.y = this.y + this.velocity.y * this.speedModifier
    }
}

const friction = 0.97
class Particle {
    constructor(x, y, radius, color, velocity, speedModifier) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.speedModifier = speedModifier
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x * this.speedModifier
        this.y = this.y + this.velocity.y * this.speedModifier
        this.alpha -= 0.01
    }
}

class Bomb {
    constructor(x, y, radius, color, velocity, speedModifier) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.speedModifier = speedModifier
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.strokeStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},1)`
        c.stroke()
        c.closePath()
        c.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.radius += 10
        this.x = player.x + this.velocity.x * this.speedModifier
        this.y = player.y + this.velocity.y * this.speedModifier
        this.alpha -= 0.01
    }
}

// Implementation
let player = new Player(center.x, center.y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []
let bombs = []
let enemyInterval
let shootingClickEvent

function init() {
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
    clearInterval(enemyInterval)

    bombCount = 10
    bombsEl.innerHTML = bombCount

    player = new Player(center.x, center.y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    bombs = []
}

function shootProjectile() {
    const angle = Math.atan2(
        event.clientY - center.y,
        event.clientX - center.x
    )
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
    projectiles.push(
        new Projectile(
            center.x,
            center.y,
            5, { r: 255, g: 215, b: 20 },
            velocity,
            10
        )
    )
}

function spawnEnemies() {
    enemyInterval = setInterval(() => {
        const radius = Math.random() * (30 - 10) + 10
        let x, y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(
            center.y - y,
            center.x - x
        )
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(
            new Enemy(x, y, radius, color, velocity, (Math.random() * (3 - 1) + 1))
        )
    }, 900)
}

// Spawn a bomb
function spawnBomb() {
    if (bombCount != 0) {
        bombCount--
        bombsEl.innerHTML = bombCount

        const angle = Math.atan2(
            event.clientY - center.y,
            event.clientX - center.x
        )
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        bombs.push(
            new Bomb(
                center.x,
                center.y,
                5, { r: 255, g: 0, b: 0 },
                velocity,
                10
            )
        )

    }
}

// Animation Loop
let animationId
let score = 0;

function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.2)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()

    bombs.forEach((bomb, bombIndex) => {
        if (bomb.alpha <= 0) {
            setTimeout(() => { bombs.splice(bombIndex, 1) }, 0)
        } else {
            bomb.update()
        }
    })

    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            setTimeout(() => { particles.splice(index, 1) }, 0)
        } else {
            particle.update()
        }

    })

    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update()
        const radius = projectile.radius
        if (projectile.x + radius < 0 ||
            projectile.x - radius > canvas.width ||
            projectile.y + radius < 0 ||
            projectile.y - radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 0) {
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'block'
            bigScoreEl.innerHTML = score
        }

        bombs.forEach((bomb, bombIndex) => {

            const dist = Math.hypot(bomb.x - enemy.x, bomb.y - enemy.y)

            if (
                bomb.radius > canvas.width - 200 &&
                bomb.radius > canvas.height - 200) {
                console.log("remove bomb")
                setTimeout(() => {
                    bombs.splice(bombIndex, 1)
                }, 0)
            }

            if (dist - enemy.radius - bomb.radius < 0) {
                score += 100
                scoreEl.innerHTML = score
                gsap.to(enemy, {
                    radius: 0
                })

                enemies.splice(enemyIndex, 1)

                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(
                        enemy.x,
                        enemy.y,
                        Math.random() * 2,
                        enemy.color, {
                            x: Math.random() - 0.5,
                            y: Math.random() - 0.5
                        },
                        5
                    ))
                }
            }


        })


        projectiles.forEach((projectile, pprojectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if (dist - enemy.radius - projectile.radius < 1) {

                score += 100
                scoreEl.innerHTML = score


                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(
                        projectile.x,
                        projectile.y,
                        Math.random() * 2,
                        enemy.color, {
                            x: Math.random() - 0.5,
                            y: Math.random() - 0.5
                        },
                        5
                    ))
                }

                if (enemy.radius - 10 > 10) {
                    score += 100
                    scoreEl.innerHTML = score
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })

                    setTimeout(() => {
                        projectiles.splice(pprojectileIndex, 1)
                    }, 0)
                } else {
                    score += 250
                    scoreEl.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1)
                        projectiles.splice(pprojectileIndex, 1)
                    }, 0)
                }


            }
        })
    })
}



addEventListener('click', (event) => {
    shootProjectile()
})


addEventListener('contextmenu', (event) => {

    event.preventDefault();

    const angle = Math.atan2(
        event.clientY - center.y,
        event.clientX - center.x
    )
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }

    spawnBomb()

})

startGameBtn.addEventListener('click', (event) => {
    init()
    player.draw()
    animate()
    spawnEnemies()
    modalEl.style.display = 'none'
})