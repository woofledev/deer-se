const express = require('express'),
      spagent = require('superagent'),
      sqlite3 = require('sqlite3').verbose(),
      port = 80, // change this if needed
      app = express();

// configure express
app.use('/assets', express.static(__dirname+'/public'));
app.use( require('body-parser').urlencoded({ extended: true }) );

// db init
var db = new sqlite3.Database("app.db", (e) => {
    if (e) {
        return console.error(e.message);
    }
    console.log('db connected');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS urls (
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        desc TEXT NOT NULL
    )`);
});


// API
app.post('/api/addpage', async (req,res) => {
    const { url, recrawl } = req.body;
    const fakeUA = 'Mozilla 5.0 (DeerSE-crawler/1.0)';
    
    try {
        var urlexists = await new Promise((resolve, reject) => {
            db.get('SELECT url FROM urls WHERE url = ?', [url], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        if (urlexists && !recrawl) {
            return res.status(200).json({ message: "URL already exists in the database." });
        }

        var resp = await spagent.get(url).set('User-Agent', fakeUA).redirects(1);
        var $ = require('cheerio').load(resp.text);

        let title = $('title').text().trim();
        if (!title) {
            title = url;
        }

        let desc = $('meta[name="description"]').attr('content');
        if (!desc) {
            desc = 'This site has no description.';
        }


        if (urlexists){
            db.run('UPDATE urls SET title = ?, desc = ? WHERE url = ?', [title, desc, url], (e) => {
                if (e) {
                    return res.status(500).json({ message: "Unable to recrawl." });
                }
                return res.status(200).json({ message: "Site has been recrawled." });
            });
        }else{
            db.run('INSERT INTO urls (url, title, desc) VALUES (?, ?, ?)', [url, title, desc], (e) => {
                if (e) {
                    return res.status(500).json({message: "Unable to save to the database."});
                }
                return res.status(200).json({message: "Site has been added."});
            });
        }

    } catch (e) {
        return res.status(500).json({message: "An error occurred. Is the site down?"});
    }
});

app.post('/api/query', async (req, res) => {
    const { q, page } = req.body;
    const queries = 25; // queries per page
    const current = page && parseInt(page) > 0 ? parseInt(page) : 1;

    if (!q || /^\s*$/.test(q)) {
        return res.status(400).json({message: "No/invalid 'q' field provided"});
    }
    
    const off = (current - 1) * queries;
    db.all(`SELECT url, COALESCE(title, url) as title, COALESCE(desc, "This site has no description.") as desc FROM urls
            WHERE title LIKE ? OR desc LIKE ? LIMIT ? OFFSET ?`, [`%${q}%`, `%${q}%`, queries, off],
            (e, rows) => {
                if (e) {
                    return res.status(500).json({message: "An error occurred while querying."});
                }
                return res.status(200).json(rows);
    });
});


// frontend
app.get('/', (req, res) => {
    return res.sendFile(__dirname+'/pages/index.html');
});

app.get('/addpage', (req, res) => {
    return res.sendFile(__dirname+'/pages/addpage.html');
});

app.get('/search', (req, res) => {
    return res.sendFile(__dirname+'/pages/results.html');
});



app.listen(port, () => {
    console.log(`listening on port ${port}`);
});