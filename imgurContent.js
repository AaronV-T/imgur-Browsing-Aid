$('body').ready(main);

var skipPromoted, closeTopBar, removeViaMobileSpans, blockedUserList, followedUserList, favoriteCommentList;
var postUser;
var rightTrueLeftFalse = true;
var lastCommentUpdateTime = 0, lastCommentUpdateSkipped = false;

//Create a MutationObserver to check if the user goes to a new post.
var mutationObserver = new MutationObserver( function(mutations) {
	for(var i = 0; i < mutations.length; i++){
		var mut = mutations[i];
		for(var j=0; j < mut.addedNodes.length; ++j){
			//console.log(mut.addedNodes[j].className + " ::: " + mut.addedNodes[j].nodeName);
			if(mut.addedNodes[j].className === undefined) continue;
			else if(mut.addedNodes[j].className === "humanMsg")
				onNewPost();
			else if((mut.addedNodes[j].className.indexOf("comment") > -1 || mut.addedNodes[j].className.indexOf("children") > -1) && mut.addedNodes[j].className != "favorite-comment")
				onCommentsLoaded();
			//The following node classNames all change once per new post: humanMsg, point-info left bold, views-info left
			
		}
	}   
} );
mutationObserver.observe(document, { subtree: true, childList: true });

//Add an event listener so that our "block user" and "follow user" buttons can communicate with us. **Old method of listening, may change to add click event listener to the buttons directly.**
window.addEventListener("message", function(event) {
  if (event.source != window) // Only accept messages from ourself.
    return;

  if (event.data.type && (event.data.type == "FROM_PAGE")) {
	if (event.data.text.indexOf("block") == 0 && event.data.text.indexOf("user:") > -1) {
		var startIndex = event.data.text.indexOf("user:") + 5;
		var userName = event.data.text.substring(startIndex, event.data.text.length);
		blockUser(userName);
	}
	else if (event.data.text.indexOf("follow") == 0 && event.data.text.indexOf("user:") > -1) {
		var startIndex = event.data.text.indexOf("user:") + 5;
		var userName = event.data.text.substring(startIndex, event.data.text.length);
		followUser(userName);
	}
  }
}, false);


$(function() { //Keydown listener for left and right arrows. 
   $(window).keydown(function(e) {
       if(e.which == 37)
		   rightTrueLeftFalse = false;
	   else if (e.which == 39)
		   rightTrueLeftFalse = true;
   });
});

/*



*/

//main: Load options from storage and call member functions.
function main() {
	if (window.location.href.indexOf("favorites") > -1 && window.location.href.indexOf("favorites/") == -1) //If this is a favorites page, don't run. (This should be implemented a better way.)
		return;

	//Load options from storage, close top bar, add the button to block users, and call the onNewPost function.
	chrome.storage.sync.get({ 
		//Set defaults.
		promotedSkipEnabled: false,
		topBarCloseEnabled: true,
		removeViaMobileSpansEnabled: true
	}, function(items) {
		skipPromoted = items.promotedSkipEnabled;
		closeTopBar = items.topBarCloseEnabled;
		removeViaMobileSpans = items.removeViaMobileSpansEnabled;
		
		if (closeTopBar)
			checkForTopBarAndClose();
	
		addBookmarkButton();
		addFollowButton();
		addBlockButton();
		
		onNewPost();
	});
}

//onCommentsLoaded: Called when comments are loaded or a change is detected in the comments. Calls comment member functions.
function onCommentsLoaded() {
	var d = new Date();
	var currTime = d.getTime();
	//console.log(currTime - lastCommentUpdateTime);
	if (currTime - lastCommentUpdateTime > 500) {
		if (removeViaMobileSpans)
			removeViaElements();
		
		addFavoriteCommentButtons();
		
		lastCommentUpdateTime = currTime;
		//lastCommentUpdateSkipped = false;
	}
	//else
		//lastCommentUpdateSkipped = true;
}

//onNewPost: Called when a new post is viewed.
function onNewPost() {
	var postSkipped = false;
	
	if (skipPromoted && !postSkipped)
		postSkipped = checkIfPromotedPost();

	if(!postSkipped) {
		var postUserElement = document.getElementsByClassName("post-account")[0];
		if (postUserElement !== undefined)
			postUser = postUserElement.innerHTML;
		else
			postUser = "";
		
		postSkipped = checkForBlockedUsers();
	}	
}

/*



*/

//addBlockButton: Adds block user button to post options.
function addBlockButton() {
	var blockPosterDiv = document.createElement("div");
	blockPosterDiv.setAttribute("style", "text-align:center");
	blockPosterDiv.setAttribute("id", "block-poster");
	
	var textNode = document.createTextNode("block user");
	blockPosterDiv.appendChild(textNode);
	document.getElementById("options-btn").getElementsByClassName("options")[0].appendChild(blockPosterDiv);
	
	document.getElementById("block-poster").addEventListener("click", function() {
		window.postMessage({ type: "FROM_PAGE", text: "block user:" + postUser }, "*");
	}, false);
}

//addBookmarkButton: Adds bookmark post button to post options.
function addBookmarkButton() {
	var bookmarkPostDiv = document.createElement("div");
	bookmarkPostDiv.setAttribute("style", "text-align:center;");
	bookmarkPostDiv.setAttribute("id", "bookmark-post");
	
	var textNode = document.createTextNode("bookmark post");
	bookmarkPostDiv.appendChild(textNode);
	document.getElementById("options-btn").getElementsByClassName("options")[0].appendChild(bookmarkPostDiv);
	
	bookmarkPostDiv.addEventListener('click', bookmarkPost);
}

//addFavoriteCommentButtons: Removes any existing favorite comment buttons and adds a favorite comment button to each visible comment.
function addFavoriteCommentButtons() {
	var existingFavoriteButtons = document.getElementsByClassName("favorite-comment");
	for (i = 0; i < existingFavoriteButtons.length; i++)
		$('.favorite-comment').remove();
	
	console.log("adding comment buttons");
	var commentOptionsButtons = document.getElementsByClassName("caption-toolbar edit-button like-combobox-but-not ");
	for (i = 0; i < commentOptionsButtons.length; i++) {
		var favoriteCommentDiv = document.createElement("div");
		favoriteCommentDiv.setAttribute("class", "favorite-comment");
		favoriteCommentDiv.setAttribute("style", "text-align:left;padding-left:10px;;");
		var textNode = document.createTextNode("favorite");
		favoriteCommentDiv.appendChild(textNode);
		console.log("added favorite comment button");
		commentOptionsButtons[i].getElementsByClassName("options")[0].appendChild(favoriteCommentDiv);
	}
	
	var favoriteCommentDivs = document.getElementsByClassName("favorite-comment");
	for (i = 0; i < favoriteCommentDivs.length; i++)
		favoriteCommentDivs[i].addEventListener("click", favoriteComment);
}

//addFollowButton: Adds follow user button to post options.
function addFollowButton() {
	var followPosterDiv = document.createElement("div");
	followPosterDiv.setAttribute("style", "text-align:center;");
	followPosterDiv.setAttribute("id", "follow-poster");
	
	var textNode = document.createTextNode("follow user");
	followPosterDiv.appendChild(textNode);
	document.getElementById("options-btn").getElementsByClassName("options")[0].appendChild(followPosterDiv);
	
	document.getElementById("follow-poster").addEventListener("click", function() {
		window.postMessage({ type: "FROM_PAGE", text: "follow user:" + postUser }, "*");
	}, false);
}

//blockUser: Adds user to blocked user list and then skips current post.
function blockUser(userName) {
	if (userName === "") {
		console.log("No username detected, unable to block.");
		return;
	}
	
	console.log("blocking " + userName);
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) {
			chrome.storage.sync.get({ 
				//Set defaults.
				blockedUsers: new Array()
			}, function(items) {
				blockedUserList = items.blockedUsers;
				
				blockedUserList.push(userName);
				
				chrome.storage.sync.set({
					blockedUsers: blockedUserList
				}, function() {
					skipPost();
				});
			});
		}
		else {
			chrome.storage.local.get({ 
				//Set defaults.
				blockedUsers: new Array()
			}, function(items) {
				blockedUserList = items.blockedUsers;
				
				blockedUserList.push(userName);
				
				chrome.storage.local.set({
					blockedUsers: blockedUserList
				}, function() {
					skipPost();
				});
			});
		}
	});
}

//bookmarkPost: Adds post to bookmarked posts(favoritedImages).
function bookmarkPost() {
	var bookmarkedArrayMaxLength = 45;
	
	var titleCutoffIndex = 30;
	if (document.getElementsByClassName("post-title font-opensans-bold")[0] < 30)
		titleCutoffIndex = document.getElementsByClassName("post-title font-opensans-bold")[0].innerHTML.length;
	
	
	var shortUrlStartIndex = document.getElementsByClassName("sg-item selected grid")[0].getAttribute("style").indexOf(".com/") + 5;
	var shortUrlEndIndex = document.getElementsByClassName("sg-item selected grid")[0].getAttribute("style").indexOf(".jpg");


	var bookmarkedImg = {
		id: document.getElementsByClassName("post-image-container")[0].getAttribute("id"),
		imgSrc: document.getElementsByClassName("sg-item selected grid")[0].getAttribute("style").substring(shortUrlStartIndex, shortUrlEndIndex),
		title: document.getElementsByClassName("post-title font-opensans-bold")[0].innerHTML.substring(0, titleCutoffIndex),
		directory: "root"
	}
	
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) { //If the they have selected to use Chrome sync for storage...
			chrome.storage.sync.get({ 
				//Set defaults.
				favoritedImages: new Array(),
				favoritedImages1: new Array(),
				favoritedImages2: new Array(),
				favoritedImages3: new Array(),
				favoritedImages4: new Array(),
				favoritedImages5: new Array(),
				favoritedImages6: new Array(),
				favoritedImages7: new Array(),
				favoritedImages8: new Array(),
				favoritedImages9: new Array(),
				favoritedImages10: new Array(),
				favoritedImages11: new Array(),
				favoritedImages12: new Array(),
				favoritedImages13: new Array()
			}, function(items) {
				var bookmarkedImagesArray = items.favoritedImages;
				if (items.favoritedImages1.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages1);
				if (items.favoritedImages2.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages2);
				if (items.favoritedImages3.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages3);
				if (items.favoritedImages4.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages4);
				if (items.favoritedImages5.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages5);
				if (items.favoritedImages6.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages6);
				if (items.favoritedImages7.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages7);
				if (items.favoritedImages8.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages8);
				if (items.favoritedImages9.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages9);
				if (items.favoritedImages10.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages10);
				if (items.favoritedImages11.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages11);
				if (items.favoritedImages12.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages12);
				if (items.favoritedImages13.length > 0)
					bookmarkedImagesArray.push.apply(bookmarkedImagesArray, items.favoritedImages13);
				
				bookmarkedImagesArray.push(bookmarkedImg);
				
				chrome.storage.sync.set({
					favoritedImages: bookmarkedImagesArray.slice(0, bookmarkedArrayMaxLength),
					favoritedImages1: bookmarkedImagesArray.slice(bookmarkedArrayMaxLength , 2 * bookmarkedArrayMaxLength),
					favoritedImages2: bookmarkedImagesArray.slice(2 * bookmarkedArrayMaxLength , 3 * bookmarkedArrayMaxLength),
					favoritedImages3: bookmarkedImagesArray.slice(3 * bookmarkedArrayMaxLength , 4 * bookmarkedArrayMaxLength),
					favoritedImages4: bookmarkedImagesArray.slice(4 * bookmarkedArrayMaxLength , 5 * bookmarkedArrayMaxLength),
					favoritedImages5: bookmarkedImagesArray.slice(5 * bookmarkedArrayMaxLength , 6 * bookmarkedArrayMaxLength),
					favoritedImages6: bookmarkedImagesArray.slice(6 * bookmarkedArrayMaxLength , 7 * bookmarkedArrayMaxLength),
					favoritedImages7: bookmarkedImagesArray.slice(7 * bookmarkedArrayMaxLength , 8 * bookmarkedArrayMaxLength),
					favoritedImages8: bookmarkedImagesArray.slice(8 * bookmarkedArrayMaxLength , 9 * bookmarkedArrayMaxLength),
					favoritedImages9: bookmarkedImagesArray.slice(9 * bookmarkedArrayMaxLength , 10 * bookmarkedArrayMaxLength),
					favoritedImages10: bookmarkedImagesArray.slice(10 * bookmarkedArrayMaxLength , 11 * bookmarkedArrayMaxLength),
					favoritedImages11: bookmarkedImagesArray.slice(11 * bookmarkedArrayMaxLength , 12 * bookmarkedArrayMaxLength),
					favoritedImages12: bookmarkedImagesArray.slice(12 * bookmarkedArrayMaxLength , 13 * bookmarkedArrayMaxLength),
					favoritedImages13: bookmarkedImagesArray.slice(13 * bookmarkedArrayMaxLength , 14 * bookmarkedArrayMaxLength)
				}, function() {
					if (!chrome.runtime.lastError)
						console.log("post bookmarked");
				});
			});
		}
		else {
			chrome.storage.local.get({ 
				//Set defaults.
				favoritedImages: new Array()
			}, function(items) {
				var bookmarkedImagesArray = items.favoritedImages;
				
				bookmarkedImagesArray.push(bookmarkedImg);
				
				chrome.storage.local.set({
					favoritedImages: bookmarkedImagesArray
				}, function() {
					if (!chrome.runtime.lastError)
						console.log("post bookmarked");
				});
			});
		}
	});
}

//checkForBlockedUsers: Checks if post creator is blocks, skips post if user is blocked.
function checkForBlockedUsers() {
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) { //If the they have selected to use Chrome sync for storage...
			chrome.storage.sync.get({ 
				//Set defaults.
				blockedUsers: new Array()
			}, function(items) {
				blockedUserList = items.blockedUsers;
				
				for (i = 0; i < blockedUserList.length; i++) {
					if (blockedUserList[i].toLowerCase() === postUser.toLowerCase()) {
						console.log("***Post's creator (" + blockedUserList[i] + ") has been blocked, skipping.***")
						skipPost();
						return true;
					}
				}
				return false;
			});
		}
		else {
			chrome.storage.local.get({ 
				//Set defaults.
				blockedUsers: new Array()
			}, function(items) {
				blockedUserList = items.blockedUsers;
				
				for (i = 0; i < blockedUserList.length; i++) {
					if (blockedUserList[i].toLowerCase() === postUser.toLowerCase()) {
						console.log("***Post's creator (" + blockedUserList[i] + ") has been blocked, skipping.***")
						skipPost();
						return true;
					}
				}
				return false;
			});
		}
	});
}

//checkForTopBarAndClose: If notifications bar is open, close it.
function checkForTopBarAndClose() {
	var closeButtons = document.getElementsByClassName("cta-close icon-x");
	if (closeButtons.length > 0) {
		closeButtons[0].click();
		console.log("Top bar detected and closed.");
	}
}

//checkIfPromotedPost: If this is a promoted post, skip it.
function checkIfPromotedPost() {
	if (document.getElementsByClassName("promoted-tag").length > 0) {	
		console.log("***Promoted post, skipping.***");
		skipPost();
		return true;
	}
	else 
		return false;
}

//favoriteComment: Adds comment to favoriteComments.
function favoriteComment() {
	var superParent = this.parentNode.parentNode.parentNode.parentNode;
	console.log("https://imgur.com" + superParent.getElementsByClassName("item permalink-caption-link")[0].getAttribute("href"));
	console.log(superParent.getElementsByClassName("author")[0].children[0].innerHTML);
	console.log(superParent.getElementsByTagName("p")[0].firstChild.innerHTML);
	var comment = {
		url: "https://imgur.com" + superParent.getElementsByClassName("item permalink-caption-link")[0].getAttribute("href"),
		userName: superParent.getElementsByClassName("author")[0].children[0].innerHTML,
		text: superParent.getElementsByTagName("p")[0].firstChild.innerHTML
	};
	
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) { //If the they have selected to use Chrome sync for storage...
			chrome.storage.sync.get({ 
				//Set defaults.
				favoriteComments: new Array()
			}, function(items) {
				favoriteCommentList = items.favoriteComments;
				
				favoriteCommentList.push(comment);
				
				chrome.storage.sync.set({
					favoriteComments: favoriteCommentList
				}, function() {
					superParent.getElementsByClassName("caption-toolbar edit-button like-combobox-but-not  opened")[0].setAttribute("class", "caption-toolbar edit-button like-combobox-but-not ");
				});
			});
		}
		else {
			chrome.storage.local.get({ 
				//Set defaults.
				favoriteComments: new Array()
			}, function(items) {
				favoriteCommentList = items.favoriteComments;
				
				favoriteCommentList.push(comment);
				
				chrome.storage.local.set({
					favoriteComments: favoriteCommentList
				}, function() {
					superParent.getElementsByClassName("caption-toolbar edit-button like-combobox-but-not  opened")[0].setAttribute("class", "caption-toolbar edit-button like-combobox-but-not ");
				});
			});
		}
	});
	
}

//followUser: Adds user to followed user list.
function followUser(userName) {
	if (userName === "") {
		console.log("No username detected, unable to follow.");
		return;
	}
	
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) { //If the they have selected to use Chrome sync for storage...
			chrome.storage.sync.get({ 
				//Set defaults.
				followedUsers: new Array()
			}, function(items) {
				followedUserList = items.followedUsers;
				
				if ($.inArray(userName, followedUserList) > -1) 
					console.log(userName + " already followed.");
				else {
					followedUserList.push(userName);
					console.log("following " + userName);
					
					chrome.storage.sync.set({
						followedUsers: followedUserList
					}, function() {});
				}
			});
		}
		else {
			chrome.storage.local.get({ 
				//Set defaults.
				followedUsers: new Array()
			}, function(items) {
				followedUserList = items.followedUsers;
				
				if ($.inArray(userName, followedUserList) > -1) 
					console.log(userName + " already followed.");
				else {
					followedUserList.push(userName);
					console.log("following " + userName);
					
					chrome.storage.local.set({
						followedUsers: followedUserList
					}, function() {});
				}
			});
		}
	});
}

//removeViaElements: Removes "via Android" and "via iPhone" links next to comment author names.
function removeViaElements() {
	//Not working everytime, what do we have to wait for?
	var viaClassElements = document.getElementsByClassName("via");
	var origLength = viaClassElements.length;
	
	console.log("starting removal: " + origLength);
	for (i = 0; i < origLength; i++) {
		//console.log(i + " " + origLength + " removing via: " + viaClassElements[0].parentNode.firstChild.innerHTML);
		viaClassElements[0].parentNode.removeChild(viaClassElements[0]);
	}
	
}

//skipPost: Clicks the next or previous button depending on if the right arrow key or left array key was pushed last.
function skipPost() {
	if (rightTrueLeftFalse)
		document.getElementsByClassName("btn btn-action navNext")[0].click();
	else 
		document.getElementsByClassName("btn navPrev icon icon-arrow-left")[0].click();
}