const express =require("express");
const bodyParser = require("body-parser")

const mysql = require("mysql2");

const app = express();

//app.use(express.static("./app/public"));
app.use(express.static("public"));


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


app.get("/",function(req,res){
res.sendFile(__dirname + "/index.html");
});
app.post("/",function(req,res){



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
 
});



app.listen(3000,(err)=>{
  if(err) {
    console.log(err)
  }
  else{
    console.log("on port 3000"); 
  }
});