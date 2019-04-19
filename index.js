var express = require('express');
var bp = require('body-parser');
var mv = require('mv');
var fmdb = require('formidable');
var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

var app = express();

const mongoptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    poolSize: 100,
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4 
};

// var con = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'dbpemilu-rebuild'
// });

var url = 'mongodb://127.0.0.1:27017/Pemilu';

app.use(express.static(__dirname));
app.use(bp.json());
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTION');
    next();
});

app.get('/', function(req,res){
    console.log("Access website --> main.html");    
    res.sendFile(__dirname+'/main.html');
});

app.get('/lserv', function(req, res){
    console.log("Access website --> /server/login.html");
    res.sendFile(__dirname+'/server/login.html');
});

app.get('/lclie', function(req, res){
    console.log("Access website --> /client/login.html");
    res.sendFile(__dirname+'/client/login.html');
});

app.get('/sserv', function(req, res){
    console.log("Access website --> /server/signup.html");
    res.sendFile(__dirname+'/server/signup.html');
});

app.get('/dserv', function(req, res){
    console.log("Access website --> /server/dashboard.html");
    res.sendFile(__dirname+'/server/dashboard.html');
});

app.get('/dclie', function(req,res){
    console.log("Access website --> /client/choose.html");
    res.sendFile(__dirname+"/client/choose.html");
});

app.get('/vot', function(req, res){
    console.log("Access website --> /server/vot.html");
    res.sendFile(__dirname+"/server/vot.html");
});

app.get('/cd', function(req,res){
    console.log("Access website --> /client/code.html");
    res.sendFile(__dirname+"/client/code.html");
});

app.post('/server/api/load', function(req, res){
    var param = req.body.nama_server;
    if(param != ""){
        mongo.connect(url, {useNewUrlParser: true}, mongoptions , function(err, konek){
            if(err) throw err;
            var data = {
                Server_Code : param
            }
            konek.db('Pemilu').collection('Kandidat').find(data).toArray(function(err, row){
                if(err) res.send('DROP');
                else{
                    res.send(row);
                }
                konek.close();
            });
        });
    }
});

app.post('/server/api/addv', function(req, res){
    var server = req.body.serv;
    var qty = req.body.qty;
    if(qty > 0){
        mongo.connect(url, {useNewUrlParser:true}, mongoptions, function(err, konek){
            if(err) throw err;
            else{
                for(let i = 0; i <= (qty-1); i++){
                    var data = {
                        _id: new ObjectId(),
                        Server_Code: server,
                        Status: 'on',
                    }
                    konek.db('Pemilu').collection('Pemilih').insertMany([data]);
                }
                konek.close();
                res.send('done');
            }
        });
    }else{
        res.send('Not below zero');
    }
});

app.post('/server/api/svot', function(req, res){
    var server = req.body.serv;
    var param = {
        Server_Code: server,
    }
    if(server == undefined){
        res.send('empty');
    }else{
        mongo.connect(url, {useNewUrlParser: true}, mongoptions, function(err, konek){
            if(err) throw err;
            else{
                konek.db('Pemilu').collection('Pemilih').find(param).toArray(function(err, row){
                    if(err) throw err;
                    else{
                        if(row == ""){
                            res.send('bug');
                        }else{
                            res.send(row);
                        }
                    }
                    konek.close();
                });
            }
        });
    }
});

app.get('/server/api/getv/:serv', function(req, res){
    let server = req.params.serv;
    console.log(server);
    if(server != ""){
        mongo.connect(url, {useNewUrlParser:true}, mongoptions, function(err, konek){
            if(err) throw err;
            else{
                konek.db('Pemilu').collection('Pemilih').countDocuments({Server_Code: server}).then(function(banyakdata){
                    res.send((banyakdata).toString());
                });
                konek.close();
            }
        });
    }else{
        res.send('server null');
    }
});

app.post('/server/api/is', function(req, res){
    var id = req.body.id;
    var serv = req.body.serv;
    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err) console.log("Problem detected from row : 165"); 
        var data = {
            _id: new ObjectId(id),
            Server_Code: serv
        }
        konek.db('Pemilu').collection('Kandidat').find(data).toArray(function(err, row){
            if(err) res.send('DROP');
            else{
                res.send(row);
            }
            konek.close();
        });
    });
});

app.put('/server/api', function(req, res){
    
    var id = req.body.id;
    var serv = req.body.serv;
    
    var upn = req.body.upn;
    var upv = req.body.upv;
    var upm = req.body.upm;

    var update = {
        $set:{
            Nama:upn,
            Visi:upv,
            Misi:upm
        }
    }

    var kondisi = {
        _id: new ObjectId(id),
        Server_Code: serv
    }

    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err) throw err;
        konek.db('Pemilu').collection('Kandidat').updateMany(kondisi, update, function(err){
            if(err) res.send('DROP');
            else{
                res.send('DONE');
            }
            konek.close();
        });
    });

});
    
app.delete('/server/api', function(req, res){
    var id = req.body.id;
    var serv = req.body.serv;
    var data = {
        _id: new ObjectId(id),
        Server_Code:serv,
    }
    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err) throw err;
        else{
            konek.db('Pemilu').collection('Kandidat').deleteOne(data, function(err){
                if(err) res.send('DROP');
                else{
                    res.send('DONE')
                }
                konek.close();
            });
        }
    });
});

app.post('/server/api', function(req, res){
    var Res_NewServer = req.body.Req_NewServer;

    if(Res_NewServer == ""){
        
        res.send('PLEASE INSERT CODE SERVER FIRST');
    
    }else{        
        var Insert = {
            Server_Code: Res_NewServer,
            Status: 'off'
        }
    
        var Select = {
            Server_Code: Res_NewServer
        }
        mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
            if(err) throw err;
            else{
                konek.db('Pemilu').collection('Server').find(Select).toArray(function(err, row){
                    if(err) throw err;
                    else if(row == ""){
                        konek.db('Pemilu').collection('Server').insertOne(Insert, function(err){
                            if(err) res.send('INSERT DROP');
                            else{
                                res.send('INSERT DONE')
                            }
                            konek.close();
                        });
                    }else{
                        res.send('SERVER CODE IS ALREADY')
                    }
                });
            }
        });
    
    }
});


app.post('/server/api/in', function(req, res){
    var res_code = req.body.code;

    if(res_code == ""){
        
        res.send('PLEASE INSERT CODE SERVER FIRST');
    
    }else{
        var Select = {
            Server_Code: res_code
        }

        var Update = {
            $set:{
                Status: 'on'
            }
        }

        var kondisi = {
            Server_Code : res_code
        }

        mongo.connect(url, {useNewUrlParser: true}, mongoptions , function(err, konek){
            if(err) throw err;
            else{
                konek.db('Pemilu').collection('Server').find(Select).toArray(function(err, row){
                    if(err) throw err;
                    else if(row != ""){
                        row.forEach(function(d,i){
                            if(d.Status == 'off'){
                                konek.db('Pemilu').collection('Server').updateMany(kondisi, Update, function(err){
                                    if(err){
                                        res.send('UPDATE DROP');
                                    }else{
                                        res.send(d.Server_Code);
                                    }
                                    konek.close(); 
                                })
                            }else{
                                res.send("CODE SERVER ALREADY ACTIVATE"); 
                            }
                        });
                    }else{
                        res.send('SERVER CODE NOT AVAILABLE');
                    }
                });
            }
        });        

    }
});

app.post('/server/api/out', function(req, res){
    var req_serverName = req.body.code;
    var Update = {
        $set:{
            Status: 'off'
        }
    }
    var kondisi = {
        Server_Code: req_serverName
    }
    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err) throw err;
        else{
            konek.db('Pemilu').collection('Server').updateMany(kondisi, Update, function(err){
                if(err) res.send('UPDATE DROP');
                else{
                    res.send('UPDATE DONE'); 
                }
                konek.close();
            });
        }
    });
});

app.post('/client/api', function(req, res){
    var name = req.body.name;
    var visi = req.body.visi;
    var misi = req.body.misi;
    var server = req.body.profile;
    
    var Data = {
        Nama: name,
        Visi: visi,
        Misi: misi,
        Server_Code: server,
        Total: 0
    }
    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err) throw err;
        else{
            konek.db('Pemilu').collection('Kandidat').insertOne(Data, function(err){
                if(err) res.send('DROP');
                else{
                    res.send('DONE')
                }
                konek.close();
            });
        }
    });
});

app.put('/client/api', function(req, res){
    var file = req.body.file;
    var param =  req.body.param;
    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err) throw err;
        else{
            konek.db('Pemilu').collection('Kandidat').updateMany({Nama:param}, {$set: {Foto: file}}, function(err){
                if(err) res.send('DROP');
                else{
                    res.send('DONE');
                }
                konek.close();
            });
        }
    });
});

app.post('/client/api/u', function(req, res){
    var form = new fmdb.IncomingForm();
    form.parse(req, function(err, fileds, files){
        var oldpath = files.txtFile.path;
        var newpath = __dirname+'/upload/'+files.txtFile.name;
        mv(oldpath, newpath, function(err){
            if(err){console.log(err);}
            else{
                res.send('DONE');
            }
        });
    });
});

app.post('/client/api/ctkn', function(req, res){
    var serv = req.body.serv;
    var tkn = req.body.tkn;

    var select = {
        _id: new ObjectId(tkn),
        Server_Code:serv,
    }

    try {
        mongo.connect(url,{useNewUrlParser:true},mongoptions, function(err, konek){
            if(err) throw err;
            else{
                konek.db('Pemilu').collection('Pemilih').find(select).toArray(function(err, row){
                    if(err) throw err;
                    else{
                        if(row != ""){
                            row.forEach(function(d, i){
                                if(d.Server_Code == serv){
                                    if(d._id == tkn){
                                        res.send(d._id);
                                    }else{
                                        res.send('Token not avalaible');
                                    }
                                }else{
                                    res.send('Server not avalaible');
                                }
                            });
                        }else{
                            res.send('Empty');
                        }
                    }
                });
            }
        });   
    } catch (error) {
        
    }
});

app.delete('/client/api/dvot', function(req, res){
    
    var tkn = req.body.tkn;

    var hapus = {
        _id: new ObjectId(tkn),
    }

    mongo.connect(url, {useNewUrlParser: true}, mongoptions, function(err, konek){
        if(err) throw err;
        else{
            konek.db('Pemilu').collection('Pemilih').deleteOne(hapus, function(err){
                if(err) throw err;
                else{
                    res.send('Berhasil');
                }
            });
        }
    });
});

app.post('/client/api/in', function(req, res){
    var reqdataServer = req.body.dataClient;
    
    var select = {
        Server_Code: reqdataServer
    }
    
    if(reqdataServer != ""){
        mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
            if(err) throw err;
            else{
                konek.db('Pemilu').collection('Server').find(select).toArray(function(err, row){
                    if(err) res.send('ROW DROP');
                    else{
                        if(row != ""){
                            row.forEach(function(d, i){
                                if(d.Status == 'on'){
                                    res.send(d.Server_Code);
                                }else{
                                    res.send('YOUR SERVER NOT ACTIVATE');
                                }
                                konek.close();
                            });
                        }else{
                            res.send('YOUR SERVER NOT AVALAIBLE');
                        }
                    }
                });
            }
        });
    }else{
        res.send('PLEASE INSERT YOUR SERVER CODE');
    }
});

app.get('/client/api/dsc', function(req, res){
    var reqDataCodeServer = req.body.data_codeserver_Kandidat;
    var select = {
        Server_Code: reqDataCodeServer
    }
    if(reqDataCodeServer != ""){
        mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
            if(err) throw err;
            else{
                konek.db('Pemilu').collection('Kandidat').find(select).toArray(function(err, row){
                    if(err) res.send('DROP');
                    else{
                        if(row != ""){
                            res.send(row);
                        }else{
                            res.send('EMPTY');
                        }
                    }
                    konek.close();
                });
            }
        });
    }else{

    }
});

app.put('/client/api/choose', function(req, res){
    var reqid = req.body.id;
    var reqserv = req.body.serv;

    var param = {
        _id: new ObjectId(reqid),
        Server_Code: reqserv,
    }

    mongo.connect(url, {useNewUrlParser: true}, mongoptions, function(err, konek){
        if(err) throw err;
        else{
            
            konek.db('Pemilu').collection('Kandidat').find(param).toArray(function(err,row){
                if(err) throw err;
                else{
                    if(row != ''){  
                        
                        row.forEach(function(d,i){

                            var update = {
                                $set:{
                                    Total: d.Total + 1
                                }
                            }

                            konek.db('Pemilu').collection('Kandidat').updateMany(param, update, function(err){
                                if(err) res.send('DROP');
                                else{
                                    res.send('DONE');
                                }
                                konek.close();
                            });

                        });
                    }else{
                        res.send('Failed to load your candidate');
                    }
                }
            });
        }
    });
});

app.listen(8080, function(){
    console.log('Server Memulai.');
    console.log('SERVER : http://localhost:8080/');
    mongo.connect(url, {useNewUrlParser: true}, mongoptions , function(err){
        if(err) console.log('Koneksi database mengalami masalah :(\n');
        else{
            console.log('Koneksi database terhubung dengan baik :)\n');
        }
    });
});