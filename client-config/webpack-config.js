var path = require("path");
var webpack = require("webpack");
var loadersByExtension = require("./loadersByExtension");

module.exports = function(options) {
	//=====================ENTRY======================
	var entry = {
		main: "./client-app/mainApp"
	};
	//=====================LOADERS======================
	var babel = "babel?presets[]=es2015&presets[]=stage-0&plugins[]=syntax-decorators&plugins[]=transform-decorators";
	var loaders = {
		js: {
			loader: babel,
			include: path.join(__dirname, "../client-app")
		},
		json: "json-loader",
		coffee: "coffee-redux-loader",
		json5: "json5-loader",
		txt: "raw-loader",
		"png|jpg|jpeg|gif|svg": "url-loader?limit=10000",
		"woff|woff2": "url-loader?limit=100000",
		"ttf|eot": "file-loader",
		"wav|mp3": "file-loader",
		html: "html-loader",
		"md|markdown": ["html-loader", "markdown-loader"]
	};

	loaders = loadersByExtension(loaders);
	var additionalLoaders = [
		// { test: /some-reg-exp$/, loader: "any-loader" }
	];
	var alias = {

	};
	var aliasLoader = {

	};
	var externals = [

	];
	//=====================PATHS======================
	var modulesDirectories = ["web_modules", "node_modules"];
	var extensions = ["", ".web.js", ".js", ".jsx"];
	var root = path.join(__dirname, "../client-app");
	var publicPath = options.devServer ?
		"http://localhost:2992/static/" :
		"/dist/client/";
	var output = {
		path: path.join(__dirname, "../dist", options.prerender ? "prerender" : "client"),
		publicPath: publicPath,
		filename: "[name].js" + (options.longTermCaching && !options.prerender ? "?[chunkhash]" : ""),
		chunkFilename: (options.devServer ? "[id].js" : "[name].js") + (options.longTermCaching && !options.prerender ? "?[chunkhash]" : ""),
		sourceMapFilename: "debugging/[file].map",
		libraryTarget: options.prerender ? "commonjs2" : undefined,
		pathinfo: options.debug || options.prerender
	};
	//=====================PLUGINS======================
	var plugins = [
		new webpack.ProvidePlugin({
			fetch: "imports?this=>global!exports?global.fetch!whatwg-fetch"
		})
	];
	if (options.commonsChunk) {
		plugins.push(new webpack.optimize.CommonsChunkPlugin("commons", "commons.js" + (options.longTermCaching && !options.prerender ? "?[chunkhash]" : "")));
	}
	if (options.minimize && !options.prerender) {
		plugins.push(
			new webpack.optimize.UglifyJsPlugin({compressor: {warnings: false}}),
			new webpack.optimize.DedupePlugin()
		);
	}
	if (options.minimize) {
		plugins.push(
			new webpack.DefinePlugin({"process.env": {NODE_ENV: JSON.stringify("production")}}),
			new webpack.NoErrorsPlugin()
		);
	}
	//=====================STATS======================
	var excludeFromStats = [
		/node_modules[\\\/]/
	];

	return {
		cache: true,
		entry: entry,
		output: output,
		target: options.prerender ? "node" : "web",
		module: {
			loaders: [].concat(loaders).concat(additionalLoaders)
		},
		devtool: options.devtool,
		debug: options.debug,
		resolveLoader: {
			root: path.join(__dirname, "node_modules"),
			alias: aliasLoader
		},
		externals: externals,
		resolve: {
			root: root,
			modulesDirectories: modulesDirectories,
			extensions: extensions,
			alias: alias
		},
		plugins: plugins,
		devServer: {
			stats: {
				cached: false,
				exclude: excludeFromStats
			}
		}
	};
};
