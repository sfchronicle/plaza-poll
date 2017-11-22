require("./lib/social"); //Do not delete
var d3 = require('d3');

var formatthousands = d3.format(",");

// convert names to camel case
function titleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(function(word) {
        return word[0].toUpperCase() + word.substr(1);
    })
    .join(' ');
}

var clickAnswer = document.getElementsByClassName("answer");
var prevClick;
var chosenName;

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

var windowWidth = $(window).width();
console.log("window width = ");
console.log(windowWidth);
var width = Math.min(windowWidth,536);
console.log(width);

// setting sizes of interactive
var margin = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 100
};
width = width - margin.left - margin.right;
var height = questionHeight - margin.top - margin.bottom - 100;

function draw_future() {

  // show tooltip
  var future_tooltip = d3.select("body")
      .append("div")
      .attr("class","future_tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")

  d3.json("http://extras.sfgate.com/editorial/droughtwatch/reservoirs.json", function(barData){

    console.log(barData);

    barData.data.forEach(function(d){
      d.name = titleCase(d.name).split('(')[0];
    });

    // x-axis scale
    var x = d3.scaleLinear()
        .range([0, width]);

    // y-axis scale
    var y = d3.scaleBand()
        .range([height, 0]);

    x.domain([0, 5000]);
    y.domain(barData.data.map(function(d) { return d.name; })).padding(0.1);

    // var xAxis = d3.svg.axis()
    //     .scale(x)
    //     .orient("bottom");
    //
    // // use y-axis scale to set y-axis
  	// var yAxis = d3.svg.axis()
  	// 		.scale(y)
  	// 		.orient("left")
  	// 		.tickFormat(d3.format(".2s"));


    // create SVG container for chart components
  	var svgBars = d3.select("#results-chart").append("svg")
  			.attr("width", width + margin.left + margin.right)
  			.attr("height", height + margin.top + margin.bottom)
  			.append("g")
  			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // svgBars.append("g")
    //     .attr("class", "x axis")
    //    	.attr("transform", "translate(0," + height + ")")
    //   	.call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height]));

    svgBars.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    svgBars.selectAll("bar")
        .data(barData.data)
      .enter().append("rect")
        .style("fill", "#696969")
        .attr("x", 0)
        .attr("width", function(d) {
          return width - x(+d.capacity/1000);
        })
        .attr("y",  function(d) {
          return y(d.name);
        })
        .attr("height",y.bandwidth())
        .on("mouseover", function(d) {
          // future_tooltip.html(`
          //     <div>Reservoir: <b>${d.name}</b></div>
          //     <div>Storage: <b>${formatthousands(Math.round(d.storage/1000))} TAF</b></div>
          //     <div>Capacity: <b>${formatthousands(Math.round(d.capacity/1000))} TAF</b></div>
          // `);
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

    // svgBars.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(xAxis)
    //   .selectAll("text")
    //     .style("text-anchor", "end")
    //     .attr("dx", "-.8em")
    //     .attr("dy", "-.55em")
    //     .attr("transform", "rotate(-65)" );
    //
    // svgBars.append("g")
    //     .attr("class", "y axis")
    //     .call(yAxis)
    //   .append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 6)
    //     .attr("dy", ".71em")
    //     .style("text-anchor", "end")
    //     .text("Reservoir levels (TAF)");

  });

}

draw_future();

document.getElementById("submit").addEventListener("click", function() {

  if (prevClick){
    if (prevClick.id == "writeinicon") {
      console.log(document.getElementById("writeininput").value);
      if (document.getElementById("writeininput").value) {
        chosenName = document.getElementById("writeininput").value;
      } else {
        document.getElementById("instructions-box-writein").classList.add("active");
        document.getElementById("instructions-overlay").classList.add("active");
      }
    }
  }

  if (prevClick && chosenName) {
    $("#poll-question").addClass("hide");
    $("#poll-results").removeClass("hide");

    document.getElementById("your-vote").innerHTML = chosenName;
    document.getElementById("poll-results").style.height = questionHeight+"px";
    var pos = $("#stick-here").offset().top-37;
    $('body, html').animate({scrollTop: pos});

  } else {
    document.getElementById("instructions-box").classList.add("active");
    document.getElementById("instructions-overlay").classList.add("active");
  }
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
