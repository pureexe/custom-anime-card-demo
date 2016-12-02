function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}
Handlebars.registerHelper('formatTime', function (date) {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    var date = new Date(date);
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    return day + ' ' + monthNames[monthIndex] + ' ' + year;
});
$(function() {
  var appConfig = {
    'clientId':'pureexe-us28y',
    'clientSecret':'l5wNP1c9OU50tvqOxW',
    'redirectUrl':'https://animecustomcard.pureapp.in.th'
  };
  var authorization_code = findGetParameter("code");
  if(authorization_code!=null){
    $("#app-auth-accesstoken").show();
    $.post("https://anilist.co/api/auth/access_token?",{
      "grant_type":"authorization_code",
      "client_id":appConfig.clientId,
      "client_secret":appConfig.clientSecret,
      "redirect_uri":appConfig.redirectUrl,
      "code":authorization_code,
    }).done(function(data) {
      localStorage.access_token = data.access_token;
      localStorage.refresh_token = data.refresh_token;
      localStorage.expires = new Date(data.expires*1000);
      $("#app-auth-accesstoken").hide();
      $("#app-main").show();
    }).fail(function(data){
      Materialize.toast('Anilist authenization failed!', 4000);
    });
  }else if(!localStorage.expires){
    $("#app-auth-required").show();
  }else if(new Date()>localStorage.expires){
    $("#app-auth-accesstoken").show();
    $.post("https://anilist.co/api/auth/access_token?",{
      "grant_type":"refresh_token",
      "client_id":appConfig.clientId,
      "client_secret":appConfig.clientSecret,
      "redirect_uri":appConfig.redirectUrl,
      "refresh_token":localStorage.refresh_token,
    }).done(function(data) {
      localStorage.access_token = data.access_token;
      localStorage.expires = new Date(data.expires*1000);
      $("#app-auth-accesstoken").hide();
      $("#app-main").show();
    }).fail(function(data){
      Materialize.toast('Anilist authenization failed!', 4000);
    });
  }else{
    $("#app-main").show();
  }
  $("#sign-in-anilist").click(function(){
    window.location.href = "https://anilist.co/api/auth/authorize?grant_type=authorization_code&client_id="
    +appConfig.clientId
    +"&redirect_uri="
    +appConfig.redirectUrl
    +"&response_type=code"
  });
  $("#anime-query").on('input',function(e){
    var searchData = $("#anime-query").val();
    if(searchData==""){
      return;
    }
    $.get("https://anilist.co/api/anime/search/"+searchData+"?access_token="+localStorage.access_token).done(function(data){
      var source = $("#template-search").html();
      var template = Handlebars.compile(source);
      var resultHtml = template(data);
      $("#result-render").html(resultHtml);
    }).fail(function(){
      Materialize.toast('Query Error! please refresh this page', 4000);
    });
  });
});
