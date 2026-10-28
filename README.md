# ArduinoSensor

## No ArduinoIDE
1. Abra o Arduino IDE.
2. Vá em Arquivo → Preferências.
3. No campo de URLs adicionais para gerenciamento de placas, adicione:
URL do pacote ESP32
https://espressif.github.io/arduino-esp32/package_esp32_index.json
4. Abra o Gerenciador de Placas e instale esp32 by Espressif Systems.
5. Conecte o ESP32 ao computador com um cabo USB que transmita dados.
6. Selecione o modelo correto da placa e sua porta COM.
7. Abra arduino.ino e clique em Upload.

## No VS Code / MongoDB
1. Instale o Node.js.
2. Abra a pasta do projeto no VS Code.
3. Abra o terminal do VS Code.
4. Digite npm init -y e pressione Enter.
5. Digite o comando:
npm install express mongodb serialport @serialport/parser-readline dotenv
6. Acesse o MongoDB Atlas pelo navegador.
7. Entre no seu projeto e clique em Connect → Drivers → Node.js.
8. Copie a string de conexão fornecida pelo MongoDB Atlas.
9. Crie um arquivo chamado .env na mesma pasta do sensor.js.
10. Dentro do .env, coloque:
MONGODB_URI=mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/
PORT=3000
Substitua pelo endereço copiado do Atlas, incluindo usuário e senha corretos.
11. No MongoDB Atlas, em Network Access, autorize o endereço IP do seu computador.
12. No sensor.js, verifique se a porta COM3 corresponde à porta da placa no Arduino IDE.
13. Conecte a placa ao computador e feche o Monitor Serial do Arduino IDE.
14. No terminal do VS Code, execute:
node sensor.js

Acesse o MongoDB Atlas e abra Browse Collections → sensorDB → distancias para visualizar os dados enviados pelo sensor.
