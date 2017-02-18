define(['enthral', 'd3/v3', 'c3', 'css!c3/styles'], function (enthral, d3, c3) {
	"use strict";
	var C3PieEnthral = function(config) {
		var header = document.createElement('h1'),
			graphContainer = document.createElement('div');
		config.container.appendChild(graphContainer);
		header.style.marginTop = "20px";
		header.style.fontFamily = "sans-serif";
		header.style.fontSize = "16px";
		header.style.textAlign = "center";
		header.style.fontWeight = "500";

		this.render = function(props) {
			// Set up the header.
			header.innerText = props.title;
			if (props.title && header.parentNode !== config.container) {
				config.container.prepend(header);
			} else if (!props.title && header.parentNode === config.container) {
				config.container.remove(header);
			}

			// Set up the graph.
			var columns = props.segments.map(function (s) {
				return [s.label, s.value]
			});
			var chart = c3.generate({
				bindto: graphContainer,
				data: {
					columns: columns,
					type : (props.donut) ? 'donut' : 'pie'
				},
				pie: {
					label: {
						format: function (value, ratio, id) {
							return d3.format(props.format)(value);
						}
					}
				},
				tooltip: {
					format: {
						value: d3.format(props.format)
					}
				},
				legend: props.legend
			});
		}
	};

	C3PieEnthral.enthralPropTypes = {/*
		title: PropTypes.string,
		donut: PropTypes.boolean,
		legend: PropTypes.shape({
			position: PropTypes.oneOf(['bottom', 'right']),
			show: PropTypes.boolean
		}),
		format: PropTypes.oneOf(['$', '%']),
		segments: PropTypes.arrayOf(PropTypes.shape({
			label: PropTypes.string.isRequired,
			value: PropTypes.number.isRequired,
		})).isRequired
	*/};

	return C3PieEnthral;
});
