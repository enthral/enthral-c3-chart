define(['enthral', 'd3/v3', 'c3', 'css!c3/styles'], function (enthral, d3, c3) {
	"use strict";

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

	var C3Enthral = function(config) {
		this.container = config.container;
		this.dataPath = config.meta.content.path;
	};

	C3Enthral.prototype = {
		render: function(props) {
			var self = this,
				dataPath = this.dataPath,
				tsvUrl = (props.tsv.indexOf('://') > -1) ? props.tsv : dataPath + props.tsv,
				chartType = props.type || 'line',
				xField = props.x.field,
				lines = processLineProps(props.lines),
				showPoints = props.showPoints || false,
				defaultNumberFormat = '',
				numberFormatY = (props.y && props.y.format) ? props.y.format : defaultNumberFormat,
				formatY = d3.format(numberFormatY),
				parseX,
				formatX,
				xAxisType;
			if (props.x.type === 'date') {
				var dateFormat = props.x.format || '%Y-%m-%d';
				formatX = d3.time.format(dateFormat);
				parseX = formatX.parse;
				xAxisType = 'timeseries';
			} else {
				var numberFormat = props.x.format || defaultNumberFormat;
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
					bindto: self.container,
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
								count: props.x.numTicks,
								rotate: 90,
								outer: false
							}
						},
						y: {
							tick: {
								outer: false,
								format: formatY
							}
						}
					}
				});
			});
		}
	};

	C3Enthral.enthralPropTypes = {
		// tsv: PropTypes.string.isRequired
	};

	return C3Enthral;
});
