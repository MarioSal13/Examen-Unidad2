let paddle;
let ball;
let ballLaunched = false;
let vidas = 3;
let nivelActual = 1;
let maxNiveles = 3;
let bloques = [];
let score = 0;
let coloresBloques = [];
let estadoJuego = "pantallaControles"; 

function setup() {
  createCanvas(800, 600);
  background(200);

  coloresBloques = [
    color(0, 255, 0),  
    color(255, 255, 0), 
    color(0, 0, 255)    
  ];

  paddle = {
    x: width / 2 - 50,
    y: height - 30,
    w: 100,
    h: 15,
    speed: 7
  };

  ball = {
    x: width / 2,
    y: height / 2,
    r: 10,
    dx: 6,
    dy: -4
  };
}

function draw() {
  background(30);

  if (estadoJuego === "pantallaControles") {
    mostrarPantallaControles();
    return;
  }

  if (estadoJuego === "pantallaNivel") {
    mostrarPantallaNivel();
    ballLaunched = false; 
    return;
  }

  // HUD
  fill(255);
  textSize(20);
  text("Vidas: " + vidas, 70, 30);
  text("Score: " + score, 170, 30);

// Bloques
for (let b of bloques) {
  if (b.activo) {
    if (b.irrompible) fill(150);
    else if (b.resistencia === 3) fill(255, 0, 0);      
    else if (b.resistencia === 2) fill(128, 0, 128);    
    else fill(b.color);                                 
    rect(b.x, b.y, b.w, b.h);
  }
}


  // Barra
  fill(255);
  rect(paddle.x, paddle.y, paddle.w, paddle.h);

  // Ball
  fill(255);
  ellipse(ball.x, ball.y, ball.r * 2);

  // Barra Movimiento
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) paddle.x -= paddle.speed;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) paddle.x += paddle.speed;
  paddle.x = constrain(paddle.x, 0, width - paddle.w);

  if (!ballLaunched) {
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - ball.r;
  } else {
    // Movimiento pelota
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Colisiones con bloques 
    for (let b of bloques) {
      if (b.activo) {
        let dentroX = ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w;
        let dentroY = ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h;

        if (dentroX && dentroY) {
          // Determinar dirección del impacto
          let centroPelota = createVector(ball.x, ball.y);
          let centroBloque = createVector(b.x + b.w / 2, b.y + b.h / 2);
          let diferencia = p5.Vector.sub(centroPelota, centroBloque);

          
          if (abs(diferencia.x) > abs(diferencia.y)) {
            ball.dx *= -1; 
          } else {
            ball.dy *= -1; 
          }

          if (!b.irrompible) {
            b.resistencia--;
            if (b.resistencia <= 0) {
              b.activo = false;
              score += 100;
            } else {
              score += 50;
            }
          }

          break; 
        }
      }
    }



    // Rebotes con paredes
    if (ball.x < ball.r || ball.x > width - ball.r) ball.dx *= -1;
    if (ball.y < ball.r) ball.dy *= -1;

    // Rebote con la barra
    if (
      ball.y + ball.r > paddle.y &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.w
    ) {
      ball.dy *= -1;
      ball.y = paddle.y - ball.r;
    }

    // Caída
    if (ball.y > height) {
      vidas--;
      resetBall();
    }

    // Game over
    if (vidas <= 0) {
      noLoop();
      estadoJuego = "gameOver";
      textAlign(CENTER);
      textSize(40);
      fill(255, 0, 0);
      text("Game Over", width / 2, height / 2);
      text("Score: " + score, width / 2, height / 2 + 40);
      textSize(20);
      fill(255);
      text("Presiona R para reiniciar", width / 2, height / 2 + 80);
    }

    // Siguiente nivel
    let activos = bloques.filter(b => b.activo && !b.irrompible);
    if (activos.length === 0) {
      nivelActual++;
      ballLaunched = false;
      ball.dx = 6 * (random() > 0.5 ? 1 : -1);
      ball.dy = -4;

      if (nivelActual <= maxNiveles) {
        estadoJuego = "pantallaNivel";
      } else {
        noLoop();
        estadoJuego = "gameOver";
        textAlign(CENTER);
        textSize(40);
        fill(0, 255, 0);
        text("¡Ganaste todos los niveles!", width / 2, height / 2);
        textSize(20);
        fill(255);
        text("Presiona R para reiniciar", width / 2, height / 2 + 80);
      }
    }
  }
}

// Controlar acciones del teclado
function keyPressed() {
  if ((keyCode === 32 || keyCode === UP_ARROW) && !ballLaunched && estadoJuego === "jugando") {
    ballLaunched = true;
  }

  if ((key === 'r' || key === 'R') && estadoJuego === "gameOver") {
    reiniciarJuego();
  }

  if (keyCode === ENTER) {
    if (estadoJuego === "pantallaControles") {
      estadoJuego = "pantallaNivel";
    } else if (estadoJuego === "pantallaNivel") {
      cargarNivelPorEstado();
      estadoJuego = "jugando";
    }
  }
}

// Mostrar pantallas entre niveles
function mostrarPantallaNivel() {
  background(0);
  textAlign(CENTER);
  textSize(50);
  fill(255);
  text("Nivel " + nivelActual, width / 2, height / 2);
  textSize(20);
  text("Presiona ENTER para comenzar", width / 2, height / 2 + 40);
}

// Reiniciar el juego
function reiniciarJuego() {
  vidas = 3;
  score = 0;
  nivelActual = 1;
  ballLaunched = false;
  ball.dx = 6 * (random() > 0.5 ? 1 : -1);
  ball.dy = -4;
  ball.x = width / 2;
  ball.y = height / 2;
  cargarNivel1();
  estadoJuego = "pantallaNivel";
  loop();
}

// Reiniciar la pelota al caer
function resetBall() {
  ballLaunched = false;
  ball.dx = 6 * (random() > 0.5 ? 1 : -1);
  ball.dy = -4;
}

//cargar los niveles por estado
function cargarNivelPorEstado() {
  if (nivelActual === 1) cargarNivel1();
  else if (nivelActual === 2) cargarNivel2();
  else if (nivelActual === 3) cargarNivel3();
}

//crear Nivel 1
function cargarNivel1() {
  bloques = [];
  let filas = 4, columnas = 8, w = 80, h = 30, margen = 10, offX = 50, offY = 60;
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      bloques.push(crearBloque(offX + c * (w + margen), offY + f * (h + margen), w, h, 1, false));
    }
  }
}

//crear Nivel 2
function cargarNivel2() {
  bloques = [];
  let filas = 6, columnas = 8, w = 80, h = 30, margen = 10, offX = 50, offY = 60;
  let fEspecial = floor(random(filas));
  let cEspecial = floor(random(columnas));
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      let r = (f === fEspecial && c === cEspecial) ? 3 : 1;
      bloques.push(crearBloque(offX + c * (w + margen), offY + f * (h + margen), w, h, r, false));
    }
  }
  ball.dx *= 1.3;
  ball.dy *= 1.3;
}

//crear Nivel 3 
function cargarNivel3() {
  bloques = [];
  let filas = 9, columnas = 11, w = 60, h = 20, margen = 5, offX = 30, offY = 40;
  let especiales = new Set();
  while (especiales.size < 2) {
    especiales.add(`${floor(random(filas))},${floor(random(columnas))}`);
  }
  let bloqueIrrompible;
  do {
    bloqueIrrompible = `${floor(random(filas))},${floor(random(columnas))}`;
  } while (especiales.has(bloqueIrrompible));
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      let clave = `${f},${c}`;
      let r = especiales.has(clave) ? 3 : 1;
      let irrompible = clave === bloqueIrrompible;
      bloques.push(crearBloque(offX + c * (w + margen), offY + f * (h + margen), w, h, r, irrompible));
    }
  }
  ball.dx *= 1.1;
  ball.dy *= 1.1;
  ball.x = width / 2;
  ball.y = height / 2;
}

function crearBloque(x, y, w, h, resistencia, irrompible) {
  return {
    x, y, w, h,
    resistencia,
    activo: true,
    irrompible,
    color: random(coloresBloques)
  };
}

function mostrarPantallaControles() {
  background(0);
  fill(255);
  textAlign(CENTER);
  textSize(36);
  text("¡Bienvenido al juego!", width / 2, 100);

  textSize(24);
  text("Controles:", width / 2, 180);
  text("← / →  o  A / D  para mover la barra", width / 2, 220);
  text("Espacio o ↑ para lanzar la pelota", width / 2, 260);
  text("R para reiniciar cuando pierdas/Ganas", width / 2, 300);

  textSize(20);
  text("Presiona ENTER para comenzar", width / 2, height - 80);
}
