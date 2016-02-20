import hyperscriptParser from "virtual-hyperscript-parser";
import diff from "virtual-dom/diff";
import patch from "virtual-dom/patch";
import {createHistory} from "history";
import isLinkExternal from "utils/isLinkExternal";

let history = createHistory();

var previousLocation;

let unlisten = history.listen(location => {
	if (!previousLocation) {
		previousLocation = location;
		return;
	}
	fetchPage(location.pathname).then(function(page) {
		var body = page.substring(page.indexOf("<body"), page.indexOf("</body")+7);
		changeDOM(hyperscriptParser(body, {afterCreateNode: nodeModifier}));
	});
	previousLocation = location;
});

var content = document.getElementsByTagName("body")[0];

var tree;

function changeDOM(newTree) {
	var patches = diff(tree, newTree);
	// console.log(patches);
	content = patch(content, patches);
	tree = newTree;
}

function nodeModifier(node) {
	if (node.tagName === "A" && !isLinkExternal(node.properties.href)) {
		node.properties.onclick = function(e) {
			e.preventDefault();
			history.push({
				pathname: node.properties.href
			});
		};
	}
}

function inital() {
	tree = hyperscriptParser(content);
	var newTree = hyperscriptParser(content, {afterCreateNode: nodeModifier});
	changeDOM(newTree);
}

function fetchPage(url) {
	var headers = new Headers();
	headers.append("X-PJAX");
	return fetch(url, {
		method: "GET",
		headers: headers
	}).then(function(res) {
		return res.text();
	});
}

inital();
