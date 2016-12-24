(function () {
	"use strict";

	function addStylesheet (lineChart, container) {
		var lineColor = lineChart.authorData.lineColor || 'steelblue',
			stylesheetElm = document.createElement("style"),
			rule = ".line { fill: none; stroke: " + lineColor + "; stroke-width: 1.5px; }";
		container.appendChild(stylesheetElm);
		stylesheetElm.sheet.insertRule(rule, 0);
	}

	function drawGraphCanvas(lineChart, container) {
		var d3 = lineChart.d3,
			cont = d3.select(container),
			canvasWidth = 960,
			canvasHeight = 500,
			svg = cont.append("svg")
				.attr("width", canvasWidth)
				.attr("height", canvasHeight),
			margin = {top: 20, right: 20, bottom: 30, left: 50},
			width = canvasWidth - margin.left - margin.right,
			height = canvasHeight - margin.top - margin.bottom,
			graph = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		return {
			graph: graph,
			width: width,
			height: height
		};
	}

	function loadTsvAndDrawLines(lineChart, canvas) {
		var d3 = lineChart.d3,
			props = lineChart.authorData,
			tsvUrl = (props.tsv.indexOf('://') > -1) ? props.tsv : lineChart.dataPath + props.tsv,
			dateFormat = props.dateFormat,
			xField = props.xField,
			yField = props.yField,
			yLabel = props.yLabel,
			parseTime = d3.timeParse(dateFormat),
			x = d3.scaleTime()
				.rangeRound([0, canvas.width]),
			y = d3.scaleLinear()
				.rangeRound([canvas.height, 0]);

		var line = d3.line()
			.x(function(d) { return x(d[xField]); })
			.y(function(d) { return y(d[yField]); });

		d3.tsv(tsvUrl, function(d) {
			// Map the xField to be a real date object, not a date string.
			d[xField] = parseTime(d[xField]);
			d[yField] = parseInt(d[yField], 10);
			return d;
		}, function(error, data) {
			if (error) throw error;

			x.domain(d3.extent(data, function(d) { return d[xField]; }));
			y.domain(d3.extent(data, function(d) { return d[yField]; }));

			canvas.graph.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate(0," + canvas.height + ")")
				.call(d3.axisBottom(x));

			canvas.graph.append("g")
				.attr("class", "axis axis--y")
				.call(d3.axisLeft(y))
				.append("text")
				.attr("fill", "#000")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", "0.71em")
				.style("text-anchor", "end")
				.text(yLabel);

			canvas.graph.append("path")
				.datum(data)
				.attr("class", "line")
				.attr("d", line);
		});
	};

	var LineChart = function(authorData, deps) {
		this.authorData = authorData;
		this.dataPath = authorData.enthral.dataPath;
		this.d3 = deps.d3;
	};

	LineChart.prototype = {
		setupView: function(container) {
			addStylesheet(this, container);
			var canvas = drawGraphCanvas(this, container);
			loadTsvAndDrawLines(this, canvas);
		}
	};

	LineChart.enthralPropTypes = {};

	LineChart.enthralDependencies = {
		'd3': 'https://d3js.org/d3.v4.min.js'
	};

	window.LineChart = LineChart;
})();
