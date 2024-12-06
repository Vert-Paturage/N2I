const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables globales
const pollutants = [];
const coral = { x: canvas.width / 2, y: canvas.height / 2, radius: 100, greenIntensity: 50 };
let score = 0;
let gameOver = false;

// Créer un polluant
function createPollutant() {
    const size = Math.random() * 20 + 10;
    pollutants.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        color: "rgba(255, 0, 0, 0.8)"
    });
}

// Initialiser les polluants
for (let i = 0; i < 20; i++) {
    createPollutant();
}

// Dessiner un récif corallien
function drawCoral() {
    const green = Math.min(coral.greenIntensity, 255);
    ctx.beginPath();
    ctx.arc(coral.x, coral.y, coral.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, ${green}, 0, 0.7)`;
    ctx.fill();
    ctx.closePath();
}

// Dessiner les polluants
function drawPollutants() {
    pollutants.forEach((pollutant) => {
        ctx.beginPath();
        ctx.arc(pollutant.x, pollutant.y, pollutant.size, 0, Math.PI * 2);
        ctx.fillStyle = pollutant.color;
        ctx.fill();
        ctx.closePath();
    });
}

// Gérer les clics pour nettoyer les polluants
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    pollutants.forEach((pollutant, index) => {
        const dist = Math.hypot(mouseX - pollutant.x, mouseY - pollutant.y);
        if (dist < pollutant.size) {
            pollutants.splice(index, 1);
            score += 10;
            coral.greenIntensity += 10; // Augmente l'intensité du vert
            if (pollutants.length === 0) {
                gameOver = true;
            }
        }
    });
});

// Afficher l’énoncé
function drawTitle() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Nettoie les poumons des océans", canvas.width / 2, 40);
    ctx.font = "20px Arial";
    ctx.fillText("Clique sur les polluants pour restaurer les récifs coralliens !", canvas.width / 2, 80);
}


function drawGameOver() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Félicitations !", canvas.width / 2, 50);
    ctx.font = "30px Arial";
    ctx.fillText(`Votre récif est restauré. Score final : ${score}`, canvas.width / 2, 100); 
    ctx.fillText("Merci d'avoir aidé à protéger les océans !", canvas.width / 2, 150); 

    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    const textX = 20; 
    const textY = 180; 
    const lineHeight = 25; 
    const lines = [
        "Félicitations, vous avez redonné vie au récif ! 🪸💨",
        "Les récifs coralliens sont les poumons des océans. Tout comme vos",
        "poumons filtrent l’air et vous permettent de respirer, les coraux",
        "produisent de l’oxygène et abritent une biodiversité essentielle.",
        "",
        "Les récifs et les poumons : une ressemblance frappante",
        "Vos poumons aspirent de l’air pur et rejettent le CO₂. De même,",
        "les récifs coralliens maintiennent l’équilibre des écosystèmes",
        "marins. Quand ils sont asphyxiés par les algues ou les polluants,",
        "c’est tout l’océan qui en souffre, un peu comme si vos poumons",
        "étaient encombrés.",
        "",
        "Les menaces pour les récifs",
        "• Pollution plastique et chimique : comme la fumée ou les toxines",
        "  pour nos poumons.",
        "• Réchauffement des eaux : entraîne le blanchissement des coraux,",
        "  réduisant leur capacité à nourrir l’océan.",
        "• Algues envahissantes : étouffent les récifs en privant",
        "  l’écosystème de lumière et d’oxygène.",
        "",
        "Pourquoi protéger les récifs ?",
        "Les récifs coralliens produisent une partie de l’oxygène de l’océan,",
        "protègent les côtes et servent de refuge à 25% des espèces marines.",
        "Leur santé est aussi cruciale que celle de vos propres poumons !"
    ];

    lines.forEach((line, index) => {
        ctx.fillText(line, textX, textY + index * lineHeight);
    });
}

function drawScore() {
    const padding = 10;
    const text = `Score : ${score}`;
    const textWidth = ctx.measureText(text).width;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(10, 10, textWidth + padding * 2, 40);

    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(text, 20, 40);
}


function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        drawGameOver();
        return;
    }

    drawTitle();
    drawCoral();
    drawPollutants();
    drawScore();

    requestAnimationFrame(update);
}

update();
