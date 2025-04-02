document.addEventListener("DOMContentLoaded", function () {
    // Canvas setup
    const canvas = document.getElementById('gradientCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set initial canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    // DOM elements
    const wordElement = document.getElementById("word");
    const phoneticElement = document.getElementById("phonetic");
    const meaningElement = document.getElementById("meaning");
    const newWordBtn = document.getElementById("newWordBtn");
    const speakBtn = document.getElementById("speakBtn");
    const toggleModeBtn = document.getElementById("toggleMode");

    // API endpoints
    //const DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
    //const TRANSLATE_API_URL = "https://api.mymemory.translated.net/get?q=";
	
	const GEMINI_API_KEY = "AIzaSyDJEVT_WNcSzu_PdWOcIVXMyJgXvddM6cw";
    //const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${AIzaSyDJEVT_WNcSzu_PdWOcIVXMyJgXvddM6cw}";
	const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/YOUR_CORRECT_MODEL_NAME:generateContent";
	//const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    // Gradient variables
    let isDarkMode = false;
    let direction = 1;
    let offset = 0;
    let colorTransitionProgress = 0;
    let isColorTransitioning = false;
    let colorTransitionTimer = 0;
    let paletteIndex = 0;
    const ripples = [];

    // Color palettes
    const colorPalettes = [
        [[10, 80, 50], [30, 90, 60]],    // Đỏ cam - Cam
        [[20, 90, 50], [50, 90, 60]],    // Đỏ đậm - Vàng cam
        [[340, 80, 50], [360, 90, 60]],  // Hồng - Đỏ
        [[180, 70, 50], [210, 80, 60]],  // Xanh lơ - Xanh dương
        [[200, 75, 55], [250, 70, 50]],  // Xanh dương nhạt - Tím
        [[240, 70, 50], [280, 75, 55]],   // Xanh lam - Tím
		[[120, 70, 40], [160, 70, 50]],  // Xanh lá đậm - Xanh lơ
		[[80, 70, 50], [140, 60, 50]],   // Xanh lá nhạt - Xanh rêu
		[[60, 80, 50], [100, 70, 50]],   // Vàng lá - Xanh lá
		[[10, 90, 60], [50, 90, 60]],    // Đỏ cam - Vàng cam
		[[30, 90, 50], [60, 80, 50]],    // Cam đậm - Vàng
		[[350, 80, 50], [20, 90, 60]],   // Hồng - Đỏ cam
		[[330, 60, 70], [360, 70, 75]],  // Hồng pastel - Đỏ pastel
		[[210, 50, 70], [240, 60, 75]],  // Xanh dương pastel - Tím pastel
		[[120, 50, 70], [150, 60, 75]],  // Xanh lá pastel - Xanh lơ pastel
		[[0, 100, 50], [30, 100, 50]],   // Đỏ rực - Cam rực
		[[240, 100, 50], [300, 100, 50]],// Xanh lam rực - Tím rực
		[[120, 100, 40], [180, 100, 50]] // Xanh lá rực - Xanh lơ rực
    ];
	
	// Hàm chọn màu ngẫu nhiên
	function getRandomPalette() {
		const index = Math.floor(Math.random() * colorPalettes.length);
		return colorPalettes[index];
	}
	
    // Initial colors
    let color1 = getRandomPalette()[0];
	let color2 = getRandomPalette()[1];
	let nextColor1 = getRandomPalette()[0];
	let nextColor2 = getRandomPalette()[1];

    // Color conversion function
    function hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return `rgb(${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))})`;
    }

    // Color interpolation function
    function interpolateColor(start, end, progress) {
        return [
            start[0] + (end[0] - start[0]) * progress,
            start[1] + (end[1] - start[1]) * progress,
            start[2] + (end[2] - start[2]) * progress
        ];
    }

    // Draw gradient function
    function drawGradient() {
        let currentColor1, currentColor2;

        if (isColorTransitioning) {
            currentColor1 = interpolateColor(color1, nextColor1, colorTransitionProgress);
            currentColor2 = interpolateColor(color2, nextColor2, colorTransitionProgress);
            colorTransitionProgress += 0.02;

            if (colorTransitionProgress >= 1) {
                color1 = nextColor1;
                color2 = nextColor2;
                isColorTransitioning = false;
                colorTransitionProgress = 0;
				
				// Chọn màu mới cho lần chuyển tiếp theo
                nextColor1 = getRandomPalette()[0];
                nextColor2 = getRandomPalette()[1];
            }
        } else {
            currentColor1 = color1;
            currentColor2 = color2;
        }

        const gradient = ctx.createLinearGradient(
            0, canvas.height * offset,
            canvas.width, canvas.height * (1 - offset)
        );

        gradient.addColorStop(0, hslToRgb(currentColor1[0], currentColor1[1], currentColor1[2]));
        gradient.addColorStop(1, hslToRgb(currentColor2[0], currentColor2[1], currentColor2[2]));

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Ripple effect functions
    function drawRipple(ripple) {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            ripple.x, ripple.y, 0,
            ripple.x, ripple.y, ripple.radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
		
		ctx.fillStyle = gradient;
		ctx.fill();
    }

    function updateRipples() {
        for (let i = ripples.length - 1; i >= 0; i--) {
            const ripple = ripples[i];
            ripple.radius += 5;
            ripple.opacity -= 0.05;
            if (ripple.opacity <= 0) {
                ripples.splice(i, 1);
            }
        }
    }

    // Animation function
    function animateGradient() {
        if (!isDarkMode) {
            colorTransitionTimer++;
            if (colorTransitionTimer >= 600) {
                colorTransitionTimer = 0;
                isColorTransitioning = true;
                //paletteIndex = (paletteIndex + 1) % colorPalettes.length;
                //nextColor1 = colorPalettes[paletteIndex][0];
                //nextColor2 = colorPalettes[paletteIndex][1];
            }

            offset += direction * 0.001;
            if (offset >= 1 || offset <= 0) {
                direction *= -1;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGradient();
            ripples.forEach(drawRipple);
            updateRipples();
        }
        requestAnimationFrame(animateGradient);
    }

    // Event listeners
    canvas.addEventListener('mousemove', (event) => {
        if (!isDarkMode) {
            ripples.push({
                x: event.clientX,
                y: event.clientY,
                radius: 10,
                opacity: 1
            });
        }
    });

    window.addEventListener("resize", resizeCanvas);

    toggleModeBtn.addEventListener("click", () => {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
            toggleModeBtn.textContent = "🌈 Gradient Mode";
            canvas.style.opacity = "0";
			setTimeout(() => {
				canvas.style.display = "none";
			}, 500);
        } else {
            document.body.classList.remove("dark-mode");
            toggleModeBtn.textContent = "🌙 Dark Mode";
			canvas.style.display = "block";
            setTimeout(() => {
				canvas.style.opacity = "1";
			}, 50);
        }
    });
	
	async function fetchWordFromGemini(word) {
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
					contents: [{
						parts: [{
							text: `Define the English word '${word}', provide its phonetic transcription and an example sentence. Return the response in the format:\nWord: ${word}\nPhonetic: [phonetic transcription]\nDefinition: [clear definition]\nExample: [example sentence]`
						}]
					}]
				})
            });

            const data = await response.json();
             if (data.error) {
            console.error("Gemini API Error:", data.error);
            meaningElement.textContent = "Lỗi khi lấy dữ liệu.";
            return;
			}

			const responseText = data.candidates[0].content.parts[0].text;
			const lines = responseText.split('\n');
        
			wordElement.textContent = word;
			phoneticElement.textContent = lines.find(line => line.startsWith('Phonetic:'))?.replace('Phonetic:', '').trim() || "Không có phiên âm";
			meaningElement.textContent = lines.find(line => line.startsWith('Definition:'))?.replace('Definition:', '').trim() || "Không tìm thấy nghĩa.";
		} catch (error) {
			console.error("Lỗi khi lấy dữ liệu từ Gemini:", error);
			meaningElement.textContent = "Lỗi khi lấy dữ liệu.";
		}
    }

    async function fetchRandomWord() {
        try {
            const response = await fetch("https://random-word-api.herokuapp.com/word");
            if (!response.ok) throw new Error("Không thể lấy từ ngẫu nhiên.");
            const wordData = await response.json();
            const randomWord = wordData[0];
            fetchWordFromGemini(randomWord);
        } catch (error) {
            console.error("Lỗi khi lấy từ vựng:", error);
        }
    }

    function speakWord() {
        const word = wordElement.textContent;
        if (!word || word === "Loading..." || word === "Lỗi!") return;

        //const utterance = new SpeechSynthesisUtterance(word);
        //utterance.lang = 'en-US';
        //speechSynthesis.speak(utterance);
		
		const audio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(word)}`);
        audio.play();
    }

    // Event listeners for word functions
    newWordBtn.addEventListener("click", fetchRandomWord);
    speakBtn.addEventListener("click", speakWord);

    // Initialize
    animateGradient();
    fetchRandomWord();
});