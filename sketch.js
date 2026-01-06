/* * ===========================================================
 * Project: Happy New Year 2026 - Year of the Horse
 * Copyright (c) 2026 parksinyoung. All rights reserved.
 * ===========================================================
 */

let handPose;
let video;
let hands = [];
let myFont; 
let fixedWords = [];
let sparkles = [];

let marqueeX = 0;
let marqueeSpeed = 1.0; 
let marqueeText = "카메라 허용을 한 뒤 검지손가락을 멀리서 들어보세요 복이 쏟아집니다          ";


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
let prevWristX = 0, prevWristY = 0, shakeAmount = 0;

function preload() {
  try {
    myFont = loadFont('Orbit-Regular.ttf');
  } catch (e) {
    console.log("폰트 로딩 에러");
  }
}

function setup() {
  
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');
  
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  handPose = ml5.handPose(video, { flipHorizontal: true }, () => {
    console.log("준비 완료! 무한 복 쌓기!");
    handPose.detectStart(video, (results) => { hands = results; });
  });
  
  marqueeX = 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(130, 0, 20); 

  
  drawCenteredASCII();


  if (hands && hands.length > 0) {
    for (let hand of hands) {
      let indexTip = hand.keypoints[8];
      fill(0, 255, 0); noStroke();
      ellipse(indexTip.x, indexTip.y, 10, 10);
      checkIndexGesture(hand, hands.indexOf(hand));
      if (hands.indexOf(hand) === 0) checkShake(hand.keypoints[0]);
    }
  }


  if (myFont) textFont(myFont);
  else textFont('sans-serif');
  
  for (let i = fixedWords.length - 1; i >= 0; i--) {
    let w = fixedWords[i];
    if (w.y < w.targetY) {
      w.y += w.speed * 0.8; 
      w.x += sin(frameCount * 0.05 + i) * 0.2; 
    } else {
      if (!w.landed) {
        w.y = w.targetY;
        w.landed = true;
        createSparkles(w.x, w.y);
      }
    }
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(w.txt, w.x, w.y);
  }

  drawSparkles();


  drawMarquee();
}

function drawMarquee() {
  push();
  fill(250, 250, 90);
  noStroke();
  rect(0, 0, width, 25); 

  fill(130, 0, 20);
  if (myFont) textFont(myFont);
  else textFont('sans-serif');
  textSize(15); 
  textAlign(LEFT, CENTER);

  let tw = textWidth(marqueeText);
  text(marqueeText, marqueeX, 12.5);
  text(marqueeText, marqueeX + tw, 12.5);

  marqueeX -= marqueeSpeed;
  if (marqueeX <= -tw) marqueeX = 0;
  pop();
}

function drawCenteredASCII() {
  push();
  fill(250, 250, 90); 
  textFont('monospace');
  

  let dynamicSize = width / 80; 
  dynamicSize = constrain(dynamicSize, 10, 24); 
  textSize(dynamicSize);
  let lineHeight = dynamicSize * 1.25; 
  

  let maxW = 0;
  for (let line of backgroundCode) {
    let currentW = textWidth(line.trimEnd()); 
    if (currentW > maxW) maxW = currentW;
  }
  
  let totalHeight = backgroundCode.length * lineHeight;
  

  let startX = (width - maxW) / 2;
  let startY = (height - totalHeight) / 2;
  
  textAlign(LEFT, TOP); 
  for (let i = 0; i < backgroundCode.length; i++) {
    text(backgroundCode[i], startX, startY + i * lineHeight);
  }
  pop();
}

function createSparkles(x, y) {
  for (let i = 0; i < 8; i++) {
    sparkles.push({ x: x + random(-15, 15), y: y + random(-10, 10), size: random(2, 5), alpha: 255, driftX: random(-1, 1), driftY: random(-1.5, 0.5) });
  }
}

function drawSparkles() {
  push(); noStroke();
  for (let i = sparkles.length - 1; i >= 0; i--) {
    let s = sparkles[i]; s.alpha -= 10; s.x += s.driftX; s.y += s.driftY;
    if (s.alpha <= 0) { sparkles.splice(i, 1); continue; }
    fill(255, 250, 90, s.alpha); ellipse(s.x, s.y, s.size, s.size);
  }
  pop();
}

function checkIndexGesture(hand, index) {
  let indexTip = hand.keypoints[8], indexKnuckle = hand.keypoints[5], middleTip = hand.keypoints[12];
  let isPointing = (indexTip.y < indexKnuckle.y - 40) && (indexTip.y < middleTip.y - 40);

  if (isPointing) {
    if (millis() - lastGestureTimes[index] > 300) {
      let stackOffset = (fixedWords.length % 25) * 4; 
      fixedWords.push({
        txt: random(allWords),
        x: indexTip.x, 
        y: indexTip.y,
        targetY: height - 60 - stackOffset, 
        speed: random(0.5, 1.2), 
        landed: false 
      });
      lastGestureTimes[index] = millis();
    }
  }
}

function checkShake(wrist) {
  let diffX = abs(wrist.x - prevWristX), diffY = abs(wrist.y - prevWristY);
  let totalDiff = diffX + diffY;
  if (totalDiff > 40) shakeAmount += totalDiff;
  else shakeAmount *= 0.95; 
  if (shakeAmount > 2000) { fixedWords = []; sparkles = []; shakeAmount = 0; }
  prevWristX = wrist.x; prevWristY = wrist.y;
}

function mousePressed() { fixedWords = []; sparkles = []; }
