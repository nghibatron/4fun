const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const characters = [];
const images = [];
const themes = {
    light: '#ffffff',
    dark: '#000000'
};
let randomSize = false;
let randomMode = false;
let randomInterval = 1000;
let disappearTime = 5000;
let trailIntensity = 10;
let randomIntervalId;
let imageAddIntervalId;
let imageAddInterval = 1000;
let lastTimestamp = 0;
let isHidden = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

function addCharacter(char, x, y, dx, dy, color, randomize = false) {
    const size = randomSize ? Math.random() * 70 + 10 : 30;
    const character = {
        type: 'character',
        char: char,
        size: size,
        x: x,
        y: y,
        dx: dx,
        dy: dy,
        color: color,
        lifeTime: disappearTime
    };
    characters.push(character);

    if (randomize) {
        setTimeout(() => {
            const index = characters.indexOf(character);
            if (index > -1) characters.splice(index, 1);
        }, disappearTime);
    }
}

function addImage(url, x, y, dx, dy, randomize = false) {
    const size = randomSize ? Math.random() * 70 + 10 : 30;
    const image = new Image();
    image.src = url;
    const imageObject = {
        type: 'image',
        image: image,
        size: size,
        x: x,
        y: y,
        dx: dx,
        dy: dy,
        lifeTime: disappearTime
    };
    images.push(imageObject);

    if (randomize) {
        setTimeout(() => {
            const index = images.indexOf(imageObject);
            if (index > -1) images.splice(index, 1);
        }, disappearTime);
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function drawElements() {
    ctx.fillStyle = `rgba(0, 0, 0, ${trailIntensity / 100})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    [...characters, ...images].forEach((element, index, array) => {
        if (element.type === 'character') {
            ctx.fillStyle = element.color;
            ctx.font = `${element.size}px Arial`;
            ctx.fillText(element.char, element.x, element.y);
        } else if (element.type === 'image') {
            ctx.drawImage(element.image, element.x, element.y, element.size, element.size);
        }

        element.x += element.dx;
        element.y += element.dy;

        if (element.x + element.size > canvas.width || element.x < 0) {
            element.dx = -element.dx;
        }
        if (element.y + element.size > canvas.height || element.y < 0) {
            element.dy = -element.dy;
        }

        // Handle collisions
        for (let i = index + 1; i < array.length; i++) {
            const other = array[i];
            if (Math.hypot(element.x - other.x, element.y - other.y) < (element.size + other.size) / 2) {
                // Simple collision response
                const tempDx = element.dx;
                const tempDy = element.dy;
                element.dx = other.dx;
                element.dy = other.dy;
                other.dx = tempDx;
                other.dy = tempDy;
            }
        }

        element.lifeTime -= 16;
        if (element.lifeTime <= 0) {
            const elemIndex = element.type === 'character' ? characters.indexOf(element) : images.indexOf(element);
            if (elemIndex > -1) (element.type === 'character' ? characters : images).splice(elemIndex, 1);
        }
    });
}

function animate(timestamp) {
    if (!isHidden) {
        if (lastTimestamp === 0) lastTimestamp = timestamp;
        const deltaTime = timestamp - lastTimestamp;
        drawElements();
        requestAnimationFrame(animate);
        lastTimestamp = timestamp;
    } else {
        requestAnimationFrame(animate);
    }
}

animate(0);

function resetCharacters() {
    characters.length = 0;
    images.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function toggleRandomSize() {
    randomSize = !randomSize;
    document.getElementById('randomSizeButton').classList.toggle('active', randomSize);
}

function toggleRandomMode() {
    randomMode = !randomMode;
    document.getElementById('randomModeButton').classList.toggle('active', randomMode);
    if (randomMode) {
        randomIntervalId = setInterval(() => {
            const char = String.fromCodePoint(Math.floor(Math.random() * (0x1F600 - 0x1F300)) + 0x1F300);
            const color = getRandomColor();
            addCharacter(char, Math.random() * canvas.width, Math.random() * canvas.height, (Math.random() - 0.5) * 40 - 10, (Math.random() - 0.5) * 40 - 10, color, true);
        }, randomInterval);
    } else {
        clearInterval(randomIntervalId);
    }
}

function addInputCharacters() {
    const textInput = document.getElementById('textInput').value;
    if (textInput) {
        const color = getRandomColor();
        const dx = (Math.random() - 0.5) * 40 - 10;
        const dy = (Math.random() - 0.5) * 40 - 10;
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        for (const char of textInput) {
            addCharacter(char, x, y, dx, dy, color);
            x += 30; // Adjust as needed to space out characters in the group
        }
    }
}

function addImageUrlInput() {
    const container = document.getElementById('imageInputsContainer');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Nhập URL Ảnh';
    const button = document.createElement('button');
    button.textContent = 'Thêm';
    button.onclick = () => addImageFromInput(input);
    container.appendChild(input);
    container.appendChild(button);
}

function addImageFromInput(input) {
    const url = input.value;
    if (url) {
        const dx = (Math.random() - 0.5) * 40 - 10;
        const dy = (Math.random() - 0.5) * 40 - 10;
        addImage(url, Math.random() * canvas.width, Math.random() * canvas.height, dx, dy, true);
    }
}

document.getElementById('randomInterval').addEventListener('change', (event) => {
    randomInterval = event.target.value;
    if (randomMode) {
        clearInterval(randomIntervalId);
        randomIntervalId = setInterval(() => {
            const char = String.fromCodePoint(Math.floor(Math.random() * (0x1F600 - 0x1F300)) + 0x1F300);
            const color = getRandomColor();
            addCharacter(char, Math.random() * canvas.width, Math.random() * canvas.height, (Math.random() - 0.5) * 40 - 10, (Math.random() - 0.5) * 40 - 10, color, true);
        }, randomInterval);
    }
});

document.getElementById('disappearTime').addEventListener('change', (event) => {
    disappearTime = event.target.value;
});

document.getElementById('trailIntensity').addEventListener('input', (event) => {
    trailIntensity = event.target.value;
});

document.getElementById('imageAddInterval').addEventListener('change', (event) => {
    imageAddInterval = event.target.value;
    clearInterval(imageAddIntervalId);
    imageAddIntervalId = setInterval(() => {
        const inputs = document.querySelectorAll('#imageInputsContainer input');
        inputs.forEach(input => addImageFromInput(input));
    }, imageAddInterval);
});

function changeTheme() {
    const themeSelector = document.getElementById('themeSelector');
    const selectedTheme = themeSelector.value;
    if (selectedTheme === 'system') {
        const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.style.setProperty('--background-color', systemDarkMode ? themes.dark : themes.light);
    } else {
        document.body.style.setProperty('--background-color', themes[selectedTheme]);
    }
}

window.matchMedia('(prefers-color-scheme: dark)').addListener(e => {
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector.value === 'system') {
        document.body.style.setProperty('--background-color', e.matches ? themes.dark : themes.light);
    }
});

function toggleControls() {
    const controls = document.getElementById('controls');
    if (controls.classList.contains('collapsed')) {
        controls.classList.remove('collapsed');
        controls.classList.add('expanded');
    } else {
        controls.classList.remove('expanded');
        controls.classList.add('collapsed');
    }
}

document.addEventListener('keydown', (event) => {
    addCharacter(event.key, Math.random() * canvas.width, Math.random() * canvas.height, (Math.random() - 0.5) * 40 - 10, (Math.random() - 0.5) * 40 - 10, getRandomColor());
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isHidden = true;
    } else {
        isHidden = false;
        lastTimestamp = 0; // Reset the timestamp to avoid large deltaTime values
    }
});

changeTheme();
