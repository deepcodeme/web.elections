
$('#btn-try-server').on('click', function(e){
	window.location = '/lserv';
});

$('#btn-try-server').on('touchstart', function(e){
    window.location = '/lserv';
});

$('#btn-try-client').on('click',function(e){
    window.location = '/lclie';
});

$('#btn-try-server-nav').on('click', function(e){
	window.location = '/lserv';
});

$('#btn-try-client-nav').on('click', function(e){
    window.location = '/lclie';
});

$('#btn-signup-server').on('click', function(e){
    window.location = '/sserv';
});

$('#btn-back-login').on('click', function(e){
    e.preventDefault();
    window.location = '/lserv';
});

$('#btn-back-lgns').on('click', function(e){
    window.location = '/';
});

$('#btn-back-lgnc').on('click', function(e){
    window.location = '/';
});

$('#btn-create-signup-server').on('click', function(e){
    e.preventDefault();
    var NewServer = $('#txt-code-signup');

    $.ajax({
        url: '/server/api/',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            Req_NewServer : NewServer.val()
        }),

        success: function(res){
            if(res == "INSERT DROP" || res == "SERVER CODE IS ALREADY" || res == "PLEASE INSERT CODE SERVER FIRST"){
                swal(res);
                $('#txt-code-signup').val('');
            }else{
                $('#txt-code-signup').val('');  
                window.location = '/lserv';
            }
        }
    });
});

$('#btn-signin-server').on('click', function(e){
    e.preventDefault();
    var codeServer = $('#txt-code');

    $.ajax({
        url: '/server/api/in',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            code: codeServer.val()
        }),
        success: function(res){
            if(res== "PLEASE INSERT CODE SERVER FIRST" || res == "UPDATE DROP" || res == "SERVER CODE NOT AVAILABLE" || res == "CODE SERVER ALREADY ACTIVATE"){
                codeServer.val('');
                swal(res);
            }else{
                codeServer.val('');
                sessionStorage.setItem('NamaServer', res);
                localStorage.setItem('NamaServer', res);
                window.location = "/dserv";
            }
        }
    });
});

$('#btn-modal-profile').on('click', function(e){
    let profile = sessionStorage.getItem('NamaServer');
    let modal_profile = $('#body-modal-profile').html('');

    modal_profile.append('<p class="text-secondary">'+profile+'</p>');
});

$('#btn-logout-server').on('click', function(e){
    var server_name = sessionStorage.getItem('NamaServer');
    $.ajax({
        url: '/server/api/out',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            code: server_name
        }),
        success: function(res){    
            if(res == 'UPDATE DROP'){
                swal('LOGOUT GAGAL');
            }else{
                sessionStorage.removeItem('NamaServer');
                localStorage.removeItem('NamaServer')
                sessionStorage.removeItem('param-add-img-client');
                localStorage.removeItem('param-add-img-client');
                window.location = '/';
            }
        }
    });
});

$('#txt-file').on('change', function(e){
    var tmppath = URL.createObjectURL(e.target.files[0]);
    $('#img-preview').fadeIn('fast').attr('src', tmppath);
});

$('#btn-input-server').on('click', function(e){
    
    var name,visi,misi,profile;
    
    name = $('#txt-nama-id');
    visi = $('#txt-visi-id');
    misi = $('#txt-misi-id');
    profile = sessionStorage.getItem('NamaServer');

    if(name.val() == "" || visi.val() == "" || misi.val() == ""){
        swal('Silahkan lengkapi terlebih dahulu');
    }else{
        $.ajax({
            url:'/client/api',
            method:'POST',
            contentType:'application/json',
            data: JSON.stringify({
                name:name.val(),
                visi:visi.val(),
                misi:misi.val(),
                profile:profile
            }),
            success:function(res){
                if(res == "DONE"){
                    localStorage.setItem('param-add-img-client', name.val());
                    sessionStorage.setItem('param-add-img-client', name.val());
                    $('#Modal-Img').css('overflow-y', 'auto');
                    $('#Modal-Img').modal('show');
                    $('#Modaladd').modal('hide');
                }else{
                    name.val('');
                    visi.val('');
                    misi.val('');
                }
                
            }
        });
    }
});

$('#btn-add-client-img').on('click', function(e){
    e.preventDefault();
    swal('Berhasil mengupload data mohon tunggu sampai terutup sendiri');
    var form = $('#frm-add-img')[0];
    var data = new FormData(form);
    data.append("Custom Field","This is some extra data, testing");

    $.ajax({
        url:'/client/api/u',
        method:'POST',
        enctype: 'multipart/form-data',
        data: data,
        processData: false,
        contentType: false,
        cache: false,
        timeout: 600000,
        success: function(res){
            console.log('SUCCESS');
            var name_file = $('#txt-file').val().replace(/.*(\/|\\)/, '');
            var name_param = sessionStorage.getItem('param-add-img-client');
            $.ajax({
                url: '/client/api',
                method:'PUT',
                contentType: 'application/json',
                data:JSON.stringify({
                    file: name_file,
                    param: name_param
                }),
                success: function(res){
                    if(res=="DONE"){
                        $('#Modal-Img').modal('hide');
                        sessionStorage.removeItem('param-add-img-client');
                        localStorage.removeItem('param-add-img-client');
                        window.location = "/dserv";
                    }
                }
            });
        },
        error: function(res){
            console.log('ERROR');
        }
    });
});

$('#btn-sigin-client').on('click', function(e){
    
    var codeClient = $('#txt-code-client');
    
    $.ajax({

        url:'/client/api/in',
        method:'POST',
        contentType: 'application/json',
        
        data: JSON.stringify({
            dataClient: codeClient.val()
        }),

        success: function(res){
            if(res == 'PLEASE INSERT YOUR SERVER CODE' || res == 'YOUR SERVER NOT AVALAIBLE' || res == 'YOUR SERVER NOT ACTIVATE' || res == 'ROW DROP'){
                codeClient.val('');
                swal(res);
            }else{
                codeClient.val('');
                localStorage.setItem("NamaServerClient", res);
                window.location = '/cd';
            }
        }
    });
});

$('#btn-check-code').on('click', function(e){

    var server = $('#txt-server').val();
    var token = $('#txt-token').val()

    if(token != "" && token.length == 24){
        $.ajax({
            url:'/client/api/ctkn',
            method:'POST',
            contentType:'application/json',
            data: JSON.stringify({
                serv: server,
                tkn: token,
            }),
            success: function(res){
                if(res == "Empty" || res == "Server not avalaible" || res == "Token not avalaible"){
                    $('#txt-token').val('');
                }else{
                    $('#txt-token').val('');
                    localStorage.setItem('Token', res);
                    window.location = '/dclie';
                }
            }
        });
    }else{  
        swal("Token not correct");
    }

});

$('#btn-edit-profile').on('click', function(e){
    
    var id = sessionStorage.getItem('id');
    var serv = sessionStorage.getItem('NamaServer');
    
    var upn = $('#txt-nama-e').val();
    var upv = $('#txt-visi-e').val();
    var upm = $('#txt-misi-e').val();
    
    $.ajax({
        url: '/server/api',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            id:id,
            serv:serv,
            upn:upn,
            upv:upv,
            upm:upm
        }),
        success: function(res){
            if(res == "DROP") console.log('DROP');
            else{
                sessionStorage.removeItem('id');
                window.location = '/dserv';
            }
        }
    });
});

$('#btn-modal-vote').on('click', function(e){
    var server  = sessionStorage.getItem('NamaServer');
    localStorage.setItem('NamaServer', server);
    $.ajax({
        url:'/server/api/getv/'+server,
        method:'GET',
        contentType: 'application/json',
        // data: JSON.stringify({
        //     serv:server,
        // }),
        success:function(res){
            if(res == 'server null'){
                swal(res);
            }else{
                $('#txt-qtyvoter').val("");
                let txt = $('#txt-qty-vot');
                txt.html(res);
            }
        }
    });
});

$('#btn-add-vot').on('click', function(e){
    let server = sessionStorage.getItem('NamaServer');
    let qty = $('#txt-qtyvoter').val();
    $.ajax({
        url:'/server/api/addv',
        method:'POST',
        contentType: 'application/json',
        data: JSON.stringify({  
            serv: server,
            qty: qty
        }),
        success:function(res){
            if(res == 'Not below zero'){
                swal(res);
            }else{
                swal('Create successfully');
                $.ajax({
                    url:'/server/api/getv',
                    method:'GET',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        serv:server,
                    }),
                    success:function(res){
                        if(res == 'server null'){
                            swal(res);
                        }else{
                            $('#txt-qtyvoter').val("");
                            let txt = $('#txt-qty-vot');
                            txt.html(res);
                        }
                    }
                });
            }
        }
    });
});

$('#btn-export-vot').on('click', function(e){
    var txt = $('#txt-qty-vot').text();
    if(txt != "0" || txt != ""){
        window.open('/vot','_blank');
    }else{
        swal('please specify in advance that many people can choose');
    }
});

function btn_del_profile(id){
    var id = id;
    var serv = sessionStorage.getItem('NamaServer');
    $.ajax({
        url: '/server/api',
        method: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({
          id: id,
          serv: serv
        }),
        success: function(res){
          if(res == "DROP"){
              swal('Gagal menghapus data kandidat');
          }else{
              window.location = '/dserv';
          }
      }
    });
  }

  function btn_more_profile(id){
      var id = id;
      var serv = sessionStorage.getItem('NamaServer');
      if(serv == '' || serv == null){
        serv = localStorage.getItem('NamaServerClient');
      }
      $.ajax({
          url: '/server/api/is',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
              id:id,
              serv:serv
          }),
          success: function(res){
              if(res == 'DROP'){
                  swal('Gagal meload data lengkap kandidat');
              }else{
                  var body = $('#body-vm');
                  body.html('');
                  res.forEach(function(row){
                      body.append('\
                          <label class="text-secondary">Vision</label>\
                          <textarea class="form-control text-left" style = "height: 75px;" readonly>'+row.Visi+'</textarea>\
                          <small class="form-text text-muted mb-2">Type your vision for share another people.</small>\
                          <label class="text-secondary">Mision</label>\
                          <textarea class="form-control text-left" style = "height: 75px;" readonly>'+row.Misi+'</textarea>\
                          <small class="form-text text-muted mb-2">Type your mision for share another people.</small>\
                      ');
                  });
              }
          }   
      });
  }

  function btn_edit_profile(id){
      var id = id;
      var serv = sessionStorage.getItem('NamaServer');
      sessionStorage.setItem('id', id);
      $.ajax({
          url: '/server/api/is',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
              id:id,
              serv:serv
          }),
          success: function(res){
              if(res == 'DROP'){
                  swal('Gagal meload data lengkap kandidat');
              }else{
                  var body = $('#body-edit');
                  body.html('');
                  res.forEach(function(row){
                      body.append('\
                        <label class="text-secondary">Name</label>\
                        <input type="text" id="txt-nama-e" class="form-control mb-2" value="'+row.Nama+'">\
                        <label class="text-secondary">Vision</label>\
                        <textarea id="txt-visi-e" class="form-control" required>'+row.Visi+'</textarea>\
                        <small class="form-text text-muted mb-2">Type your vision for share another people.</small>\
                        <label class="text-secondary">Mision</label>\
                        <textarea id="txt-misi-e" class="form-control" required>'+row.Misi+'</textarea>\
                        <small class="form-text text-muted mb-2">Type your mision for share another people.</small>\
                      ');
                  });
              }
          }   
      });
  }

  function btn_choose(id){
      id = id;  
      serv = localStorage.getItem('NamaServerClient');
      $.ajax({
          url: '/client/api/choose',
          method: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify({
              id:id,
              serv:serv
          }),
          success: function(res){
              if(res == 'DROP'){
                  swal('Gagal memilih');
              }else{
                  swal('Berhasil memilih');
                  window.location = '/';
              }
          }
      })
  }

// $('#btn-home').on('click', function(e){
//     e.preventDefault();
//     $.ajax({
//         url: 'http://localhost:8999/sendEmail/api',
//         method: 'POST',
//         contentType: 'application/json',
//         data: JSON.stringify({
//             to: 'technoboth@gmail.com',
//             sub: 'cc',
//             msg: 'Tagihan anda telah jatuh tempo.'
//         }),
//         success: function(res){
//             console.log(res);
//         }
//     });    
// });