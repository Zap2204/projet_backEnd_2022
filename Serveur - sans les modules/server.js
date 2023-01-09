// Imports
var express = require('express');
var bodyParser = require('body-parser');
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const cors = require('cors')
var apiRouter = require('./apiRouteur').router;
var moment = require('moment');  


const PORT = 8080
const SECRET = 'mykey'

// Create the server
var server = express();

// configure body-parser
server.use(cors())                                 // Activation de CORS
server.use(morgan('tiny'))   
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Liste des utilisateurs
const users = [
  { id: 1, username: 'admin', password: 'password123' }
]

/* Récupération du header bearer */
const extractBearerToken = headerValue => {
  if (typeof headerValue !== 'string') {
      return false
  }

  const matches = headerValue.match(/(bearer)\s+(\S+)/i)
  return matches && matches[2]
}

/* Vérification du token */
const checkTokenMiddleware = (req, res, next) => {
  // Récupération du token
  const token = req.headers.authorization && extractBearerToken(req.headers.authorization)

  // Présence d'un token
  if (!token) {
      return res.status(401).json({ message: 'Error. Need a token' })
  }

  // Véracité du token
  jwt.verify(token, SECRET, (err, decodedToken) => {
      if (err) {
          res.status(401).json({ message: 'Error. Bad token' })
      } else {
          return next()
      }
  })
}

/* Formulaire de connexion */
server.post('/login', (req, res) => {
  // Pas d'information à traiter
  if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: 'Error. Please enter the correct username and password' })
  }

  // Checking
  const user = users.find(u => u.username === req.body.username && u.password === req.body.password)

  // Pas bon
  if (!user) {
      return res.status(400).json({ message: 'Error. Wrong login or password' })
  }

  const token = jwt.sign({
      id: user.id,
      username: user.username
  }, SECRET, { expiresIn: '3 hours' })

  return res.json({ access_token: token })
})

// configure routes
server.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Bonjour sur mon serveur !</h1>');
});

server.post('/astrological-sign', checkTokenMiddleware, function(req, res) {
  if (!req.body.birthdate) {
    return res.status(400).json({ message: 'Error. Please enter a birthdate with DD-MM-YYYY format' })
  }
  var parsedBirthDate = moment(req.body.birthdate, "DD-MM-YYYY").toDate();
  const signs = ['Aries: Le bélier\nSon symbole est : ♈.\nSon élément est le Feu.\nVoici un lien si tu veux aller plus loin :\n https://mon.astrocenter.fr/astrologie/mag/E1638-belier-portrait-astro','Taurus: Le taureau\nSon symbole est : ♉.\nSon élément est le Terre.\nVoici un lien si tu veux aller plus loin :\n https://mon.astrocenter.fr/astrologie/mag/E1647-taureau-portrait-astro','Gemini: Les jumeaux\nSon symbole est : ♊.\nSon élément est le Air.\nVoici un lien si tu veux aller plus loin :\n https://mon.astrocenter.fr/astrologie/mag/E1642-gemeaux-portrait-astro','Cancer: Le Crabe\nSon symbole est : ♋.\nSon élément est le Eau.\nVoici un lien si tu veux aller plus loin :\n https://mon.astrocenter.fr/astrologie/mag/E1640-cancer-portrait-astro','Leo: Le Lion\nSon symbole est : ♌.\nSon élément est le Feu.\nVoici un lien si tu veux aller plus loin :\n https://mon.astrocenter.fr/astrologie/mag/E1643-lion-portrait-astro','Virgo: La vierge\nSon symbole est : ♍.\nSon élément est le Terre.\nVoici un lien si tu veux aller plus loin :\n https://mon.astrocenter.fr/astrologie/mag/E1650-vierge-portrait-astro','Libra: Les balances\nSon symbole est : ♎.\nSon élément est le Air.\nVoici un lien si tu veux aller plus loin :\n https://mon.astrocenter.fr/astrologie/mag/E1637-balance-portrait-astro','Scorpio: le scorpion\nSon symbole est : ♏.\nSon élément est le Eau.\nVoici un lien si tu veux aller plus loin :\n https://mon.astrocenter.fr/astrologie/mag/E1646-scorpion-portrait-astro','Sagittarius: L\'archer\nSon symbole est : ♐.\nSon élément est le Feu.\nVoici un lien si tu veux aller plus loin :\n https://mon.astrocenter.fr/astrologie/mag/E1645-sagittaire-portrait-astro','Capricorn: La chèvre\nSon symbole est : ♑.\nSon élément est le Terre.\nVoici un lien si tu veux aller plus loin :\n https://mon.astrocenter.fr/astrologie/mag/E1641-capricorne-portrait-astro','Aquarius: L\'ourse marin\nSon symbole est : ♒.\nSon élément est le Air.\nVoici un lien si tu veux aller plus loin :\n https://mon.astrocenter.fr/astrologie/mag/E1648-verseau-portrait-astro','Pisces: Le poisson.\nSon symbole est : ♓.\nSon élément est le Eau.\nVoici un lien si tu veux aller plus loin : https://mon.astrocenter.fr/astrologie/mag/E1644-poissons-portrait-astro']
  var sign = Number(new Intl.DateTimeFormat('fr-TN-u-ca-persian', {month: 'numeric'}).format(parsedBirthDate)) - 1;
  res.setHeader('Content-Type', 'text/html');
    res.status(200).send(signs[sign]);
});


server.use('/api/', apiRouter);

// Start the server
server.listen(PORT, function() {
  console.log(`Server en écoute sur ${PORT}`);
});