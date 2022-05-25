var http = require('http');
var fs = require('fs');
var express = require('express');
const app = express();
const port = 9000;

app.get('/bin/blog_files', (req, res) => {

	let files = [];
	fs.readdirSync('/home/xasty/html/blog/').forEach(file => {
   	 	files.push(file);
	});
	res.send(JSON.stringify(files));
});

app.get('/bin/game', (req, res) => {
	res.sendFile('/home/xasty/bin/game.html');
});

app.post('/bin/login', (req, res) => {
        req.setEncoding('utf8');
        req.on('data', chunk => {
	    if (chunk.split('=')[1] === 'mySecretSpace07') { 
                fs.readFile('/home/xasty/bin/login.html', (err, data) => {
		    if (err) throw err;
                    res.write(data);
                    res.end();
                });
            } else {
                res.write('login failed!');
                res.end();
            }
       	});
        req.on('end', () => {
        })
});

app.post('/bin/smokes', (req, res) => {
	let chunk; 
        req.setEncoding('utf8');
        req.on('data', c => { 
            chunk = c;
        });
        req.on('end', () => {
	    let smokes_url = '/home/xasty/html/smokes.json';
            let type = chunk.split('&')[0].split('=')[1];
            let importance = chunk.split('&')[1].split('=')[1];
	    const d = new Date();
            const today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
	    const time = d.getHours() + ":" + d.getMinutes();
            let all_smokes;
	    console.log(today, time);
            fs.readFile(smokes_url, (err, data) => {
                if (err) throw err;
                all_smokes = JSON.parse(data);
		console.log(all_smokes);
		if (all_smokes[today] === undefined) {
		    all_smokes[today] = {};
		}
		all_smokes[today][time] = [type, importance];
		//res.write(type + " " + importance + " " + JSON.stringify(all_smokes) + " "); 
		fs.writeFile(smokes_url, JSON.stringify(all_smokes), 'utf8' , function (err) {
		    if (err) throw err;
		    fs.readFile('/home/xasty/bin/login.html', (err, data) => {
		        if (err) throw err;
	       	        res.write(data);
			res.end();
	            });
                })
            });
        });
});

app.listen(port, () => {
	console.log('Server listening on ' + port);
});


/*
// Create a server object
http.createServer(function (req, res) {
      
    // http header
    res.writeHead(200, {'Content-Type': 'text/html'}); 
      
    var url = req.url;
// get all blog files 
    if(url ==='/bin/blog_files') {
	let files = [];
	fs.readdirSync('/home/xasty/html/blog/').forEach(file => {
   	    files.push(file);
	});
	res.write(JSON.stringify(files));
        res.end(); 
// check password and send private page
    } else if (url === '/bin/login' && req.method === 'POST') {
        req.setEncoding('utf8');
        req.on('data', chunk => {
	    if (chunk.split('=')[1] === 'mySecretSpace07') { 
                fs.readFile('/home/xasty/bin/login.html', (err, data) => {
		    if (err) throw err;
                    res.write(data);
                    res.end();
                });
            } else {
                res.write('login failed!');
                res.end();
            }
       	});
        req.on('end', () => {
        })
// safe a new smoke to smokes.json
    } else if (url === '/bin/smokes' && req.method === 'POST') {
	let chunk; 
        req.setEncoding('utf8');
        req.on('data', c => { 
            chunk = c;
        });
        req.on('end', () => {
	    let smokes_url = '/home/xasty/html/smokes.json';
            let type = chunk.split('&')[0].split('=')[1];
            let importance = chunk.split('&')[1].split('=')[1];
	    const d = new Date();
            const today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
	    const time = d.getHours() + ":" + d.getMinutes();
            let all_smokes;
	    console.log(today, time);
            fs.readFile(smokes_url, (err, data) => {
                if (err) throw err;
                all_smokes = JSON.parse(data);
		console.log(all_smokes);
		if (all_smokes[today] === undefined) {
		    all_smokes[today] = {};
		}
		all_smokes[today][time] = [type, importance];
		//res.write(type + " " + importance + " " + JSON.stringify(all_smokes) + " "); 
		fs.writeFile(smokes_url, JSON.stringify(all_smokes), 'utf8' , function (err) {
		    if (err) throw err;
		    fs.readFile('/home/xasty/bin/login.html', (err, data) => {
		        if (err) throw err;
	       	        res.write(data);
			res.end();
	            });
                })
            });
        });
// anything else
    } else {
        res.write('Hello World!'); 
        res.end(); 
    }
}).listen(9000, function() {
      
    // The server object listens on port 3000
    console.log("server start at port 9000");
});
*/
