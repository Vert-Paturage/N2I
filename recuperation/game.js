// Configuration du jeu Phaser
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',  // Couleur de fond bleu clair pour simuler l'océan
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let boat;
let trash;
let score = 0;
let scoreText;
let timer = 30;  // Durée du jeu en secondes
let timerText;
let gameOver = false;  // Variable pour vérifier si le jeu est terminé
let gameOverText;
let educationalText; // Variable pour le texte éducatif

const game = new Phaser.Game(config);

function preload() {
    // Aucun chargement d'image n'est nécessaire ici
}

function create() {
    // Création du bateau (un carré rouge)
    boat = this.physics.add.rectangle(400, 500, 100, 50, 0xff0000); // Bateau sous forme de rectangle rouge
    boat.setCollideWorldBounds(true);

    // Création des déchets (des carrés verts)
    trash = this.physics.add.group({
        key: 'trash',
        repeat: 4,
        setXY: { x: Phaser.Math.Between(100, 700), y: 0, stepX: 150 }
    });

    // Remplir les déchets avec des carrés verts
    trash.children.iterate(function (child) {
        child.setDisplaySize(50, 50); // Déchets sous forme de carrés de 50x50
        child.setFill(0x00ff00); // Couleur verte
    });

    // Définir les mouvements du bateau avec une vitesse ajustée
    this.input.on('pointermove', function (pointer) {
        if (!gameOver) {
            boat.x += (pointer.x - boat.x) * 0.1; // Déplacement du bateau avec une certaine vitesse
        }
    });

    // Gestion des collisions entre le bateau et les déchets
    this.physics.add.collider(boat, trash, gameOverFunction, null, this);

    // Affichage du score
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff'
    });

    // Afficher le timer en haut à droite avec couleur noire
    timerText = this.add.text(650, 16, 'Time: 30', {
        fontSize: '32px',
        fill: '#000000'  // Couleur du texte en noir
    });

    // Mettre à jour le timer toutes les secondes
    this.time.addEvent({
        delay: 1000,  // Chaque seconde
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });
}

function update() {
    if (gameOver) {
        return;  // Ne rien faire si le jeu est terminé
    }

    // Déplacer les déchets vers le bas
    trash.children.iterate(function (child) {
        child.y += 2;
        if (child.y > 600) {
            child.y = 0;
            child.x = Phaser.Math.Between(100, 700);
        }
    });
}

function collectTrash(boat, trashItem) {
    if (gameOver) return; // Ne rien faire si le jeu est terminé
    // Quand le bateau collecte un déchet
    trashItem.y = 0;
    trashItem.x = Phaser.Math.Between(100, 700);
    score += 10; // Ajouter des points
    scoreText.setText('Score: ' + score);
}

function gameOverFunction(boat, trashItem) {
    // Fonction qui est appelée quand une collision est détectée
    gameOver = true; // Activer la fin du jeu
    // Afficher un texte de fin
    gameOverText = this.add.text(400, 300, 'Game Over', {
        fontSize: '64px',
        fill: '#ff0000'
    }).setOrigin(0.5);  // Centrer le texte
    
    // Afficher le message éducatif
    showEducationalMessage(this);
}

function updateTimer() {
    if (gameOver) return; // Ne pas mettre à jour le timer si le jeu est terminé
    timer--; // Réduire le temps
    timerText.setText('Time: ' + timer); // Mettre à jour l'affichage du temps

    if (timer <= 0) {
        gameOver = true;  // Fin du jeu lorsque le temps est écoulé
        gameOverText = this.add.text(400, 300, 'Game Over', {
            fontSize: '64px',
            fill: '#ff0000'
        }).setOrigin(0.5);  // Centrer le texte

        // Afficher le message éducatif
        showEducationalMessage(this);
    }
}

// Fonction pour afficher le message éducatif après la fin du jeu
function showEducationalMessage(scene) {
    // Texte éducatif à afficher
    const educationalMessage = [
        "Mission accomplie, les mangroves sont purifiées ! 🌿💧",
        "Les mangroves, comme votre foie, jouent un rôle vital de filtration.",
        "Elles éliminent les impuretés et protègent les écosystèmes environnants,",
        "tout comme votre foie nettoie votre sang pour garder votre corps en bonne santé.",
        "",
        "Mangroves et foie : un duo purificateur",
        "Votre foie filtre les toxines pour empêcher leur accumulation dans votre organisme.",
        "De même, les mangroves absorbent les polluants et stabilisent les sols,",
        "préservant ainsi la qualité de l’eau et la vie marine. Si elles sont surchargées",
        "par des déchets, leur « fonction purificatrice » s’effondre, mettant en péril l’écosystème.",
        "",
        "Les menaces pour les mangroves",
        "• Déchets plastiques : empêchent les racines de respirer et de filtrer l’eau.",
        "• Produits chimiques : empoisonnent les sols et les organismes qui en dépendent.",
        "• Déforestation : détruit leur capacité naturelle à protéger les côtes et filtrer l’eau.",
        "",
        "Pourquoi préserver les mangroves ?",
        "Elles agissent comme un « foie de la planète » :",
        "• Purifient l’eau des polluants.",
        "• Protègent les côtes contre les tempêtes et l’érosion.",
        "• Abritent une biodiversité essentielle et capturent de grandes quantités de CO₂."
    ];

    // Afficher chaque ligne du message éducatif
    let textY = 350; // Position Y de départ pour afficher le texte éducatif
    educationalMessage.forEach((line, index) => {
        scene.add.text(400, textY + (index * 30), line, {
            fontSize: '20px',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5); // Centrer le texte
    });
}
