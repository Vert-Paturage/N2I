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

// Afficher les félicitations et le score final
function drawGameOver() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Félicitations !", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "30px Arial";
    ctx.fillText(`Votre récif est restauré. Score final : ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("Merci d'avoir aidé à protéger les océans !", canvas.width / 2, canvas.height / 2 + 60);
}

// Afficher le score avec un fond contrasté
function drawScore() {
    const padding = 10;
    const text = `Score : ${score}`;
    const textWidth = ctx.measureText(text).width;

    // Fond sombre pour le score
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(10, 10, textWidth + padding * 2, 40);

    // Texte blanc par-dessus
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(text, 20, 40);
}

// Mettre à jour l'écran
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

// Démarrer le jeu
update();
