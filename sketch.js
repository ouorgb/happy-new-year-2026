let handPose;
let video;
let hands = [];
let myFont; 
let fixedWords = [];
let sparkles = [];

const allWords = [
  "병오년", "복", "HORSE", "HAPPY", "NEW YEAR", "LOVE", "LUCK", "MONEY", "WORK", "FAMILY", "FRIEND", "PET",
  "이공이육", "근하신년", "아자아자", "으쌰으쌰"
];

const backgroundCode = [
  "1 | class Happy 2026 {",
  "2 |     void run_new_year() {",
  "3 |         // horse outline",
  "4 |             .#\\ ****",
  "5 |             #      ****",
  "6 |            #        ***",
  "7 |            .    #       ***",
  "8 |            #  ***\\      ***",
  "9 |            .#/    \\        * *******.",
  "10|                  #                 *#*****",
  "11|                  #                   #    *#",
  "12|                  #                  _ #    /  #",
  "13|                  #            /     _ **\\  / #    #",
  "14|                   * _  .   / ****** * * _    /  \\    #",
  "15|                  # * `    \\  \\        ` ` \\ \\  \\  \\",
  "16|                 / /       \\  \\           # /  \\  \\  *\\ \\*",
  "17|                 \\ *,       \\  \\         /* /   \\  \\    *",
  "18|                  \\_/        \\ \\        (  /     \\  \\",
  "19|                             / )        ( ;      /  )",
  "20|                            /_\\          `      /_\\",
  "21|     }",
  "22|   name = \"happy_new_year_world\";", 
  "23| }"
];

let lastGestureTimes = [0, 0]; 
let prevWristX = 0;
let prevWristY = 0; 
let shakeAmount = 0;

function preload() {
  try {
    myFont = loadFont('Orbit-Regular.ttf');
  } catch (e) {
    console.log("폰트 로딩 에러: 기본 폰트를 사용합니다.");
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.elt.setAttribute('playsinline', ''); 
  video.elt.setAttribute('muted', 'true');
  video.hide();

  const options = { 
    flipHorizontal: true, 
    detectionConfidence: 0.6,
    maxHands: 2 
  };
  
  handPose = ml5.handPose(video, options, () => {
    console.log("준비 완료!");
    handPose.detectStart(video, (results) => {
      hands = results;
    });
  });

  textAlign(CENTER, CENTER);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(130, 0, 20); 

  // 1
  drawFixedASCII();

  // 2
  if (hands && hands.length > 0) {
    for (let hand of hands) {
      let indexTip = hand.keypoints[8];
      fill(255, 255, 0); 
      noStroke();
      ellipse(indexTip.x, indexTip.y, 10, 10);
      
      let i = hands.indexOf(hand);
      checkIndexGesture(hand, i); 
      if (i === 0) checkShake(hand.keypoints[0]);
    }
  }

  // 3
  if (myFont) textFont(myFont);
  else textFont('sans-serif');
  
  for (let i = fixedWords.length - 1; i >= 0; i--) {
    let w = fixedWords[i];
    if (w.y < w.targetY) {
      w.y += w.speed * 8; 
    } else {
      if (!w.landed) {
        w.y = w.targetY;
        w.landed = true;
        createSparkles(w.x, w.y);
      }
    }
    fill(255);
    textSize(28);
    textAlign(CENTER, CENTER);
    text(w.txt, w.x, w.y);
  }

  drawSparkles();
}


function drawFixedASCII() {
  push();
  fill(250, 250, 90); 
  textFont('monospace');
  
 
  let fontSize = min(width / 32, height / 32); 
  fontSize = constrain(fontSize, 18, 45); 
  textSize(fontSize);
  

  let longestLine = "";
  for (let line of backgroundCode) {
    if (line.length > longestLine.length) longestLine = line;
  }
  
  let blockWidth = textWidth(longestLine);
  let lineHeight = fontSize * 1.2; 
  let totalHeight = backgroundCode.length * lineHeight;

  // 정중앙 좌표 계산
  let startX = (width - blockWidth) / 2;
  let startY = (height - totalHeight) / 2;

  textAlign(LEFT, TOP); 
  
  for (let i = 0; i < backgroundCode.length; i++) {
    text(backgroundCode[i], startX, startY + i * lineHeight);
  }
  pop();
}

function createSparkles(x, y) {
  for (let i = 0; i < 8; i++) {
    sparkles.push({
      x: x + random(-15, 15),
      y: y + random(-10, 10),
      size: random(2, 5),
      alpha: 255,
      driftX: random(-1, 1),
      driftY: random(-1.5, 0.5)
    });
  }
}

function drawSparkles() {
  push();
  noStroke();
  for (let i = sparkles.length - 1; i >= 0; i--) {
    let s = sparkles[i];
    s.alpha -= 10;
    s.x += s.driftX;
    s.y += s.driftY;
    if (s.alpha <= 0) {
      sparkles.splice(i, 1);
      continue;
    }
    fill(255, 255, 0, s.alpha); 
    ellipse(s.x, s.y, s.size, s.size);
  }
  pop();
}

function checkIndexGesture(hand, index) {
  let indexTip = hand.keypoints[8];
  let indexKnuckle = hand.keypoints[5];
  let middleTip = hand.keypoints[12];
  
  let isPointing = (indexTip.y < indexKnuckle.y - 40) && (indexTip.y < middleTip.y - 40);

  if (isPointing) {
    if (millis() - lastGestureTimes[index] > 300) {
      let stackOffset = (fixedWords.length % 25) * 4; 
      fixedWords.push({
        txt: random(allWords),
        x: indexTip.x, 
        y: indexTip.y,
        targetY: height - 60 - stackOffset, 
        speed: random(1, 1.5),
        landed: false 
      });
      lastGestureTimes[index] = millis();
    }
  }
}

function checkShake(wrist) {
  let diffX = abs(wrist.x - prevWristX);
  let diffY = abs(wrist.y - prevWristY);
  let totalDiff = diffX + diffY;
  
  if (totalDiff > 40) shakeAmount += totalDiff;
  else shakeAmount *= 0.95; 

  if (shakeAmount > 2000) {
    fixedWords = [];
    sparkles = [];
    shakeAmount = 0;
  }
  prevWristX = wrist.x; prevWristY = wrist.y;
}

function mousePressed() {
  fixedWords = [];
  sparkles = [];
}

