const express = require('express');
const db = require('sqlite');
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
const app = express();



app.use(function (request, result, next) {
  result.header('Access-Control-Allow-Origin', '*');
  result.header('Access-Control-Allow-Headers', 'Content-Type');
  result.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*')
  next()
})

app.use(bodyParser.json());

var database;
db.open('./db.db').then(database_ => {
  database = database_
  // database.all('SELECT * FROM users').then(users => {
  //    allUsers = users 
  //   console.log(allUsers);
  // })
})

// hämtar samtliga users från databasen (Alex)
app.get('/users', (request,response) => {
    database.all('SELECT * FROM users').then(users => {
      response.send(users);
    })
})

// lägger till users (Alex)
app.post('/users', (request,response) => {
  let newUser = request.body
  let newID = uuidv4();
  database.run('INSERT INTO users VALUES(?,?,?,?,?)', [newUser.name, newUser.password, newID, newUser.type, newUser.email]).then(books => {
      response.status(201).send(books);
  })
})

// logga in (Alex)
app.post('/login', (request, response) => {
  let newID = uuidv4();
  let regUser = request.body
   database.all('SELECT * FROM users WHERE name=? AND password=?', [regUser.name, regUser.password]).then(row => {
     if(row[0].name === regUser.name && row[0].password === regUser.password) {
      database.all('INSERT INTO tokens VALUES(?,?)', [regUser.name, newID]).then(user => {
        response.status(201).send(user);
      })
     } else {
      response.status(404).send('')
      console.log('Fel användernamn eller lösenord, försök igen!');
     }
   })
  })

 // Hämtar inloggade (Alex) 
app.get('/login', (request, response) => {
    database.all('SELECT user FROM tokens').then(inloggade => {
     response.status(201).send(inloggade);
  })
})

// Logga ut (Alex) NEXT
app.get("/logout", function(req, res) {
  req.logout();

  console.log("logged out")

  return res.send();
});


// hämtar samtliga böcker från databasen (Alex)
app.get('/books', (request, response) => {
    database.all('SELECT * FROM books').then(books => {
        response.send(books);
    })
})

// hämtar böcker utifrån ett sökord (Sara)
app.get('/books/:word', (request, response) => {
  database.all('select * from books where title like ? or title like ? OR author like ? or author like ? order by year desc',
  ['% '+ request.params.word +' %', request.params.word + ' %', request.params.word +', %', '% '+ request.params.word]
  ).then(books => {
    response.status(201)
    response.send(books)
  })
})

  app.listen(3000, function () {
    console.log('The server is running!');
});
