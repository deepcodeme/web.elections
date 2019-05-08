$('#btn-try-server').on('click', function(e){
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
            if
            (res == "Insert code server first." ||
             res == "Log-in failed, please try again later." ||
             res == "Server is already activate." ||
             res == "Server not found."
            ){
                codeServer.val('');
                swal("Proooobblemm",res, "error");
            }else{
                codeServer.val('');
                localStorage.setItem('ns', res);
                window.location = "/dserv";
            }
        }
    });
});
$('#btn-signup-server').on('click', function(e){
    window.location = '/sserv';
});
$('#btn-back-lgns').on('click', function(e){
    window.location = '/';
});
$('#btn-create-signup-server').on('click', function(e){
    e.preventDefault();
    var ns = $('#txt-code-signup');
    $.ajax({
        url: '/server/api/',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            ns : ns.val()
        }),
        success: function(res){
            if(res == "Success"){
                $('#txt-code-signup').val('');  
                window.location = '/lserv';
            }else{
                swal("Proooobblemm",res, "error");
                $('#txt-code-signup').val('');
            }
        }
    });
});
$('#btn-back-login').on('click', function(e){
    e.preventDefault();
    window.location = '/lserv';
});
$('#btn-modal-profile').on('click', function(e){
    var profile = localStorage.getItem('ns');
    swal(profile, "name server", "success");
});
$('#btn-input-server').on('click', function(e){
    var name,visi,misi,profile; 
    name = $('#txt-nama-id');
    visi = $('#txt-visi-id');
    misi = $('#txt-misi-id');
    if(name.val() == "" || visi.val() == "" || misi.val() == ""){
        swal("Proooobblemm","Please insert first", "error");
    }else{
        localStorage.setItem('Nama-candidate',name.val());
        localStorage.setItem('Visi-candidate',visi.val());
        localStorage.setItem('Misi-candidate',misi.val());
        $('#Modal-Img').css('overflow-y', 'auto');
        $('#Modal-Img').modal('show');
        $('#Modaladd').modal('hide');
        name.val('');
        visi.val('');
        misi.val('');
    }
});
$("#btn-ccc").on('click', function(e){
    $('#txt-nama-id').val("");
    $('#txt-visi-id').val("");
    $('#txt-misi-id').val("");
});
$('#txt-file').on('change', function(e){
    var tmppath = URL.createObjectURL(e.target.files[0]);
    $('#img-preview').fadeIn('fast').attr('src', tmppath);
});
$('#btn-add-client-img').on('click', function(e){
    e.preventDefault();
    var form = $('#frm-add-img')[0];
    var data = new FormData(form);
    var file = $('#txt-file').val().replace(/.*(\/|\\)/, '');
    var nama = localStorage.getItem("Nama-candidate");
    var visi = localStorage.getItem("Visi-candidate");
    var misi = localStorage.getItem("Misi-candidate");
    var serv = localStorage.getItem("ns");
    $.ajax({
        url:'/client/api',
        method:'POST',
        contentType:'application/json',
        data: JSON.stringify({
            file:file,
            name:nama,
            visi:visi,
            misi:misi,
            serv:serv,
        }),
        success:function(res){
            if(res == "Add candidate success"){
                $.ajax({
                    url:'/client/api/u',
                    method:'POST',
                    enctype: 'multipart/form-data',
                    data: data,
                    processData: false,
                    contentType: false,
                    cache: false,
                    timeout: 600000,
                    success:function(res){
                        if(res == "Success send file photo."){
                           localStorage.removeItem("Nama-candidate");
                           localStorage.removeItem("Visi-candidate");
                           localStorage.removeItem("Misi-candidate");
                           $('#Modal-Img').modal('hide') ;
                           window.location = '/dserv';
                        }else{
                            swal("Errrroooor", "Please try again later", "error");
                        }
                    }
                });
            }else{
                swal("Errrroooor", "Please try again later", "error");
                localStorage.removeItem("Nama-candidate");
                localStorage.removeItem("Visi-candidate");
                localStorage.removeItem("Misi-candidate");
                $('#Modal-Img').modal('hide');
            }
        }
    });
});
$('#btn-modal-vote').on('click', function(e){
    var server = localStorage.getItem('ns');
    $.ajax({
        url         :'/server/api/getv/'+server,
        method      :'GET',
        contentType :'application/json',
        success:function(res){
            if(res == 'Your server not avaible --> this bug please report to development'){
                swal("Proooobblemm",res, "error");
                window.location = 'lserv';
            }else{
                $('#txt-qtyvoter').val(""); 
                var txt = $('#txt-qty-vot');
                txt.html(res);
            }
        }
    });
});
$('#btn-add-vot').on('click', function(e){
    var server = localStorage.getItem('ns');
    var qty    = $('#txt-qtyvoter').val();
    $.ajax({
        url        :'/server/api/addv',
        method     :'POST',
        contentType: 'application/json',
        data       : JSON.stringify({  
            serv : server,
            qty  : qty
        }),
        success:function(res){
            if(res == 'Please check your lots of input'){
                swal("Proooobblemm",res, "error");
            }else{
                swal("Gooooodd jooobbbb", "Success add people voter", "success");
                $("#btn-modal-vote").click();
            }
        }
    });
});
$('#btn-export-vot').on('click', function(e){
    var txt = $('#txt-qty-vot').text();
    if(txt != "0" || txt != ""){
        window.open('/vot','_blank');
    }else{
        swal("Proooobblemm","Please check your voter avalaible", "error");
    }
});
$('#btn-logout-server').on('click', function(e){
    var server_name = localStorage.getItem('ns');
    $.ajax({
        url        : '/server/api/out',
        method     : 'PUT',
        contentType: 'application/json',
        data       :  JSON.stringify({code: server_name}),
        success: function(res){    
            if(res == 'Success'){
                localStorage.removeItem('ns');
                window.location = '/';
            }else{
                swal("Proooobblemm",res, "error");
            }
        }
    });
});
function btn_edit_profile(id){
    var id   = id;
    sessionStorage.setItem('id', id);
    var serv = localStorage.getItem('ns');
    $.ajax({
        url: '/server/api/is',
        method: 'GET',
        contentType: 'application/json',
        data: JSON.stringify({
            id:id,
            serv:serv
        }),
        success: function(res){
            if(res == 'Failed to return data profile candidate'){
              swal("Proooobblemm","Failed load all profile candidate", "error");
            }else{
                var body = $('#body-edit');
                body.html('');
                res.forEach(function(row){
                    body.append('\
                      <label class="text-secondary">Name</label>\
                      <input type="text" id="txt-nama-e" class="form-control mb-2" value="'+row.Nama+'">\
                      <label class="text-secondary">Vision</label>\
                      <textarea id="txt-visi-e" class="form-control" required>'+row.Visi+'</textarea>\
                      <label class="text-secondary">Mision</label>\
                      <textarea id="txt-misi-e" class="form-control" required>'+row.Misi+'</textarea>\
                    ');
                });
            }
        }   
    });
}
$('#btn-edit-profile').on('click', function(e){ 
    var id   = sessionStorage.getItem('id');
    var serv = localStorage.getItem('ns');
    var upn  = $('#txt-nama-e').val();
    var upv  = $('#txt-visi-e').val();
    var upm  = $('#txt-misi-e').val();
    $.ajax({
        url: '/server/api',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            id:id, serv:serv, upn:upn, upv:upv, upm:upm
        }),
        success: function(res){
            if(res == "Success")
            {
                swal("Gooooodd jooobb","Success edit profile candidate ", "success");
                sessionStorage.removeItem('id');
                window.location = '/dserv';
            }
            else{
                swal("Proooobblemm",res, "error");
            }
        }
    });
});
function btn_more_profile(id){
    var id = id;
    var serv;
    if(localStorage.getItem('ns') == null || localStorage.getItem('ns') == undefined){
        serv = localStorage.getItem('nsc');
    }else{
        serv = localStorage.getItem('ns');
    }
    $.ajax({
        url: '/server/api/is',
        method: 'GET',
        contentType: 'application/json',
        data: JSON.stringify({
            id:id,
            serv:serv
        }),
        success: function(res){
            if(res == 'Failed to return data profile candidate'){
              swal("Proooobblemm","Failed load all profile candidate", "error");
            }else{
                var body = $('#body-vm');
                body.html('');
                res.forEach(function(row){
                    body.append('\
                    <label class="text-secondary">Vision</label>\
                    <textarea class="form-control text-left" style = "height: 75px;" readonly>'+row.Visi+'</textarea>\
                    <label class="text-secondary">Mision</label>\
                    <textarea class="form-control text-left" style = "height: 75px;" readonly>'+row.Misi+'</textarea>\
                    ');
                });
            }
        }   
    });
}
function btn_del_profile(id){
    var id = id;
    var serv = localStorage.getItem('ns');
    $.ajax({
        url: '/server/api',
        method: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({id: id, serv: serv}),
        success: function(res){
          if(res == "Success"){
            window.location = '/dserv';
            swal("Gooooodd jooobb","Success delete profile candidate ", "success");
          }else{
            swal("Proooobblemm",res, "error");  
          }
      }
    });
}
$('#btn-sigin-client').on('click', function(e){   
    var codeClient = $('#txt-code-client');
    $.ajax({
        url        : '/client/api/in',
        method     : 'POST',
        contentType: 'application/json',
        data       : JSON.stringify({dataClient: codeClient.val()}),
        success    : function(res){
            if
            (res == "Failed to sig-in please try again later." ||
             res == "System server not active now." ||
             res == "Server code not avalaible." ||
             res == "Please insert first your server code."
            ){
                codeClient.val('');
                swal("Proooobblemm",res, "error");
            }else{
                codeClient.val('');
                localStorage.setItem('nsc',res);
                window.location = '/cd';
            }
        }
    });
});
$('#btn-back-lgnc').on('click', function(e){
    window.location = '/';
});
$('#btn-check-code').on('click', function(e){
    var server = $('#txt-server').val();
    var token  = $('#txt-token').val()
    if(token != "" && token.length == 24){
        $.ajax({
            url        :'/client/api/ctkn',
            method     :'POST',
            contentType:'application/json',
            data       : JSON.stringify({ serv: server,tkn: token,}),
            success: function(res){
                if
                (res == "Failed to return data voter." ||
                 res == "Code Token not avalaible." ||
                 res == "Code token not suitable with your server code." ||
                 res == "Your server not have voter, confirm to server." ||
                 res == "Your server not activate please check."
                ){
                    swal("Proooobblemm",res, "error");
                    $('#txt-token').val('');
                }else{
                    localStorage.setItem('tkn', res);
                    $('#txt-token').val('');
                    window.location = '/dclie';
                }
            }
        });
    }else{swal("Proooobblemm","Token not compatible", "error");}
});
$('#btn-cancel-code').on('click', function(e){
    window.location = '/lclie';
});
function btn_choose(id){
    var id   = id;  
    var serv = localStorage.getItem('nsc');
    $.ajax({
        url        : '/client/api/choose',
        method     : 'PUT',
        contentType: 'application/json',
        data       :  JSON.stringify({id:id,serv:serv}),
        success: function(res){
            if(res == "Success"){
              swal("Gooood joobbb","Success choose your candidate, thanks :)", "success");
              hapus_voter();
            }else{
              swal("Proooobblemm",res, "error");
            }
        }
    })
}
function hapus_voter(){
    var tkn = localStorage.getItem('tkn');
    $.ajax({
        url        : '/client/api/dvot',
        method     : 'DELETE',
        contentType: 'application/json',
        data       :  JSON.stringify({tkn:tkn,}),
        success    :  function(res){
            if(res == "Success"){
                localStorage.removeItem('nsc');
                localStorage.removeItem('tkn');
                window.location = '/lclie';
            }else{
                swal("Prooooobbllemm", res, "error");
                return hapus_voter;
            }
        }    
    });
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