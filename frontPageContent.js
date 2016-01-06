$('body').ready(main);
console.log("frontPageContent.js");
var markIconsViewed, viewedPosts;

//Create a MutationObserver to check for changes on the page.
var mutationObserver = new MutationObserver( function(mutations) {
	for(var i = 0; i < mutations.length; i++){
		var mut = mutations[i];
		for(var j=0; j < mut.addedNodes.length; ++j){
			//console.log(mut.addedNodes[j].className + " ::: " + mut.addedNodes[j].nodeName);
			if(mut.addedNodes[j].className === undefined) continue;
			else if(mut.addedNodes[j].className === "posts br5" || mut.addedNodes[j].className === "outside-loader") {
				addViewedTexts();
			}
		}
	}   
} );
mutationObserver.observe(document, { subtree: true, childList: true });

function main() {
	chrome.storage.sync.get({ 
		//Set defaults.
		viewedIconsEnabled: true
	}, function(items) {
		markIconsViewed = items.viewedIconsEnabled;
		
		if (markIconsViewed) {
			chrome.storage.local.get({
				viewedPosts: new Array()
			}, function(items2) {
				viewedPostsArray = items2.viewedPosts;
				
				//Give style to our added elements.
				var css = ".alreadyViewedIdentifier { position:absolute;z-index:1;top:1px;right:1px;background-color:rgba(0,0,0,0.5);color:white;font-weight:bold;line-height:20px; }";
				var style = document.createElement("style");
				style.appendChild(document.createTextNode(css));
				document.getElementsByTagName('head')[0].appendChild(style);
					
				addViewedTexts();	
				
			});
		}
	});
}

function addViewedTexts() {
	var postIcons = document.getElementsByClassName("post");
	for (i = 0; i < postIcons.length; i++) {
		if (postIcons[i].getElementsByClassName("alreadyViewedIdentifier").length == 0) {
				var postIconID = postIcons[i].getAttribute("id");
				var startIndex = 0;
				if (postIconID.indexOf("/gallery/") == 0)
					startIndex = 9;
				
				if (viewedPostsArray.indexOf(postIconID.substring(startIndex, postIconID.length)) > -1) {
					var viewedSpan = document.createElement("span");
					viewedSpan.setAttribute("class", "alreadyViewedIdentifier");
					viewedSpan.innerHTML = "Viewed";
					
					postIcons[i].appendChild(viewedSpan);
				}
		}
	}
}

