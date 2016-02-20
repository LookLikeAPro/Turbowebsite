module.exports = [
	require("./webpack-config")({
		longTermCaching: true,
		minimize: true
		// devtool: "source-map"
	})
];
