/*

Main Function Loads with the page

*/

var socket = io();

$(function(){

  $("#toggle1").change(function() {

    if ($('input.checkbox_check').is(':checked')) {

      socket.emit('toggle', {

        toggle: 1

      })

    } else {

      socket.emit('toggle', {

        toggle: 0

      })

    }

  });

});

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    var d = today.getDate();
    var mth = today.getMonth();
    var y = today.getYear();
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    d = checkTime(d);
    mth = checkTime(mth);
    document.getElementById('clock').innerHTML =
    '<h2>'+h+':'+m+':'+s+'</h2>'+'<h3>'+d+'/'+mth+'/'+y+'</h3>';
    var t = setTimeout(startTime, 500);
}
function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}

socket.on('connect', function () {

  setInterval(function(){

    socket.emit('temps', {

      nodeid: 1,
      sensorid: 1

    }, function (temp) {

      console.log(temp);

      var temperature = temp.value;

      var html = '<h2>'+temperature+'&deg; C</h2>'

      $('#temp').html(html);

    });

  }, 30000);

});
