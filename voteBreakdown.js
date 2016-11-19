//import { $ } from '../vendor';
import { Module } from '../core/module';
import { isPageType } from '../utils';

export const module: Module<*> = new Module('voteBreakdown');
module.moduleName = 'voteBreakdown';
module.category = 'commentsCategory';
module.description = 'Turns scores into up/down detailed breakdown';
//module.options = {   //not sure if necessary
	breakdownEnabled: {
		type: 'boolean',
		value: true,
		description: 'Turns thread scores into a detailed up/down count.',
	};



// See PageType (utils/location.js) for other page types
module.include = ['comments']; // Optional: defaults to including all pages
};

module.go = () => { // Optional: runs after <body> is ready and `beforeLoad` (in all modules) is complete
	function nodeToString ( node ) {  //to extract the number of votes from the html span
		var tmpNode = document.createElement( "div" );
		tmpNode.appendChild( node.cloneNode( true ) );
		var str = tmpNode.innerHTML;
		tmpNode = node = null; // prevent memory leaks in IE
		return str;
	}
	score = nodeToString(document.querySelector(".linkinfo .score .number"));
	total = nodeToString(document.querySelector(".linkinfo .totalvotes .number"));
	score = parseInt(score.replace ( /[^\d.]/g, '' )); //getting rid of html tags, only keeping the integer
	if (score > 0){
		total = parseInt(total.replace ( /[^\d.]/g, '' ));
		var downvotes = (total - score)/2;
		var upvotes = (total - downvotes); //obviously
		alert((upvotes)+' upvotes and '+(downvotes)+' downvotes.')
	}
}
