# observer
Server Dashboard
Project for TTMS0500 /  TTMS0900

## Usage

- Pull repo `git clone https://ilp0/observer.git`
- `cd observer`
- Import the sql database to your mysql/mariadb server.
- Edit the config file in ------- and insert your mysql server ip, port, desired password.
- Start backend by running `npm install & npm start` in the observer-ws directory
- Copy the contents of the observer-react/build/ directory to your web-server

## Todo

- Pitemmän ajan datat
- Serverien nimeäminen
- Servicen status näkyviin
  * Näiden loggaus aina muutoksen tapahtuessa(start, stop)
- MySQL credut ja serverin ip conffi tiedostosta

## Ajankäyttö ja projektin työstäminen
### 27.9.2018
- Suunnittelua
### 7.10.2018
- Suunnittelua ja backendin vääntöä
### 9.10.2018
- Lisää backendin vääntöä ja testailua
### 10.10.2018
- Backendiin MySQL
- Frontendin aloittelua bootstrapilla + javascriptillä
### 11.10.2018
- Backend config tiedoston generointi ja määrittelyt
- Frontendin päätettiin tehdä React natiivilla. Dokumentoinnin lukua.
### 13.10.2018
- Service statuksen lähetys
### 19.10.2018
- Frontendin ja backendin koodailua, dokumentoinnin lukua
### 24.10.2018
- Hurja koodaus putki, kumpaankin, backendiin sekä frontendiin. + tunteja dokumentaation lukua
### 25.10.2018
- Koodausputki jatkuu, pääpaino backendissä.
