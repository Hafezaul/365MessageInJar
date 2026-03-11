let currentCategory = '';
let currentIndex = 0;
let messages = [];
let shuffledIndices = [];
let shufflePosition = 0;

const categoryConfig = {
    motivasi: {
        icon: '💪',
        title: 'Motivasi',
        file: 'data/motivasi.json',
        color: 'yellow'
    },
    cinta: {
        icon: '💖',
        title: 'Ucapan Cinta',
        file: 'data/cinta.json',
        color: 'red'
    },
    nasihat: {
        icon: '🧠',
        title: 'Nasihat & Refleksi',
        file: 'data/nasihat.json',
        color: 'blue'
    },
    doa: {
        icon: '🙏',
        title: 'Doa & Harapan',
        file: 'data/doa.json',
        color: 'green'
    }
};

// Fisher-Yates shuffle to generate a full random sequence without repetition
function generateShuffledIndices(length) {
    const indices = Array.from({ length }, (_, i) => i);
    for (let i = length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
}

async function openCategory(category) {
    currentCategory = category;

    try {
        const response = await fetch(categoryConfig[category].file);
        const data = await response.json();
        messages = data.messages;

        // Generate a new shuffle sequence for this category
        shuffledIndices = generateShuffledIndices(messages.length);
        shufflePosition = 0;
        currentIndex = shuffledIndices[0];

        document.getElementById('welcomePage').classList.add('hidden');
        document.getElementById('messagePage').classList.remove('hidden');

        document.getElementById('categoryIcon').textContent = categoryConfig[category].icon;
        document.getElementById('categoryTitle').textContent = categoryConfig[category].title;

        displayMessage();
    } catch (error) {
        console.error('Error loading messages:', error);
        alert('Gagal memuat pesan. Pastikan file JSON tersedia.');
    }
}

function displayMessage() {
    if (messages.length > 0) {
        document.getElementById('messageText').textContent = messages[currentIndex];
        // Show position in the shuffle cycle (optional: day number)
        document.getElementById('dayNumber').textContent = shufflePosition + 1;
    }
}

function nextMessage() {
    shufflePosition++;

    // If we've gone through all messages, generate a new shuffle (won't repeat last message)
    if (shufflePosition >= shuffledIndices.length) {
        const lastIndex = currentIndex;
        shuffledIndices = generateShuffledIndices(messages.length);

        // Make sure the first message of the new shuffle isn't the same as the last one
        const firstPos = shuffledIndices.indexOf(lastIndex);
        if (firstPos !== -1 && shuffledIndices[0] === lastIndex) {
            // Swap the first element with a random other element
            const swapWith = Math.floor(Math.random() * (shuffledIndices.length - 1)) + 1;
            [shuffledIndices[0], shuffledIndices[swapWith]] = [shuffledIndices[swapWith], shuffledIndices[0]];
        }
        shufflePosition = 0;
    }

    currentIndex = shuffledIndices[shufflePosition];
    displayMessage();
}

function previousMessage() {
    if (shufflePosition > 0) {
        shufflePosition--;
        currentIndex = shuffledIndices[shufflePosition];
    }
    // If at the beginning, stay at position 0 (no wrap-back to avoid confusion)
    displayMessage();
}

function randomMessage() {
    // Pick a random position in the shuffle that is NOT the current position
    let newPosition;
    do {
        newPosition = Math.floor(Math.random() * shuffledIndices.length);
    } while (newPosition === shufflePosition && shuffledIndices.length > 1);

    shufflePosition = newPosition;
    currentIndex = shuffledIndices[shufflePosition];
    displayMessage();
}

function backToHome() {
    document.getElementById('messagePage').classList.add('hidden');
    document.getElementById('welcomePage').classList.remove('hidden');
    currentCategory = '';
    currentIndex = 0;
    messages = [];
    shuffledIndices = [];
    shufflePosition = 0;
}

// Share Functions
let generatedImageBlob = null;

function openSharePopup() {
    document.getElementById('sharePopup').classList.remove('hidden');
    document.getElementById('sharePreview').style.display = 'none';
    document.getElementById('shareButtons').classList.add('hidden');
    document.getElementById('generateBtn').classList.remove('hidden');
}

function closeSharePopup() {
    document.getElementById('sharePopup').classList.add('hidden');
    generatedImageBlob = null;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
            lines.push(line);
            line = words[i] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    lines.forEach((line, index) => {
        ctx.fillText(line, x, y + (index * lineHeight));
    });

    return lines.length * lineHeight;
}

function generateImage() {
    const canvas = document.getElementById('hiddenCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (Instagram square format)
    canvas.width = 1080;
    canvas.height = 1080;

    const config = categoryConfig[currentCategory];
    const message = messages[currentIndex];

    // Color schemes
    const gradients = {
        yellow: ['#FDE047', '#FACC15'],
        red: ['#FCA5A5', '#F87171'],
        blue: ['#93C5FD', '#60A5FA'],
        green: ['#86EFAC', '#4ADE80']
    };

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, gradients[config.color][0]);
    gradient.addColorStop(1, gradients[config.color][1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(200, 200, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(880, 880, 250, 0, Math.PI * 2);
    ctx.fill();

    // White card background
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    const cardPadding = 80;
    const cardRadius = 40;
    ctx.beginPath();
    ctx.roundRect(cardPadding, cardPadding, canvas.width - cardPadding * 2, canvas.height - cardPadding * 2, cardRadius);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Category icon
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(config.icon, canvas.width / 2, 250);

    // Category title
    ctx.font = 'bold 60px Quicksand, sans-serif';
    ctx.fillStyle = '#9333EA';
    ctx.fillText(config.title, canvas.width / 2, 350);

    // Message text
    ctx.font = '48px Quicksand, sans-serif';
    ctx.fillStyle = '#1F2937';
    const maxWidth = canvas.width - 240;
    const lineHeight = 70;
    wrapText(ctx, message, canvas.width / 2, 480, maxWidth, lineHeight);

    // Footer
    ctx.font = 'bold 36px Quicksand, sans-serif';
    ctx.fillStyle = '#9333EA';
    ctx.fillText('365 Messages in Jar 🫙', canvas.width / 2, canvas.height - 120);

    // Convert to blob and show preview
    canvas.toBlob((blob) => {
        generatedImageBlob = blob;
        const url = URL.createObjectURL(blob);
        const preview = document.getElementById('sharePreview');
        preview.src = url;
        preview.style.display = 'block';
        document.getElementById('generateBtn').classList.add('hidden');
        document.getElementById('shareButtons').classList.remove('hidden');
    }, 'image/png');
}

function downloadImage() {
    if (!generatedImageBlob) return;
    
    const url = URL.createObjectURL(generatedImageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `365-messages-${currentCategory}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function shareImage() {
    if (!generatedImageBlob) return;

    const file = new File([generatedImageBlob], `365-messages-${currentCategory}.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: '365 Messages in Jar',
                text: `${categoryConfig[currentCategory].title} - ${messages[currentIndex]}`
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                alert('Gagal membagikan. Silakan simpan gambar dan bagikan manual.');
            }
        }
    } else {
        // Fallback: download image
        downloadImage();
        alert('✅ Gambar tersimpan! Kamu bisa membagikannya ke WhatsApp, Instagram, atau platform lainnya.');
    }
}