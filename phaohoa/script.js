const fireworksCanvas = document.getElementById('fireworksCanvas');
const ctx = fireworksCanvas.getContext('2d');

let fireworks = [];
let particles = [];
let autoLaunchInterval;

// Thiết lập kích thước canvas
function resizeCanvas() {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Lớp Firework
class Firework {
    constructor(x, y, settings) {
        this.x = x;
        this.y = fireworksCanvas.height;
        this.targetY = y;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.settings = settings;
        this.currentExplosion = 0;
        this.speed = 3;
    }

    update() {
        if (this.y > this.targetY) {
            this.y -= this.speed;
        } else {
            this.explode();
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    explode() {
        const { density, particleSize, shape, explosions, explosionInterval, explosionDirection } = this.settings;

        for (let i = 0; i < density; i++) {
            let angle;
            switch (explosionDirection) {
                case 'up':
                    angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 4;
                    break;
                case 'right':
                    angle = 0 + (Math.random() - 0.5) * Math.PI / 4;
                    break;
                case 'left':
                    angle = Math.PI + (Math.random() - 0.5) * Math.PI / 4;
                    break;
                case 'upRight':
                    angle = -Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 4;
                    break;
                case 'upLeft':
                    angle = -3 * Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 4;
                    break;
                case 'center':
                default:
                    angle = Math.random() * Math.PI * 2;
            }
            const speed = 2 + Math.random() * 2;
            particles.push(new Particle(
                this.x,
                this.y,
                particleSize,
                this.color,
                shape,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                this.settings
            ));
        }

        this.currentExplosion++;
        if (this.currentExplosion < explosions) {
            setTimeout(() => this.explode(), explosionInterval);
        } else {
            fireworks = fireworks.filter(fw => fw !== this);
        }
    }
}

// Lớp Particle
class Particle {
    constructor(x, y, size, color, shape, speedX, speedY, settings) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.shape = shape;
        this.speedX = speedX;
        this.speedY = speedY;
        this.settings = settings;
        this.gravity = 0.1;
        this.life = 100;
        this.opacity = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.settings.gravity) {
            this.speedY += this.gravity;
        }

        this.life--;
        this.opacity = this.life / 100;

        if (this.settings.multiColor) {
            this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        }
    }

    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = `${this.size * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.shape, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

// Hàm animation chính
function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    fireworks.forEach(firework => {
        firework.update();
        firework.draw();
    });

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}

animate();

// Hàm để lấy cài đặt hiện tại hoặc ngẫu nhiên
function getSettings(random = false) {
    const defaultShape = document.getElementById('fireworkShape').value || '●';
    const useRandomDirection = document.getElementById('randomDirection').checked;
    if (random) {
        return {
            density: Math.floor(Math.random() * 91) + 10,
            particleSize: Math.floor(Math.random() * 50) + 1,
            shape: defaultShape,
            explosions: Math.floor(Math.random() * 10) + 1,
            explosionInterval: Math.floor(Math.random() * 901) + 100,
            gravity: Math.random() < 0.5,
            multiColor: Math.random() < 0.5,
            explosionDirection: useRandomDirection ? ['center', 'up', 'right', 'left', 'upRight', 'upLeft'][Math.floor(Math.random() * 6)] : document.getElementById('explosionDirection').value
        };
    } else {
        return {
            density: parseInt(document.getElementById('density').value),
            particleSize: parseInt(document.getElementById('particleSize').value),
            shape: defaultShape,
            explosions: parseInt(document.getElementById('explosions').value),
            explosionInterval: parseInt(document.getElementById('explosionInterval').value),
            gravity: document.getElementById('gravity').checked,
            multiColor: document.getElementById('multiColor').checked,
            explosionDirection: useRandomDirection ? ['center', 'up', 'right', 'left', 'upRight', 'upLeft'][Math.floor(Math.random() * 6)] : document.getElementById('explosionDirection').value
        };
    }
}

// Hàm để bắn pháo hoa
function launchFirework(x, y, settings) {
    fireworks.push(new Firework(x, y, settings));
}

// Xử lý sự kiện cho các điều khiển
document.getElementById('toggleMode').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Thêm sự kiện click để tạo pháo hoa
fireworksCanvas.addEventListener('click', (e) => {
    const rect = fireworksCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const settings = getSettings(document.getElementById('randomSettings').checked);
    launchFirework(x, y, settings);
});

// Thêm sự kiện touch cho thiết bị di động
fireworksCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = fireworksCanvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    const settings = getSettings(document.getElementById('randomSettings').checked);
    launchFirework(x, y, settings);
});

// Xử lý nút mở rộng/thu gọn điều khiển
document.getElementById('toggleControls').addEventListener('click', () => {
    document.getElementById('controls').classList.toggle('expanded');
});

// Xử lý auto launch
document.getElementById('autoLaunch').addEventListener('change', (e) => {
    if (e.target.checked) {
        const interval = parseInt(document.getElementById('autoLaunchInterval').value);
        autoLaunchInterval = setInterval(() => {
            const x = Math.random() * fireworksCanvas.width;
            const y = Math.random() * (fireworksCanvas.height / 2);
            const settings = getSettings(document.getElementById('randomSettings').checked);
            launchFirework(x, y, settings);
        }, interval);
    } else {
        clearInterval(autoLaunchInterval);
    }
});

// Cập nhật interval khi thay đổi
document.getElementById('autoLaunchInterval').addEventListener('change', (e) => {
    if (document.getElementById('autoLaunch').checked) {
        clearInterval(autoLaunchInterval);
        autoLaunchInterval = setInterval(() => {
            const x = Math.random() * fireworksCanvas.width;
            const y = Math.random() * (fireworksCanvas.height / 2);
            const settings = getSettings(document.getElementById('randomSettings').checked);
            launchFirework(x, y, settings);
        }, parseInt(e.target.value));
    }
});