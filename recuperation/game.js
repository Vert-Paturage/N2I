
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',  
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
let timer = 30;  
let timerText;
let gameOver = false;  
let gameOverText;
let educationalText; 

const game = new Phaser.Game(config);

function preload() {
    
}

function create() {
    boat = this.physics.add.rectangle(400, 500, 100, 50, 0xff0000); 
    boat.setCollideWorldBounds(true);

  
    trash = this.physics.add.group({
        key: 'trash',
        repeat: 4,
        setXY: { x: Phaser.Math.Between(100, 700), y: 0, stepX: 150 }
    });

   
    trash.children.iterate(function (child) {
        child.setDisplaySize(50, 50); 
        child.setFill(0x00ff00); 
    });

   
    this.input.on('pointermove', function (pointer) {
        if (!gameOver) {
            boat.x += (pointer.x - boat.x) * 0.1; 
        }
    });

   
    this.physics.add.collider(boat, trash, gameOverFunction, null, this);

  
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff'
    });

   
    timerText = this.add.text(650, 16, 'Time: 30', {
        fontSize: '32px',
        fill: '#000000'  
    });

  
    this.time.addEvent({
        delay: 1000, 
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });
}

function update() {
    if (gameOver) {
        return;  
    }

    
    trash.children.iterate(function (child) {
        child.y += 2;
        if (child.y > 600) {
            child.y = 0;
            child.x = Phaser.Math.Between(100, 700);
        }
    });
}

function collectTrash(boat, trashItem) {
    if (gameOver) return; 
   
    trashItem.y = 0;
    trashItem.x = Phaser.Math.Between(100, 700);
    score += 10; 
    scoreText.setText('Score: ' + score);
}

function gameOverFunction(boat, trashItem) {
    
    gameOver = true; 
  
    gameOverText = this.add.text(400, 300, 'Game Over', {
        fontSize: '64px',
        fill: '#ff0000'
    }).setOrigin(0.5); 
    
    
    showEducationalMessage(this);
}

function updateTimer() {
    if (gameOver) return; 
    timer--; 
    timerText.setText('Time: ' + timer);

    if (timer <= 0) {
        gameOver = true;  
        gameOverText = this.add.text(400, 300, 'Game Over', {
            fontSize: '64px',
            fill: '#ff0000'
        }).setOrigin(0.5); 

       
        showEducationalMessage(this);
    }
}

function showEducationalMessage(scene) {
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

    let textY = 350; 
    educationalMessage.forEach((line, index) => {
        scene.add.text(400, textY + (index * 30), line, {
            fontSize: '20px',
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5); 
    });
}
