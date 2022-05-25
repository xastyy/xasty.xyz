var http = require('http');
const NFTs = require('@primenums/solana-nft-tools');
const web3 = require("@solana/web3.js");
const fs = require('fs')
/*
const server = http.createServer(function (req, res) {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
//	res.write(mints);
	res.end('Hello World!');
})
server.listen(9000, '0.0.0.0', () => {
	console.log('server running!');
});
*/

//https://stackoverflow.com/questions/49885609/http-createserver-onrequest-async-await-functions

const server = http.createServer();
server.on('request', async (req, res) => {
    console.log('Request begin:');
    if (req.url == '/reload') {
        const conn = new web3.Connection(
            web3.clusterApiUrl('mainnet-beta'),
            'confirmed'
        )
        let mints = await NFTs.getMintTokensByOwner(conn, "2aWEF8FjmEXEEjpZJPUEwyzsFUMyZBZdRutyHioidsuH");
        console.log(mints.length)
        let my_nfts = [];
        for (let x in mints) {
            //let accinfo = await conn.getBalanceAndContext(new web3.PublicKey(mints[x]));
            //console.log(accinfo);
            try {
                const one_nft = await NFTs.getNFTByMintAddress(conn, mints[x])
                console.log(one_nft.name);
                //console.log(one_nft);
                if (one_nft.owner == "2aWEF8FjmEXEEjpZJPUEwyzsFUMyZBZdRutyHioidsuH") {
                    my_nfts.push(one_nft);
                    //res.write(one_nft.name);
                    //res.write('\n');
                }
            } catch(err) {
                console.log(err.messsage);
            }
            await new Promise(r => setTimeout(r, 250)); //sleep  sec
        }
        console.log(my_nfts);
        try {
            fs.writeFileSync('/home/xasty/bin/test.txt', JSON.stringify(my_nfts));
            console.log('Wrote File!');
          //file written successfully
        } catch (err) {
            console.error(err);
        }
    } else {
        try {
            const data = fs.readFileSync('/home/xasty/bin/test.txt', 'utf8');
            //console.log(data);
            const obt_nfts = JSON.parse(data);
            //res.write(JSON.stringify(obt_nfts[0]));
            var html = buildHtml(obt_nfts);
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Content-Length': html.length,
                'Expires': new Date().toUTCString()
            });
            res.end(html);
        } catch (err) {
            console.error(err)
        }
    }
    //res.write('\n');
    console.log(req.url);
    //res.end('EOF');
    });

server.listen(9000)

function buildHtml(req) {
    var header = '<title>xastys Wallet</title>' +
                 '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">';
    var body = '';
    
    req.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)); //sort by name
    for (let x in req) {
        body = body.concat("<h1>", req[x].name, "</h1>");
        body = body.concat('<img src="', req[x].image ,'" class="img-fluid">');
    }

    return '<!DOCTYPE html>' + '<html><head>' + header + '</head><body>' + body + '</body></html>';
};
