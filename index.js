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
        console.log("POST:/server/api/in => Insert code server first");
    }else{
        var Select = {Server_Code: res_code}
        var Update = {$set:{Status: 'on'}}
        var kondisi = {Server_Code : res_code}

        mongo.connect(url, {useNewUrlParser: true}, mongoptions , function(err, konek){
            if(err){
                console.log("POST:/server/api/in => Have error with mongodb connections");
            }
            else{
                konek.db('Pemilu').collection('Server').find(Select).toArray(function(err, row){
                    if(err){    
                        console.log("POST:/server/api/in => Have error with query 'select'");
                    }else{
                        if(row != ""){
                            row.forEach(function(d){
                                if(d.Status == 'off'){
                                    konek.db('Pemilu').collection('Server').updateMany(kondisi, Update, function(err){
                                        if(err){
                                            console.log("POST:/server/api/in => Log-in failed.");
                                            res.send("Log-in failed, please try again later.");
                                        }else{
                                            console.log("POST:/server/api/in => Success login with server code --> "+d.Server_Code);
                                            res.send(d.Server_Code);
                                        } 
                                    })
                                }else{
                                    console.log("POST:/server/api/in => Server is already activate.");
                                    res.send("Server is already activate."); 
                                }
                            });
                        }else{
                            console.log("POST:/server/api/in => Server not found.");
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
        console.log("POST:/server/api => Insert code first.");
    }else{        
        var Insert = {Server_Code: ns, Status: 'off'}
        var Select = {Server_Code: ns}
        mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
            if(err){
                console.log("POST:/server/api => Have error with mongodb connetions.");
            }
            else{
                konek.db('Pemilu').collection('Server').find(Select).toArray(function(err, row){
                    if(err){
                        console.log("POST:/server/api => Have error with query 'select'");
                    }else{
                        if(row == ""){
                            konek.db('Pemilu').collection('Server').insertOne(Insert, function(err){
                                if(err){
                                    res.send('Sign-up failed please try again later.');
                                    console.log("POST:/server/api => Sign-up failed.");
                                }
                                else{
                                    res.send('Success');
                                    console.log("POST:/server/api => Success sign-up with new server code --> "+ns);
                                }
                            });
                        }else{
                            res.send('Server is already create');
                            console.log("POST:/server/api => Server is already create.");
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
                console.log("POST:/client/api/u => Have problem with snytax upload");
            }
            else{
                res.send('Success send file photo.');
                console.log("POST:/client/api/u => Success send file photo with name --> "+files.txtFile.name);
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
            console.log("POST:/client/api => Have error with mongodb connections.");
        }else{
            konek.db('Pemilu').collection('Kandidat').insertOne(insert, function(err){
                if(err){
                    console.log("POST:/client/api => Add candidate failed.");
                    res.send("Add candidate failed, try again later.");
                }else{
                    console.log("POST:/client/api => Add candidate success with name --> "+name);
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
                console.log("GET:/server/api/getv/:serv => Have problem with mongodb connetions");
            } 
            else{
                konek.db('Pemilu').collection('Pemilih').countDocuments({Server_Code: server}).then(function(banyakdata){
                    res.send((banyakdata).toString());
                    console.log("GET:/server/api/getv/:serv => Success add voter as much --> "+banyakdata.toString());
                });
                konek.close();
            }
        });
    }else{
        console.log("GET:/server/api/getv/:serv => serious problem this bug.");
        res.send('Your server not avaible --> this bug please report to development');
    }
});
app.post('/server/api/addv', function(req, res){
    var server = req.body.serv;
    var qty = req.body.qty;
    if(qty > 0){
        mongo.connect(url, {useNewUrlParser:true}, mongoptions, function(err, konek){
            if(err){
                console.log("POST:/server/api/addv => Have problem with mongodb connetions");
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
                    console.log("POST:/server/api/addv => Have error at add voter.");
                }
                konek.close();
                console.log("POST:/server/api/addv => Success add voter as much --> "+qty);
                res.send("Success insert many data");
            }
        });
    }else{
        console.log("POST:/server/api/addv => Lots of input <= 0");
        res.send('Please check your lots of input');
    }
});
app.get('/server/api/svot', function(req, res){
    var server = req.body.serv;
    var param = {Server_Code: server,}
    if(server == undefined || server == null || server == ""){
        console.log("GET:/server/api/svot => Server code is undefined");
        res.send("Your server is undefined, please try again with another way");
    }else{
        mongo.connect(url, {useNewUrlParser: true}, mongoptions, function(err, konek){
            if(err){
                console.log("GET:/server/api/svot => Have problem with mongodb connetions");
            }
            else{
                konek.db('Pemilu').collection('Pemilih').find(param).toArray(function(err, row){
                    if(err){
                        console.log("GET:/server/api/svot => Have problem at query 'select'");
                    }
                    else{
                        if(row == ""){
                            res.send("People voter is empty in your server please with another way");
                            console.log("GET:/server/api/svot => People voter is empty.");
                        }else{
                            res.send(row);
                            console.log("GET:/server/api/svot => Success return data voter --> ");
                            console.log(row+"\n");
                        }
                    }
                konek.close();
                });
            }
        });
    }
});
app.put('/server/api/out', function(req, res){
    var req_serverName = req.body.code;
    var Update = {$set:{Status: 'off'}}
    var kondisi = {Server_Code: req_serverName}
    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err){
            console.log("PUT:/server/api/out => Have error with mongodb connetions");
        }
        else{
            konek.db('Pemilu').collection('Server').updateMany(kondisi, Update, function(err){
                if(err){
                    console.log("PUT:/server/api/out => Log-out failed.");
                    res.send("System failed to update");
                }
                else{
                    console.log("PUT:/server/api/out => Success log-out server code --> "+req_serverName);
                    res.send("Success");
                }
                konek.close();
            });
        }
    });
});
app.get('/server/api/load/:nama_server', function(req, res){
    var param = req.params.nama_server;
    var data = {Server_Code : param}
    if(param != ""){
        mongo.connect(url, {useNewUrlParser: true}, mongoptions , function(err, konek){
            if(err){
                console.log("GET:/server/api/load => Have error with mongodb connections.");
            }
            konek.db('Pemilu').collection('Kandidat').find(data).toArray(function(err, row){
                if(err){
                    console.log("GET:/server/api/load => Have error with query 'select'.");
                    res.send("Failed to load candidate");
                }
                else{
                    console.log("GET:/server/api/load => Successfully return data candidate.");
                    console.log("\n"+JSON.stringify(row)+"\n");
                    res.send(row);
                }
                konek.close();
            });
        });
    }else{
        console.log("GET:/server/api/load => Serious problem this bug.");
        res.send("Failed to load candidate, try again with another way --> this bug please report to developer");
    }
});
app.get('/server/api/is', function(req, res){
    var id = req.body.id;
    var serv = req.body.serv;
    var data = { _id: new ObjectId(id), Server_Code: serv }
    mongo.connect(url, {useNewUrlParser: true},mongoptions , function(err, konek){
        if(err){
            console.log("GET:/server/api/is => Have problem with mongodb connetions.");
        }else{
            konek.db('Pemilu').collection('Kandidat').find(data).toArray(function(err, row){
                if(err){
                    console.log("GET:/server/api/is => Return data candidate failed.");
                    res.send("Failed to return data profile candidate");
                }
                else{
                    console.log("GET:/server/api/is => Return data candidate success.");
                    console.log("\n"+JSON.stringify(row)+"\n");
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
            console.log("PUT:/server/api => Have problem with mongodb connetions");
        }
        else{
            konek.db('Pemilu').collection('Kandidat').updateMany(kondisi, update, function(err){
                if(err){
                    console.log("PUT:/server/api => Failed to update profile data candidate.");
                    res.send("Failed to update data profile candidate.");
                }
                else{
                    console.log("PUT:/server/api => Success update profile data candidate.");
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
            console.log("DELETE:/server/api => Have problem with mongodb connetions");
        }
        else{
            konek.db('Pemilu').collection('Kandidat').deleteOne(data, function(err){
                if(err){
                    console.log("DELETE:/server/api => Failed to delete profile candidate.");
                    res.send("Failed to delete profile candidate.");
                }
                else{
                    console.log("DELETE:/server/api => Success detele profile candidate.");
                    res.send('Success')
                }
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
                console.log("POST:/client/api/in => Have problem with mongodb connetions.");
            }
            else{
                konek.db('Pemilu').collection('Server').find(select).toArray(function(err, row){
                    if(err){ 
                        console.log("POST:/client/api/in => Failed to client sig-in.");
                        res.send("Failed to sig-in please try again later.");}
                    else{
                        if(row != ""){
                            row.forEach(function(d, i){
                                if(d.Status == 'on'){
                                    console.log("POST:/client/api/in => Success client sig-in to server "+d.Server_Code);
                                    res.send(d.Server_Code);
                                }else{
                                    console.log("POST:/client/api/in => System server not activate.");
                                    res.send('System server not active now.');
                                }
                            });
                        }else{
                            console.log("POST:/client/api/in => Server code not avalible in client sig-in");
                            res.send('Server code not avalaible.');}
                    }
                    konek.close();
                });
            }
        });
    }else{
        console.log("POST:/client/api/in => Server code its empty in client sig-in");
        res.send('Please insert first your server code.');}
});
app.post('/client/api/ctkn', function(req, res){
    var serv = req.body.serv;
    var tkn = req.body.tkn;
    var select = { _id: new ObjectId(tkn), Server_Code:serv,}
    mongo.connect(url,{useNewUrlParser:true},mongoptions, function(err, konek){
        if(err){
            console.log("POST:/client/api/ctkn => Have problem with mongodb connetions");
        }
        else{
            konek.db('Pemilu').collection('Server').find({Server_Code:serv}).toArray(function(err, row){
                if(err){
                    console.log("POST:/client/api/ctkn => Failed get data from mongodb");
                }else{
                    row.forEach(function(d){
                        if(d.Status == 'on'){
                            konek.db('Pemilu').collection('Pemilih').find(select).toArray(function(err, row){
                                if(err){
                                    console.log("POST:/client/api/ctkn => Failed to return data voter.");
                                    res.send("Failed to return data voter.");
                                }
                                else{
                                    if(row != ""){
                                        row.forEach(function(d){
                                            if(d.Server_Code == serv){
                                                if(d._id == tkn){
                                                    console.log("POST:/client/api/ctkn => Success return data token with code --> "+d.id);
                                                    res.send(d._id);}
                                                else{
                                                    console.log("POST:/client/api/ctkn => Code token not availbe.");
                                                    res.send('Code Token not avalaible.');}
                                            }else{
                                                console.log("POST:/client/api/ctkn => Code token not suitable with your code server.");
                                                res.send('Code token not suitable with your server code.');}
                                        });
                                    }else{
                                        console.log("POST:/client/api/ctkn => Server not have voter.");
                                        res.send('Your server not have voter, confirm to server.');}
                                }
                            });
                        }else{
                            console.log("POST:/client/api/ctkn => Server "+serv+" not activate.");
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
            console.log("PUT:/client/api/choose => Have problem with mongodb connetions");
        }
        else{
            konek.db('Pemilu').collection('Server').find({Server_Code:reqserv}).toArray(function(err, row){
                if(err){
                    console.log("PUT:/client/api/choose => Failed get data server.");
                }else{
                    row.forEach(function(d){
                        if(d.Status == 'on'){
                            konek.db('Pemilu').collection('Kandidat').find(param).toArray(function(err,row){
                                if(err){
                                    console.log("PUT:/client/api/choose => Failed get data candidate.");
                                }
                                else{
                                    if(row != ''){
                                        row.forEach(function(d){
                                            var update = {$set:{ Total: d.Total + 1}}
                                            konek.db('Pemilu').collection('Kandidat').updateMany(param, update, function(err){
                                            if(err){
                                                console.log("PUT:/client/api/choose => Failed to choose candidate.");
                                                res.send("Failed to choose candidate please try again.");
                                            }
                                            else{
                                                console.log("PUT:/client/api/choose => Success to choose candidate.");
                                                res.send('Success');
                                            }
                                            konek.close();
                                            });
                                        });
                                    }else{
                                        console.log("PUT:/client/api/choose => Token not suitable.");
                                        res.send('Your token code not suitable.');
                                    }
                                }
                            });
                        }else{
                            console.log("PUT:/client/api/choose => Server system not activate.");
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
            console.log("DELETE:/client/api/dvot => Have problem with mongodb connetions");
        }
        else{
            konek.db('Pemilu').collection('Pemilih').deleteOne(hapus, function(err){
                if(err){
                    console.log("DELETE:/client/api/dvot => Failed delete data voter");
                    res.send("Failed delete data voter.");
                }
                else{
                    console.log("DELETE:/client/api/dvot => Success delete voter with code --> "+tkn);
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