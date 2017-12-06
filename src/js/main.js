require("./lib/social"); //Do not delete
var d3 = require('d3');

var formatthousands = d3.format(",");

var clickAnswer = document.getElementsByClassName("answer");
var prevClick;
var chosenName;
var savedVote;

// event listeners for answer options
for (var i = 0; i < clickAnswer.length; i++) {
  clickAnswer[i].addEventListener('click', function() {
    if (prevClick) {
      $(prevClick).find($(".fa")).removeClass('fa-check-square-o').addClass('fa-square-o');
    }
    $(this).find($(".fa")).removeClass('fa-square-o').addClass('fa-check-square-o');

    prevClick = this;
    if (this.id == "writeinicon") {
      chosenName = "";
    } else {
      chosenName = document.getElementById(this.id.substring(0,7)+"text").innerHTML;
    }
  }, false);
}

var questionHeight = $("#poll-question").height();
var windowWidth = $(window).width() - 60;
console.log(windowWidth - 60);
var width = Math.min(windowWidth,536);
console.log(width);

// setting sizes of interactive
var margin = {
  top: 40,
  right: 10,
  bottom: 10,
  left: 160
};
width = width - margin.left - margin.right;
if (screen.width <= 480) {
  var height = Math.min(questionHeight - margin.top - margin.bottom,250);
} else {
  var height = Math.min(questionHeight - margin.top - margin.bottom,300);
}
console.log("height is");
console.log(height);

var b = document.getElementsByTagName("a");
b[4].setAttribute("target", "_blank");

function draw_social() {
  var html_str = "";

  // putting in specialized sharing links
  html_str +="<div class='social-wrapper'>"

  // twitter link
  html_str += "<div class='link social'><a id='twitter-icon' title='Share on Twitter' href='https://twitter.com/intent/tweet?url=http%3A%2F%2Fprojects.sfchronicle.com%2F2017%2Fplaza-poll&text=Justin Herman Plaza is being renamed. What should S.F. call it? I voted for "+savedVote+"! Vote here: '><i class='fa fa-twitter'></i></a></div>";

  // facebook link
  html_str += "<div class='link social'><a id='facebook-icon' title='Share on Facebook' href='#' target='_blank' onclick='window.open(\"https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fprojects.sfchronicle.com%2F2017%2Fplaza-poll\", \"facebook-share-dialog\", \"width=626,height=436\"); return false;'><i class='fa fa-facebook'></i></a></div>";

  // email link
  html_str +="<div class='link social'><a id='mail-icon' title='Share via email' href='mailto:?subject=Take the poll: Rename S.F. plaza!&body=Justin Herman Plaza is being renamed. What should S.F. call it? I voted for "+savedVote+"! Vote for your favorite name here: http%3A%2F%2Fprojects.sfchronicle.com%2F2017%2Fplaza-poll'><i class='fa fa-envelope' aria-hidden='true'></i></a></div>";

  html_str += "</div>"

  document.querySelector("#personal-sharing-here").innerHTML = html_str;
}

function draw_future() {

  draw_social();

  // show tooltip
  var future_tooltip = d3.select("body")
      .append("div")
      .attr("class","tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")

  d3.json("https://hcyqzeoa9b.execute-api.us-west-1.amazonaws.com/v1/polls/0/getresults", function(voteData){

    var barData = [];

    pollOptions.forEach(function(d){
      var tempCount = 0;
      for (var idx=0; idx<voteData.length; idx++) {
        if (voteData[idx].name.S == d.Answer) {
          tempCount = voteData[idx].votes.N;
        }
      }
      barData.push( { "name" : d.Answer, "votes" : tempCount} );
    });
    console.log(barData);

    // x-axis scale
    var x = d3.scaleLinear()
        .range([0, width]);

    // y-axis scale
    var y = d3.scaleBand()
        .range([height, 0]);

    x.domain([0, Math.max(d3.max(barData, function(d) { return +d.votes; }),10)]);
    y.domain(barData.map(function(d) { return d.name; })).padding(0.1);

    // create SVG container for chart components
  	var svgBars = d3.select("#results-chart").append("svg")
  			.attr("width", width + margin.left + margin.right)
  			.attr("height", height + margin.top + margin.bottom)
  			.append("g")
  			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svgBars.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    svgBars.selectAll("bar")
        .data(barData)
      .enter().append("rect")
        .style("fill", "#696969")
        .attr("x", 0)
        .attr("width", function(d) {
          return x(+d.votes);
        })
        .attr("y",  function(d) {
          return y(d.name);
        })
        .attr("height",y.bandwidth())
        .on("mouseover", function(d) {
          future_tooltip.html(`
              <div><b>${d.name}</b></div>
              <div>Votes: <b>${d.votes}</b></div>
          `);
          future_tooltip.style("visibility", "visible");
        })
        .on("mousemove", function(d) {
          if (screen.width <= 480) {
            return future_tooltip
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",d3.event.pageX/2+20+"px");
          } else {
            return future_tooltip
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",(d3.event.pageX-80)+"px");
          }
        })
        .on("mouseout", function(){return future_tooltip.style("visibility", "hidden");});

      svgBars.selectAll("bar")
        .data(barData)
        .enter()
          .append("text")
          .text(function (d) {
            if (d.votes > 1){
              return d.votes;
            } else {
              return "";
            }
          })
          .attr("x", function (d) {
            if (d.votes > 9) {
              return x(+d.votes)-20
            } else {
              return x(+d.votes)-15
            }
          })
          .attr("y", function (d) {
            if (screen.width <=480) {
              return y(d.name)+20;
            } else {
              return y(d.name)+25;
            }
          })
          .style("fill", "white");

  });

}

document.getElementById("submit").addEventListener("click", function() {

  if (prevClick){
    if (prevClick.id == "writeinicon") {
      if (document.getElementById("writeininput").value) {
        chosenName = document.getElementById("writeininput").value;
      } else {
        document.getElementById("instructions-box-writein").classList.add("active");
        document.getElementById("instructions-overlay").classList.add("active");
      }
    }
  }

  if (prevClick && chosenName) {

    var resolvedProm = Promise.resolve(saveNewData());
    console.log(resolvedProm);

    // save new data to file
    // resolvedProm.then(setTimeout(draw_future(),2000));

    // show the bar chart instead of the question
    $("#poll-question").addClass("hide");
    $("#poll-results").removeClass("hide");

    // insert info about the vote
    document.getElementById("your-vote").innerHTML = chosenName;

    // scroll down to chart
    var pos = $("#stick-here").offset().top-37;
    $('body, html').animate({scrollTop: pos});

    // set cookie for vote
    console.log("we are setting a cookie");
    console.log(chosenName);
    setCookie("voted", chosenName, 1);

    savedVote = chosenName;

  } else {
    document.getElementById("instructions-box").classList.add("active");
    document.getElementById("instructions-overlay").classList.add("active");
  }

});

function saveNewData() {
  var newSavedData = {"name":chosenName};
  console.log("SENDING DATA ");
  console.log(JSON.stringify(newSavedData));
  $.ajax({
      method: "POST",
      data: JSON.stringify(newSavedData),
      contentType: "application/json",
      success: function(msg) {
        console.log("success");
        draw_future();
      },
      error: function(msg) { console.log("fail"); },
      url: "https://hcyqzeoa9b.execute-api.us-west-1.amazonaws.com/v1/polls/0/vote"
    });
}


function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var vote = getCookie("voted");
    savedVote = getCookie("voted");
    if (vote != "") {
      return 1;
    } else {
      return 0;
    }
}

if (screen.width <= 480) {
  var scrolloffset = 0;//70;
} else {
  var scrolloffset = 10;
}

// load bar chart on load if there is a cookie
window.onload = function() {

  if (checkCookie()) {

    draw_future();
    $("#poll-question").addClass("hide");
    $("#poll-results").removeClass("hide");

    document.getElementById("your-vote").innerHTML = savedVote;
    var pos = $("#stick-here").offset().top - scrolloffset;
    // $('body, html').animate({scrollTop: pos});

    document.getElementById("instructions-box-cookie").classList.remove("active");
    document.getElementById("instructions-overlay").classList.remove("active");
  }

};

// show the results
document.getElementById("see-results").addEventListener("click",function() {
  $("#poll-question").addClass("hide");
  $("#poll-results").removeClass("hide");

  document.getElementById("your-vote").innerHTML = savedVote;
  // document.getElementById("poll-results").style.height = questionHeight+"px";
  var pos = $("#stick-here").offset().top - scrolloffset;
  $('body, html').animate({scrollTop: pos});

  document.getElementById("instructions-box-cookie").classList.remove("active");
  document.getElementById("instructions-overlay").classList.remove("active");
});

// hide the about the data box
document.getElementById("close-data-box").addEventListener("click",function() {
  document.getElementById("instructions-box").classList.remove("active");
  document.getElementById("instructions-overlay").classList.remove("active");
});

// hide the about the data box
document.getElementById("close-data-box-writein").addEventListener("click",function() {
  document.getElementById("instructions-box-writein").classList.remove("active");
  document.getElementById("instructions-overlay").classList.remove("active");
});

// hide the about the data box
document.getElementById("close-data-box-cookie").addEventListener("click",function() {
  document.getElementById("instructions-box-cookie").classList.remove("active");
  document.getElementById("instructions-overlay").classList.remove("active");
});
