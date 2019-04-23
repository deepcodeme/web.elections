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
app.post('/server/api/in', function(req, res){
    var res_code = req.body.code;
    if(res_code == ""){     
        res.send('Insert code server first.');
        console.log("Website --> Have problem at log-in system.");
        console.log("API --> /server/api/in.");
        console.log("Explain Problem --> Can not get server code request.");
    }else{
        var Select = {Server_Code: res_code}
        var Update = {$set:{Status: 'on'}}
        var kondisi = {Server_Code : res_code}

        mongo.connect(url, {useNewUrlParser: true}, mongoptions , function(err, konek){
            if(err){
                console.log("Website --> Have problem at log-in system.");
                console.log("API --> /server/api/in.");
                console.log("Explain Problem --> Connection at mongodb is broke.");
            }
            else{
                konek.db('Pemilu').collection('Server').find(Select).toArray(function(err, row){
                    if(err){    
                        console.log("Website --> Have problem at log-in system.");
                        console.log("API --> /server/api/in.");
                        console.log("Explain Problem --> You have problem at syntax function 'find', Please check.");
                    }else{
                        if(row != ""){
                            row.forEach(function(d){
                                if(d.Status == 'off'){
                                    konek.db('Pemilu').collection('Server').updateMany(kondisi, Update, function(err){
                                        if(err){
                                            console.log("Website --> Have problem at log-in system.");
                                            console.log("API --> /server/api/in.");
                                            console.log("Explain Problem --> You have problem at syntax function 'update', Please check.");
                                            res.send("Log-in failed, please try again later.");
                                        }else{
                                            console.log("Website --> System log-in success.");
                                            console.log("API --> /server/api/in");
                                            console.log("Explain Problem --> System API success return data --> '"+d.Server_Code+"'.");
                                            res.send(d.Server_Code);
                                        } 
                                    })
                                }else{
                                    console.log("Website --> Have problem at log-in system.");
                                    console.log("API --> /server/api/in.");
                                    console.log("Explain Problem --> Server already activate on another places.");
                                    res.send("Server is already activate."); 
                                }
                            });
                        }else{
                            console.log("Website --> Have problem at log-in system.");
                            console.log("API --> /server/api/in.");
                            console.log("Explain Problem --> You have problem at syntax function 'find', Please check.");
                            res.send("Server not found.");
                        }
                    konek.close();
                    }
                });
            }
        });        
    }
});
app.get('/sserv', function(req, res){
    console.log("Access website --> /server/signup.html");
    res.sendFile(__dirname+'/server/signup.html');
});
app.post('/server/api', function(req, res){
    var ns = req.body.ns;
    if(ns == ""){
        res.send('Insert code server first');
        console.log("Website --> Have problem at sign-up system.");
        console.log("API --> POST: /server/api.");
        console.log("Explain Problem --> Can not get server code request.");
    }else{        
        var Insert = {Server_Code: ns, Status: 'off'}
        var Select = {Server_Code: ns}
        mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
            if(err){
                console.log("Website --> Have problem at sign-up system.");
                console.log("API --> POST: /server/api.");
                console.log("Explain Problem --> Connection at mongodb is broke.");
            }
            else{
                konek.db('Pemilu').collection('Server').find(Select).toArray(function(err, row){
                    if(err){
                        console.log("Website --> Have problem at sign-up system.");
                        console.log("API --> POST: /server/api.");
                        console.log("Explain Problem --> You have problem at syntax function 'find', please check.");
                    }else{
                        if(row == ""){
                            konek.db('Pemilu').collection('Server').insertOne(Insert, function(err){
                                if(err){
                                    res.send('Sign-up failed please try again later.');
                                    console.log("Website --> Have problem at sign-up system.");
                                    console.log("API --> POST: /server/api.");
                                    console.log("Explain Problem --> You have problem at syntax function 'insert', please check.");
                                }
                                else{
                                    res.send('Success');
                                    console.log("Website --> System sign-up success.");
                                    console.log("API --> POST: /server/api.");
                                    console.log("Explain --> System API success create new server --> '"+ns+"'.");
                                }
                            });
                        }else{
                            res.send('Server is already create');
                            console.log("Website --> Have problem at sign-up system.");
                            console.log("API --> POST: /server/api.");
                            console.log("Explain Problem --> You have problem at syntax function 'find', please check.");
                        }
                    konek.close();
                    }
                });
            }
        });
    }
});
app.post('/client/api/u', function(req, res){
    var form = new fmdb.IncomingForm();
    form.parse(req, function(err, fileds, files){
        var oldpath = files.txtFile.path;
        var newpath = __dirname+'/upload/'+files.txtFile.name;
        mv(oldpath, newpath, function(err){
            if(err){
                console.log("Website --> Have problem at upload photo system.");
                console.log("API --> /client/api/u.");
                console.log("Explain Problem --> You have problem at syntax upload, please check.");
            }
            else{
                res.send('Success send file photo.');
                console.log("Website --> System upload success.");
                console.log("API --> /client/api/u.");
                console.log("Explain --> System succes send file photo.");
            }
        });
    });
});
app.post('/client/api', function(req, res){
    var file = req.body.file;
    var name = req.body.name;
    var visi = req.body.visi;
    var misi = req.body.misi;
    var serv = req.body.serv;
    var insert = {
       Nama: name,
       Visi: visi,
       Misi: misi,
       Server_Code: serv,
       Total:0,
       Foto:file
    }
    mongo.connect(url, {useNewUrlParser:true}, mongoptions, function(err, konek){
        if(err){
            console.log("Website --> Connections with mongodb broke.");
            console.log("API --> POST: /client/api.");
            console.log("Explain Problem --> Have problem at connections mongodb");
        }else{
            konek.db('Pemilu').collection('Kandidat').insertOne(insert, function(err){
                if(err){
                    console.log("Website --> Add candidate failed.");
                    console.log("API --> POST: /client/api.");
                    console.log("Explain Problem --> You have problem at syntax 'insert', please check");
                    res.send("Add candidate failed, try again later.");
                }else{
                    console.log("Website --> Add candidate success.");
                    console.log("API --> POST: /client/api.");
                    console.log("Explain --> System API add candidate success");
                    res.send("Add candidate success");
                }
            konek.close();
            });
        }
    });
});
app.get('/server/api/getv/:serv', function(req, res){
    var server = req.params.serv;
    if(server != ""){
        mongo.connect(url, {useNewUrlParser:true}, mongoptions, function(err, konek){
            if(err){
                console.log("Website --> Connection at mongoddb broke.");
                console.log("API --> /server/api/getv:serv");
                console.log("Explain Problem --> You have error at connection mongodb.");
            } 
            else{
                konek.db('Pemilu').collection('Pemilih').countDocuments({Server_Code: server}).then(function(banyakdata){
                    res.send((banyakdata).toString());
                    console.log("Website --> System count people voter success");
                    console.log("API --> /server/api/getv/:serv");
                    console.log("Explain --> System succes to count many data voter.");
                });
                konek.close();
            }
        });
    }else{
        console.log("Website --> Have problem serious.");
        console.log("API --> /server/api/getv/:serv");
        console.log("Expain Problem --> You have problem serois at check server.");
        res.send('Your server not avaible --> this bug please report to development');
    }
});
app.post('/server/api/addv', function(req, res){
    var server = req.body.serv;
    var qty = req.body.qty;
    if(qty > 0){
        mongo.connect(url, {useNewUrlParser:true}, mongoptions, function(err, konek){
            if(err){
                console.log("Website --> Connection mongodb broke.");
                console.log("API --> /server/api/addv");
                console.log("Explain Problem--> System connection mongodb broke, please check");
            }
            else{
                try {
                    for(var i = 0; i <= (qty-1); i++){
                        var data = {
                            _id: new ObjectId(),
                            Server_Code: server,
                            Status: 'on',
                        }
                        konek.db('Pemilu').collection('Pemilih').insertMany([data]);
                    }    
                } catch (error) {
                    console.log("Website --> Failed to insert many data");
                    console.log("API --> /server/api/addv");
                }
                konek.close();
                console.log("Website --> System add voter success");
                console.log("API --> /server/api/addv");
                console.log("Explain --> Success add "+qty+" people voter");
                res.send("Success insert many data");
            }
        });
    }else{
        console.log("Website --> Lots of input not suitable.");
        console.log("API --> /server/api/addv");
        console.log("Explain Problem --> The system detects of incoming data not suitable");
        res.send('Please check your lots of input');
    }
});
app.post('/server/api/svot', function(req, res){
    var server = req.body.serv;
    var param = {Server_Code: server,}
    if(server == undefined || server == null || server == ""){
        console.log("Website --> System not know about server undefined.");
        console.log("API --> /server/api/svot");
        console.log("Explain Problem --> You have problem at server undefined please check.");
        res.send("Your server is undefined, please try again with another way");
    }else{
        mongo.connect(url, {useNewUrlParser: true}, mongoptions, function(err, konek){
            if(err){
                console.log("Website --> Connection mongodb broke.");
                console.log("API --> /server/api/svot");
                console.log("Explain Problem--> System connection mongodb broke, please check");
            }
            else{
                konek.db('Pemilu').collection('Pemilih').find(param).toArray(function(err, row){
                    if(err){
                        console.log("Website --> Have problem at sytax function 'find', please check");
                        console.log("API --> /server/api/svot");
                        console.log("Expalain Problem --> You have problem at systax function 'find'");
                    }
                    else{
                        if(row == ""){
                            res.send("People voter is empty in your server please with another way");
                            console.log("Website --> Have problem at result function 'find', please check");
                            console.log("API --> /server/api/svot");
                            console.log("Expalain Problem --> You have problem at systax function 'find'");
                        }else{
                            res.send(row);
                            console.log("Website --> System success return data");
                            console.log("API --> /server/api/svot");
                            console.log("Expalain --> Your API success return data peoplel voter");
                        }
                    }
                konek.close();
                });
            }
        });
    }
});
app.post('/server/api/out', function(req, res){
    var req_serverName = req.body.code;
    var Update = {$set:{Status: 'off'}}
    var kondisi = {Server_Code: req_serverName}
    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err){
            console.log("Website --> Connection mongodb broke.");
            console.log("API --> /server/api/out");
            console.log("Explain Problem--> System connection mongodb broke, please check");
        }
        else{
            konek.db('Pemilu').collection('Server').updateMany(kondisi, Update, function(err){
                if(err){
                    console.log("Website --> Have problem at sytax function 'update', please check");
                    console.log("API --> /server/api/out");
                    console.log("Expalain Problem --> You have problem at systax function 'update'");
                    res.send("System failed to update");
                }
                else{
                    console.log("Website --> System success run 'update' function");
                    console.log("API --> /server/api/out");
                    console.log("Expalain --> Your system API success to run funtcion 'update'");
                    res.send("Success");
                }
                konek.close();
            });
        }
    });
});
app.post('/server/api/load', function(req, res){
    var param = req.body.nama_server;
    var data = {Server_Code : param}
    if(param != ""){
        mongo.connect(url, {useNewUrlParser: true}, mongoptions , function(err, konek){
            if(err){
                console.log("Website --> Connection mongodb broke.");
                console.log("API --> /server/api/load");
                console.log("Explain Problem--> System connection mongodb broke, please check");
            }
            konek.db('Pemilu').collection('Kandidat').find(data).toArray(function(err, row){
                if(err){
                    console.log("Website --> Have problem at sytax function 'find', please check");
                    console.log("API --> /server/api/load");
                    console.log("Expalain Problem --> You have problem at systax function 'find'");
                    res.send("Failed to load candidate");
                }
                else{
                    console.log("Website --> System success return data candidate");
                    console.log("API --> /server/api/load");
                    console.log("Explain --> Your API system success return data candidate");
                    res.send(row);
                }
                konek.close();
            });
        });
    }else{
        console.log("Website --> Have error serious --> bug");
        console.log("API --> /server/api/load");
        console.log("Explain Problem--> System can not get server code");
        res.send("Failed to load candidate, try again with another way --> this bug please report to developer");
    }
});
app.post('/server/api/is', function(req, res){
    var id = req.body.id;
    var serv = req.body.serv;
    var data = { _id: new ObjectId(id), Server_Code: serv }
    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err){
            console.log("Website --> Connection mongodb broke.");
            console.log("API --> /server/api/is");
            console.log("Explain Problem--> System connection mongodb broke, please check");
        }else{
            konek.db('Pemilu').collection('Kandidat').find(data).toArray(function(err, row){
                if(err){
                    console.log("Website --> Failed to return data profile candidate.");
                    console.log("API --> /server/api/is");
                    console.log("Explain Problem--> You have problem in syntax function 'find', please check");
                    res.send("Failed to return data profile candidate");
                }
                else{
                    console.log("Website --> Success return data profle candidate");
                    console.log("API --> /server/api/is");
                    console.log("Explain --> System API success return profile candidate");
                    res.send(row);
                }
                konek.close();
            });
        } 
    });
});
app.put('/server/api', function(req, res){ 
    var id   = req.body.id;
    var serv = req.body.serv;
    var upn  = req.body.upn;
    var upv  = req.body.upv;
    var upm  = req.body.upm;
    var update = {$set:{Nama:upn,Visi:upv,Misi:upm}};
    var kondisi = { _id: new ObjectId(id), Server_Code: serv};
    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err){
            console.log("Website --> Connection mongodb broke.");
            console.log("API --> PUT: /server/api");
            console.log("Explain Problem--> System connection mongodb broke, please check");
        }
        else{
            konek.db('Pemilu').collection('Kandidat').updateMany(kondisi, update, function(err){
                if(err){
                    res.send("Failed to update data profile candidate.");
                }
                else{
                    res.send('Success');
                }
                konek.close();
            });
        }
    });
});
app.delete('/server/api', function(req, res){
    var id = req.body.id;
    var serv = req.body.serv;
    var data = { _id: new ObjectId(id), Server_Code:serv,}
    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err){
            console.log("Website --> Connection mongodb broke.");
            console.log("API --> DELETE: /server/api");
            console.log("Explain Problem--> System connection mongodb broke, please check");
        }
        else{
            konek.db('Pemilu').collection('Kandidat').deleteOne(data, function(err){
                if(err){res.send("Failed to delete profile candidate.");}
                else{res.send('Success')}
                konek.close();
            }); 
        }
    });
});
app.post('/client/api/in', function(req, res){
    var reqdataServer = req.body.dataClient; 
    var select = {Server_Code: reqdataServer}
    if(reqdataServer != ""){
        mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
            if(err){
                console.log("Website --> Connection mongodb broke.");
                console.log("API --> client/api/in");
                console.log("Explain Problem--> System connection mongodb broke, please check");
            }
            else{
                konek.db('Pemilu').collection('Server').find(select).toArray(function(err, row){
                    if(err){ res.send("Failed to sig-in please try again later.");}
                    else{
                        if(row != ""){
                            row.forEach(function(d, i){
                                if(d.Status == 'on'){
                                    res.send(d.Server_Code);
                                }else{
                                    res.send('System server not active now.');
                                }
                            });
                        }else{res.send('Server code not avalaible.');}
                    }
                    konek.close();
                });
            }
        });
    }else{res.send('Please insert first your server code.');}
});
app.post('/client/api/ctkn', function(req, res){
    var serv = req.body.serv;
    var tkn = req.body.tkn;
    var select = { _id: new ObjectId(tkn), Server_Code:serv,}
    mongo.connect(url,{useNewUrlParser:true},mongoptions, function(err, konek){
        if(err){
            console.log("Website --> Connection mongodb broke.");
            console.log("API --> client/api/ctkn");
            console.log("Explain Problem--> System connection mongodb broke, please check");
        }
        else{
            konek.db('Pemilu').collection('Server').find({Server_Code:serv}).toArray(function(err, row){
                if(err){
                    console.log("Website --> Failed to return data server.");
                    console.log("API --> /client/api/ctkn");
                    console.log("Explain Problem--> You have problem in syntax function 'find', please check");
                }else{
                    row.forEach(function(d){
                        if(d.Status == 'on'){
                            konek.db('Pemilu').collection('Pemilih').find(select).toArray(function(err, row){
                                if(err){
                                    console.log("Website --> Failed to return data voter.");
                                    console.log("API --> /client/api/ctkn");
                                    console.log("Explain Problem--> You have problem in syntax function 'find', please check");
                                    res.send("Failed to return data voter.");
                                }
                                else{
                                    if(row != ""){
                                        row.forEach(function(d){
                                            if(d.Server_Code == serv){
                                                if(d._id == tkn){res.send(d._id);}
                                                else{res.send('Code Token not avalaible.');}
                                            }else{res.send('Code token not suitable with your server code.');}
                                        });
                                    }else{res.send('Your server not have voter, confirm to server.');}
                                }
                            });
                        }else{
                            res.send("Your server not activate please check.");
                        }
                    });
                }
            });
        }
    });
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
app.put('/client/api/choose', function(req, res){
    var reqid   = req.body.id;
    var reqserv = req.body.serv;
    var param = {_id: new ObjectId(reqid), Server_Code: reqserv};
    mongo.connect(url, {useNewUrlParser: true}, mongoptions, function(err, konek){
        if(err){
            console.log("Website --> Connection mongodb broke.");
            console.log("API --> client/api/choose");
            console.log("Explain Problem--> System connection mongodb broke, please check");
        }
        else{
            konek.db('Pemilu').collection('Server').find({Server_Code:reqserv}).toArray(function(err, row){
                if(err){
                    console.log("Website --> Failed to return data server.");
                    console.log("API --> /client/api/choose");
                    console.log("Explain Problem--> You have problem in syntax function 'find', please check");
                }else{
                    row.forEach(function(d){
                        if(d.Status == 'on'){
                            konek.db('Pemilu').collection('Kandidat').find(param).toArray(function(err,row){
                                if(err){
                                    console.log("Website --> Failed to return data voter.");
                                    console.log("API --> /client/api/choose");
                                    console.log("Explain Problem--> You have problem in syntax function 'find', please check");
                                }
                                else{
                                    if(row != ''){
                                        row.forEach(function(d){
                                            var update = {$set:{ Total: d.Total + 1}}
                                            konek.db('Pemilu').collection('Kandidat').updateMany(param, update, function(err){
                                            if(err){
                                                res.send("Failed to choose candidate please try again.");
                                            }
                                            else{
                                                res.send('Success');
                                            }
                                            konek.close();
                                            });
                                        });
                                    }else{
                                        res.send('Your token code not suitable.');
                                    }
                                }
                            });
                        }else{
                            res.send("Your server system not activate please check your server.");
                        }
                    });
                }
            });
        }
    });
});
app.delete('/client/api/dvot', function(req, res){ 
    var tkn = req.body.tkn;
    var hapus = {_id: new ObjectId(tkn),};
    mongo.connect(url, {useNewUrlParser: true}, mongoptions, function(err, konek){
        if(err){
            console.log("Website --> Connection mongodb broke.");
            console.log("API --> client/api/dvot");
            console.log("Explain Problem--> System connection mongodb broke, please check");
        }
        else{
            konek.db('Pemilu').collection('Pemilih').deleteOne(hapus, function(err){
                if(err){
                    console.log("Website --> Failed to delete data voter.");
                    console.log("API --> /client/api/dvot");
                    console.log("Explain Problem--> You have problem in syntax function 'delete', please check");
                    res.send("Failed delete data voter.");
                }
                else{
                    res.send('Success');
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