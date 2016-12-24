(function () {
	"use strict";
	var LineGraph = function(authorData, deps) {
		this.authorData = authorData;
		this.dataPath = authorData.enthral.dataPath;
		this.d3 = deps.d3;
	};
	LineGraph.prototype = {
		setupView: function(container) {
			var d3 = this.d3,
				tsvFile = this.authorData.tsv,
				tsvUrl = (tsvFile.indexOf('://') > -1) ? tsvFile : this.dataPath + tsvFile,
				dateFormat = this.authorData.dateFormat,
				xField = this.authorData.xField,
				yField = this.authorData.yField,
				yLabel = this.authorData.yLabel,
				lineColor = this.authorData.lineColor || 'steelblue',
				cont = d3.select(container),
				svg = cont.append("svg")
					.attr("width", "960")
					.attr("height", "500"),
				margin = {top: 20, right: 20, bottom: 30, left: 50},
				width = +svg.attr("width") - margin.left - margin.right,
				height = +svg.attr("height") - margin.top - margin.bottom,
				g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var parseTime = d3.timeParse(dateFormat);

			var stylesheetElm = document.createElement("style");
			document.head.appendChild(stylesheetElm);
			var sheet = stylesheetElm.sheet,
				rule = ".line { fill: none; stroke: " + lineColor + "; stroke-width: 1.5px; }";
			sheet.insertRule(rule, sheet.cssRules.length);

			var x = d3.scaleTime()
				.rangeRound([0, width]);

			var y = d3.scaleLinear()
				.rangeRound([height, 0]);

			var line = d3.line()
				.x(function(d) { return x(d[xField]); })
				.y(function(d) { return y(d[yField]); });

			d3.tsv(tsvUrl, function(d) {
				d[xField] = parseTime(d[xField]);
				d[yField] = +d[yField];
				return d;
			}, function(error, data) {
				if (error) throw error;

				x.domain(d3.extent(data, function(d) { return d[xField]; }));
				y.domain(d3.extent(data, function(d) { return d[yField]; }));

				g.append("g")
					.attr("class", "axis axis--x")
					.attr("transform", "translate(0," + height + ")")
					.call(d3.axisBottom(x));

				g.append("g")
					.attr("class", "axis axis--y")
					.call(d3.axisLeft(y))
					.append("text")
					.attr("fill", "#000")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", "0.71em")
					.style("text-anchor", "end")
					.text(yLabel);

				g.append("path")
					.datum(data)
					.attr("class", "line")
					.attr("d", line);
			});

		}
	};
	LineGraph.enthralPropTypes = {};
	LineGraph.enthralDependencies = {
		'd3': 'https://d3js.org/d3.v4.min.js'
	};
	window.LineGraph = LineGraph;
})();
