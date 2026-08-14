#include <Servo.h>

// =================================================
//              L298N MOTOR DRIVER
// =================================================
#define ENA 5
#define IN1 26
#define IN2 27

#define ENB 6
#define IN3 28
#define IN4 29

// =================================================
//                 SERVO MOTOR
// =================================================
#define SERVO_PIN 9
Servo myServo;

// =================================================
//                ULTRASONIC SENSOR
// =================================================
#define TRIG_PIN 30
#define ECHO_PIN 31

// =================================================
//                  4 IR SENSORS
// =================================================
#define IR1 32
#define IR2 33
#define IR3 34
#define IR4 35

// =================================================
//                 SMOKE SENSOR
// =================================================
#define SMOKE_PIN A0

// Smoke detection threshold
// Is value ko sensor ke according adjust kar sakte ho
#define SMOKE_THRESHOLD 400

// =================================================
//                RELAY + WATER PUMP
// =================================================
#define RELAY_PIN 36

// =================================================
//                    BUZZER
// =================================================
#define BUZZER_PIN 37

// =================================================
//                VARIABLES
// =================================================
char command;
int smokeValue;
long distanceCM;

void setup() {

  // =================================================
  //              MOTOR DRIVER PINS
  // =================================================
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);

  pinMode(ENB, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  // Motor speed
  analogWrite(ENA, 255);
  analogWrite(ENB, 255);

  // =================================================
  //              ULTRASONIC PINS
  // =================================================
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // =================================================
  //                IR SENSOR PINS
  // =================================================
  pinMode(IR1, INPUT);
  pinMode(IR2, INPUT);
  pinMode(IR3, INPUT);
  pinMode(IR4, INPUT);

  // =================================================
  //               RELAY + BUZZER
  // =================================================
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // Pump OFF
  digitalWrite(RELAY_PIN, LOW);

  // Buzzer OFF
  digitalWrite(BUZZER_PIN, LOW);

  // =================================================
  //                  SERVO
  // =================================================
  myServo.attach(SERVO_PIN);
  myServo.write(90);

  // =================================================
  //              BLUETOOTH HC-05
  //              MEGA SERIAL1
  //              TX1 = 18
  //              RX1 = 19
  // =================================================
  Serial.begin(9600);
  Serial1.begin(9600);

  Serial.println("FIRE FIGHTING ROBOT STARTED");
  Serial.println("Bluetooth Ready");

  stopRobot();
}


// =================================================
//                     MAIN LOOP
// =================================================
void loop() {

  // =================================================
  //             BLUETOOTH CONTROL
  // =================================================
  if (Serial1.available()) {

    command = Serial1.read();

    Serial.print("Command: ");
    Serial.println(command);

    if (command == 'F' || command == 'f') {
      forward();
    }

    else if (command == 'B' || command == 'b') {
      backward();
    }

    else if (command == 'L' || command == 'l') {
      left();
    }

    else if (command == 'R' || command == 'r') {
      right();
    }

    else if (command == 'S' || command == 's') {
      stopRobot();
    }

    // Pump ON
    else if (command == 'P' || command == 'p') {
      pumpON();
    }

    // Pump OFF
    else if (command == 'O' || command == 'o') {
      pumpOFF();
    }

    // Servo Center
    else if (command == 'C' || command == 'c') {
      myServo.write(90);
    }
  }


  // =================================================
  //              SMOKE SENSOR CHECK
  // =================================================
  smokeValue = analogRead(SMOKE_PIN);

  Serial.print("Smoke Value: ");
  Serial.println(smokeValue);

  if (smokeValue > SMOKE_THRESHOLD) {

    Serial.println("SMOKE DETECTED!");

    // Buzzer ON
    digitalWrite(BUZZER_PIN, HIGH);

    // Pump ON
    pumpON();
  }

  else {

    // Buzzer OFF
    digitalWrite(BUZZER_PIN, LOW);

    // Pump OFF
    pumpOFF();
  }


  // =================================================
  //             ULTRASONIC DISTANCE
  // =================================================
  distanceCM = getDistance();

  Serial.print("Distance: ");
  Serial.print(distanceCM);
  Serial.println(" cm");


  // =================================================
  //                IR SENSOR STATUS
  // =================================================
  int ir1State = digitalRead(IR1);
  int ir2State = digitalRead(IR2);
  int ir3State = digitalRead(IR3);
  int ir4State = digitalRead(IR4);

  Serial.print("IR1: ");
  Serial.print(ir1State);

  Serial.print("  IR2: ");
  Serial.print(ir2State);

  Serial.print("  IR3: ");
  Serial.print(ir3State);

  Serial.print("  IR4: ");
  Serial.println(ir4State);

  delay(100);
}


// =================================================
//                 FORWARD
// =================================================
void forward() {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);

  analogWrite(ENA, 255);
  analogWrite(ENB, 255);
}


// =================================================
//                 BACKWARD
// =================================================
void backward() {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);

  analogWrite(ENA, 255);
  analogWrite(ENB, 255);
}


// =================================================
//                    LEFT
// =================================================
void left() {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}


// =================================================
//                    RIGHT
// =================================================
void right() {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}


// =================================================
//                    STOP
// =================================================
void stopRobot() {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);

  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
}


// =================================================
//                 PUMP ON
// =================================================
void pumpON() {

  digitalWrite(RELAY_PIN, HIGH);

  Serial.println("WATER PUMP ON");
}


// =================================================
//                 PUMP OFF
// =================================================
void pumpOFF() {

  digitalWrite(RELAY_PIN, LOW);

  Serial.println("WATER PUMP OFF");
}


// =================================================
//             ULTRASONIC FUNCTION
// =================================================
long getDistance() {

  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    return 999;
  }

  long distance = duration * 0.034 / 2;

  return distance;
}