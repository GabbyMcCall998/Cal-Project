const express =require("express");
const bodyParser = require("body-parser")

const mysql = require("mysql2");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const app = express();

app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // To parse URL-encoded data in POST requests
app.use(bodyParser.json());




   // This line creates the MySQL database connection
   const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "locations",
    port:"3306",
    multipleStatements:true
  });

  
// This line connects the Node server to the MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }else{
  console.log('Connected to the database');

  }
});

const User = require('./models/user');

// Configured passport for user authentication
passport.use(new LocalStrategy(
  (email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
          if (err) return done(err);
          if (!user) return done(null, false, { message: 'Incorrect email.' });
          if (!user.validcode1(password)) return done(null, false, { message: 'Incorrect password.' });
          return done(null, user);
      });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
      done(err, user);
  });
});


// Configured Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/login',function(req,res){
  res.sendFile(__dirname + "/login.html")
});

// Creating the login route
app.post('/login', (req, res) => {
  if (req.method === "POST") {
    const { email, password } = req.body;
    
    
    // Query to select the user with the provided email
    const query = 'SELECT * FROM users WHERE email = ?';
    
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error(err);
        console.log("connected to")
        return res.status(500).send('Error during login');
      }
      
      if (results.length === 1) {
        const user = results[0];
        
        // Compare the hashed password with the provided password
      if (user.password === password) {
           req.session.loggedIn = true;
           return res.send('Logged in successfully');
         } else {
           return res.status(401).send('Login failed. Incorrect password.');
         }
       } else {
         return res.status(401).send('Login failed. Invalid credentials.');
       }
     });
   } else {
     return res.status(405).send('Method Not Allowed');
   }
});

   
//Signup page route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/submit', (req, res) => {
  if (req.method === "POST") {
    const { name1, name2, email, password, confirmpassword } = req.body;

    // Checks if any of the fields is empty
    if (!name1 || !name2 || !email || !password || !confirmpassword) {
      return res.status(400).send('Please fill in all fields');
    }

    // Checks if password and confirmPassword match
    if (password !== confirmpassword) {
      return res.status(400).send('Passwords do not match');
    }
        // // Hash the password using a secure hashing algorithm (e.g., bcrypt)
        // bcrypt.hash(password, 10, (err, hash) => {
        //   if (err) {
        //       console.error('Password hashing error:', err);
        //       res.send('An error occurred during sign-up.');
        //   } else {
        //       // Store the user data with the hashed password in memory (in a real app, store in a database)
        //       users.push({ email, password: hash });
        //       res.send(`Sign-up successful! Welcome, ${email}!`);
        // const hashedPassword1 = hashPasswordFunction(password);
        
        // // Inserts the user data into the database
        const sql = 'INSERT INTO users (name1,name2,email,password) VALUES (?,?,?,?)';
        db.query(sql, [name1,name2,email,password], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                res.send('An error occurred during sign-up.');
            } else {
                res.send(`Sign-up successful! Welcome, ${name1}!`);
            }
      });



// Defined API endpoints for fetching branch and ATM data 
app.get('/branches', (req, res) => {
  db.query('SELECT * FROM branches', (err, results,fields) => {
    if (err) {
      console.error('Error fetching branch data:', err);                                  //Endpoint works
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
      
    }
  });
});


//Route for creating a new branch
app.post('/api/branches', (req, res) => {
  const { id,name,city,state,address,latitude,longitude,operating_hours } = req.body;

// Insert the new branch into the database
  db.query('INSERT INTO branches VALUES (?,?,?,?,?,?,?,?)',
    [id,name,city,state,address,latitude,longitude,operating_hours],
    (err, result) => {                                                                          //Endpoint works 
      if (err) {
        console.error('Error creating branch:', err);
        return res.status(500).json({ error: 'Failed to create branch' });
      }
      res.json({ message: 'Branch created successfully', newBranch: { id: result.insertId, ...req.body } });
    });
});



//  route for retrieving all branches
app.get('/api/branches', (req, res) => {                                        /// Endpoint works
// Fetch all branches from the database
db.query('SELECT * FROM branches', (err, results) => {
  if (err) {
    console.error('Error fetching branches:', err);
    return res.status(500).json({ error: 'Failed to fetch branches' });
  }
  res.json({ branches: results });
});
});



// Route for retrieving a specific branch by Name
app.get('/api/branches/:name', (req, res) => {
const Name  = req.params.name;

// This endpoint fetches a specific branch by Name from the database
db.query('SELECT * FROM branches WHERE name = ?', [Name], (err, results) => {
  if (err) {
    console.error('Error fetching branch:', err);                                       //Endpoint works
    return res.status(500).json({ error: 'Failed to fetch branch' });
  }
  if (results.length === 0) {
    return res.status(404).json({ error: 'Branch not found' });
  }
  res.json({ branch: results[0] });
});
});

  

//Route for updating a branch by ID
app.put('/api/branches/:id', (req, res) => {
  const branchId = req.params.id;
  const {name,city,state,address,latitude,longitude,operating_hours } = req.body;

  // Update the branch record in the database
  db.query('UPDATE branches SET name = ? ,city = ? ,state= ? ,address = ? ,latitude = ? ,longitude = ? ,operating_hours = ?  WHERE id = ?',
    [name,city,state,address,latitude,longitude,operating_hours, branchId],
    (err, result) => {
      if (err) {
        console.error('Error updating branch:', err);
        return res.status(500).json({ error: 'Failed to update branch' });            //Endpoint Works well
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Branch not found' });
      }
      res.json({ message: 'Branch updated successfully' });
    });
});



//


// Route for deleting a branch by ID
app.delete('/api/branches/:id', (req, res) => {
  const branchId = req.params.id;

  // Delete the branch record from the database
  db.query('DELETE FROM branches WHERE id = ?', [branchId], (err, result) => {
    if (err) {
      console.error('Error deleting branch:', err);
      return res.status(500).json({ error: 'Failed to delete branch' });
    }                                                                                 //Endpoint works
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json({ message: 'Branch deleted successfully' });
  });
});



//   app.get('/atms', (req, res) => {
//     db.query('SELECT * FROM atms', (err, results) => {
//       if (err) {
//         console.error('Error fetching ATM data:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//       } else {
//         res.json(results);
//       }
//     });
//   });
 
  }
});


app.listen(3000,(err)=>{
  if(err) {
    console.log(err)
  }
  else{
    console.log("on port 3000"); 
  }
});