/*
  ESP32 + Sensor ultrassonico HC-SR04
  Comunicacao com Node.js via USB Serial
  Sem Ethernet, W5500 ou Wi-Fi

  GPIO 4 = TRIG
  GPIO 2 = ECHO
  Velocidade serial = 115200 baud
*/

const int PINO_TRIG = 4;
const int PINO_ECHO = 2;

void setup() {
  // Inicializa a comunicacao USB serial
  Serial.begin(115200);

  // Configura os pinos do sensor
  pinMode(PINO_TRIG, OUTPUT);
  pinMode(PINO_ECHO, INPUT);

  // Garante que o TRIG comece desligado
  digitalWrite(PINO_TRIG, LOW);

  // Aguarda a inicializacao
  delay(1000);

  Serial.println("{\"status\":\"ESP32 iniciado\"}");
}

void loop() {
  // Envia o pulso de disparo do sensor
  digitalWrite(PINO_TRIG, LOW);
  delayMicroseconds(2);

  digitalWrite(PINO_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PINO_TRIG, LOW);

  // Aguarda o retorno do eco (timeout de 30 ms)
  unsigned long duracao = pulseIn(PINO_ECHO, HIGH, 30000);

  // Se nao houver eco, informa o erro em JSON
  if (duracao == 0) {
    Serial.println("{\"erro\":\"sem_eco\"}");
    delay(1000);
    return;
  }

  // Calcula a distancia em centimetros
  float distancia = (duracao * 0.0343f) / 2.0f;

  // Envia uma linha JSON para o Node.js
  Serial.print("{\"distancia\":");
  Serial.print(distancia, 2);
  Serial.println("}");

  // Intervalo entre medicoes
  delay(1000);
}