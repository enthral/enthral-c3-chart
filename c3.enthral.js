(function () {
	"use strict";

	var C3Enthral = function(authorData, deps) {
		this.authorData = authorData;
		this.dataPath = authorData.enthral.dataPath;
		this.c3 = deps.c3;
		this.d3 = deps.d3;
	};

	function processLineProps(lineProps) {
		var lines = {
			fields: [],
			labels: {},
			colors: {},
			groups: []
		};
		for (var i = 0; i < lineProps.length; i++) {
			var line = lineProps[i];
			lines.fields.push(line.field);
			if (line.label) {
				lines.labels[line.field] = line.label;
			}
			if (line.color) {
				lines.colors[line.field] = line.color;
			}
			if (line.group !== undefined) {
				if (!lines.groups[line.group]) {
					lines.groups[line.group] = [];
				}
				if (lines.groups[line.group].indexOf(line.field) < 0) {
					lines.groups[line.group].push(line.field);
				}
			}
		}
		return lines;
	}

	C3Enthral.prototype = {
		setupView: function(container) {
			var c3 = this.c3,
				d3 = this.d3,
				props = this.authorData,
				tsvUrl = (props.tsv.indexOf('://') > -1) ? props.tsv : this.dataPath + props.tsv,
				chartType = props.type || 'line',
				xField = props.x.field,
				lines = processLineProps(props.lines),
				// dateFormat = props.x.format,
				// formatTime = d3.time.format(dateFormat),
				// parseTime = formatTime.parse,
				showPoints = props.showPoints || false,
				parseX,
				formatX,
				xAxisType;
			if (props.x.type === 'date') {
				var dateFormat = props.x.format || '%Y-%m-%d';
				formatX = d3.time.format(dateFormat);
				parseX = formatX.parse;
				xAxisType = 'timeseries';
			} else {
				var numberFormat = props.x.format || '.1f';
				formatX = d3.format(numberFormat);
				parseX = parseFloat;
				xAxisType = 'indexed';
			}
			d3.tsv(tsvUrl, function(d) {
				// Parse the x value into a date, the y values into floats.
				d[xField] = parseX(d[xField]);
				for (var i = 0; i < lines.fields.length; i++) {
					var field = lines.fields[i];
					d[field] = parseFloat(d[field]);
				}
				return d;
			}, function(error, data) {
				if (error) throw error;
				var chart = c3.generate({
					bindto: container,
					data: {
						json: data,
						keys:{
							x: xField,
							value: lines.fields
						},
						// one of 'line', 'spline', 'step', 'area', 'area-spline', 'area-step', 'bar', 'scatter', 'pie', 'donut', 'gauge'
						type: chartType,
						names: lines.labels,
						groups: lines.groups,
						colors: lines.colors
					},
					point: {
						show: showPoints
					},
					axis: {
						x: {
							type: xAxisType,
							tick: {
								format: props.x.format,
								culling: {max: 10},
								count: 5,
								rotate: 90,
								outer: false
							},
							padding: {
								left: 0,
								right: 0
							}
						},
						y: {
							tick: {
								outer: false,
								format: d3.format('$,')
							},
							padding: {
								top: 0,
								bottom: 0
							}
						}
					}
				});
			});
		}
	};

	C3Enthral.enthralPropTypes = {};

	C3Enthral.enthralDependencies = {
		'c3': 'c3',
		'd3': 'd3.v3',
		'css': 'c3.css'
	};

	window.C3Enthral = C3Enthral;
})();
