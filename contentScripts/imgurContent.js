//Check if the page is an "over capacity" error page.
$('body').ready(function() {
	var h1Elements = document.getElementsByTagName("h1");
	
	for (i = 0; i < h1Elements.length; i++) {
		if (h1Elements[i].innerHTML == "Imgur is over capacity!") 
			return;
	}
	
	imgurContentMain();
});

var skipPromoted, closeTopBar, removeViaMobileSpans, canSlideShow, slideShowTime, blockedUserList, followedUserList, favoriteCommentList;
var notifyOnSpecialUsers, notifyOnTollski, markIconsViewed, skipViewed, viewedPostsArray;
var blockReddit, blockedKeywordsArray, blockedSubredditsArray
var postUser, postID;
var rightTrueLeftFalse = true;
var lastCommentUpdateTime = 0, lastCommentUpdateSkipped = false;
var slideShowInterval, slideShowRunning = false, slideShowPaused = false, slideShowSecondsRemaining;
var isFirstPostAfterPageLoad;
var clickingBecauseSkipping = false;

//Create a MutationObserver to check for changes on the page.
var mutationObserver = new MutationObserver( function(mutations) {
	for(var i = 0; i < mutations.length; i++){
		var mut = mutations[i];
		for(var j=0; j < mut.addedNodes.length; ++j){
			//console.log(mut.addedNodes[j].className + " ::: " + mut.addedNodes[j].nodeName);
			if(mut.addedNodes[j].className === undefined) continue;
			else if(mut.addedNodes[j].className.indexOf("humanMsg") >-1 ) {
				if (isFirstPostAfterPageLoad)
					isFirstPostAfterPageLoad = false;
				setTimeout(function() {
					onNewPost();
				}, 10);
				//The following node classNames all change once per new post: humanMsg, point-info left bold, views-info left
			}
			else if((mut.addedNodes[j].className.indexOf("comment") > -1 || mut.addedNodes[j].className.indexOf("children") > -1) && mut.addedNodes[j].className != "favorite-comment")
				onCommentsLoaded();
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

$(function() { //Keydown listener
	$(window).keydown(function(e) {
		if(e.which == 37) { //Left arrow key
			movedBack();
		}
		else if (e.which == 39) { //Right arrow key
			movedForward();
		}
		else if (e.which == 69) { //'e' key
			if (slideShowRunning)
				slideShowStop();
		}
		else if (e.which == 80) { //'p' key
			if (slideShowRunning)
				slideShowPauseToggle();
		}
		else if (e.which == 120) { //'F9' key
            if (window.location.href.indexOf("imgur.com/account/favorites/") > -1) { //Don't skip already viewed images when browsing your own favorites list.
                addNotification("Notification:", "Skipping of viewed posts not available when browsing your own favorites.");
				return;
            }
		
			if (skipViewed)
				addNotification("Notification:", "Skipping of viewed posts has been temporarily disabled. Press 'F9' to re-enable."); //Call function in notificationsContent.js
			else
				addNotification("Notification:", "Skipping of viewed posts has been temporarily enabled. Press 'F9' to disable."); //Call function in notificationsContent.js
			
			skipViewed = !skipViewed;
		}
	});
});


/*



*/

//imgurContentMain: Load options from storage and call member functions.
function imgurContentMain() {
	//Load options from storage, close top bar, add the button to block users, and call the onNewPost function.
	chrome.storage.sync.get({ 
		//Set defaults.
		promotedSkipEnabled: false,
		topBarCloseEnabled: true,
		removeViaMobileSpansEnabled: true,
		slideShowModeEnabled: true,
		slideShowSecondsPerPost: 10,
		specialUserNotificationEnabled: true,
		tollskiNotificationEnabled: true,
		viewedIconsEnabled: true,
		skipViewedPostsEnabled: false
	}, function(items) {
		skipPromoted = items.promotedSkipEnabled;
		closeTopBar = items.topBarCloseEnabled;
		removeViaMobileSpans = items.removeViaMobileSpansEnabled;
		canSlideShow = items.slideShowModeEnabled;
		slideShowTime = items.slideShowSecondsPerPost;
		notifyOnSpecialUsers = items.specialUserNotificationEnabled;
		notifyOnTollski = items.tollskiNotificationEnabled;
		markIconsViewed = items.viewedIconsEnabled;
		skipViewed = items.skipViewedPostsEnabled;
		
		chrome.storage.local.get({
			blockAllSubreddits: false,
			blockedKeywords: new Array(),
			blockedSubreddits: new Array(),
			viewedPosts: new Array()
		}, function(items2) {
			blockReddit = items2.blockAllSubreddits;
			blockedKeywordsArray = items2.blockedKeywords;
			blockedSubredditsArray = items2.blockedSubreddits;
			viewedPostsArray = items2.viewedPosts;
			
			chrome.storage.local.getBytesInUse("viewedPosts", function(bytesInUse) { console.log("viewedPosts bytesInUse: " + bytesInUse + ". length: " + items2.viewedPosts.length); });
			
			if (closeTopBar)
			checkForTopBarAndClose();
	
			/*addBookmarkButton();
			addFollowButton();
			addBlockButton();
			if (canSlideShow)
				addToggleSlideShowButton();
			if (skipViewed)
				addViewedTexts();*/
			
			//Give style to our added buttons and other elements.
			var buttonHoverCss = ".addedPostOptionDiv:hover { background-color:#E8E7E6; } .favorite-comment:hover { background-color:#E8E7E6; } .alreadyViewedIdentifier { position:absolute;z-index:1;top:1px;right:1px;background-color:rgba(0,0,0,0.5);color:white;font-weight:bold; }";
			var style = document.createElement("style");
			style.appendChild(document.createTextNode(buttonHoverCss));
			document.getElementsByTagName('head')[0].appendChild(style);
			
			isFirstPostAfterPageLoad = true;
			onNewPost();
			
			document.getElementsByClassName("btn btn-action navNext")[0].addEventListener("click", movedForward);
			document.getElementsByClassName("btn navPrev icon icon-arrow-left")[0].addEventListener("click", movedBack);
			document.getElementById("side-gallery").addEventListener("click", sideGalleryClicked); //If a thumbnail was clicked: treat it like the user moved back in the gallery.
			
			var checkCount = 0;
			var checkThumbnails = setInterval(function() { //Check if the thumbnails have loaded once every 500ms (max 60 checks). If they have loaded: add the viewed icons.
				console.log("checking");
				var sgItems = document.getElementsByClassName("sg-item grid");
				
				if (sgItems.length > 0) {
					clearInterval(checkThumbnails);
					addViewedTexts();
				}
				else if (checkCount >= 60) 
					clearInterval(checkThumnails);
				else
					checkCount++;
			}, 500);
		});
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
		
		var currentURL = window.location.href;
		
		var startIndex = -1;
		if (currentURL.indexOf("imgur.com/gallery/") > -1)
			startIndex = currentURL.indexOf("imgur.com/gallery/") + 18;
		else if (currentURL.indexOf("/favorites/") > -1)
			startIndex = currentURL.indexOf("/favorites/") + 11;
		else if (currentURL.indexOf("imgur.com/a/") > -1)
			startIndex = currentURL.indexOf("imgur.com/a/") + 12;
		else if (currentURL.indexOf("imgur.com/r/") > -1 || currentURL.indexOf("imgur.com/topic/") > -1) {
			startIndex = currentURL.lastIndexOf("/") + 1;
		}
		
		var lastIndex = currentURL.length;
		if (currentURL.substring(startIndex, currentURL.length).indexOf("/") > -1)
			lastIndex = currentURL.substring(startIndex, currentURL.length).indexOf("/");
		
		if (startIndex > -1) {
			postID = currentURL.substring(startIndex, lastIndex);
			
			if (postID.length < 5 || postID.length > 7)
				postID = "unknown";
		}
		else
			postID = "unknown";
		
		if (rightTrueLeftFalse && !isFirstPostAfterPageLoad) {//If the user is moving forward in the gallery: check to see if post should be skipped, then continue to onNewPost2 (from within the functions).
			postSkipped = checkForBlockedKeywords();
			
			if (!postSkipped && postUser.length == 0 && document.getElementsByClassName("post-title-meta")[0].innerHTML.indexOf("reddit.com") > -1)
				postSkipped = checkForBlockedSubreddits();
			
			if (!postSkipped)
				checkForBlockedUsers();
			else
				onNewPost2(postSkipped);
		}
		else //If the user is moving back in the gallery: don't bother skipping the post, just continue to onNewPost2.
			onNewPost2(postSkipped);
	}
}

//onNewPost2: Continuation of onNewPost, called by checkForBlockedUsers when it has finished.
function onNewPost2(postSkipped) {
	if (!postSkipped && skipViewed && !isFirstPostAfterPageLoad && rightTrueLeftFalse) 
		postSkipped = checkIfViewedPost();
	
	
	addBookmarkButton();
	addFollowButton();
	addBlockButton();
	if (canSlideShow)
		addToggleSlideShowButton();
	if (markIconsViewed && !isFirstPostAfterPageLoad)
		addViewedTexts();
	
	if (!postSkipped) {
		if (postID !== "unknown") {
			if (viewedPostsArray.indexOf(postID) == -1) {
				if (viewedPostsArray.length >= 20000)
					viewedPostsArray.shift(); //Remove first element of the array.
				
				viewedPostsArray.push(postID);
				
				chrome.storage.local.set({
					viewedPosts: viewedPostsArray
				}, function() {});
			}
		}
	}
		
	if (!postSkipped)
		checkForSpecialUsers();
	
	onCommentsLoaded();
}

/*



*/

//addBlockButton: Adds block user button to post options.
function addBlockButton() {
	//var blockPosterDiv = document.createElement("div");
	var blockPosterElem = document.createElement("li");
	blockPosterElem.setAttribute("style", "text-align:center");
	blockPosterElem.setAttribute("id", "block-poster");
	blockPosterElem.setAttribute("class", "addedPostOptionDiv");
	
	var textNode = document.createTextNode("block user");
	blockPosterElem.appendChild(textNode);
	//document.getElementById("options-btn").getElementsByClassName("options")[0].appendChild(blockPosterDiv);
	document.getElementsByClassName("post-action-options-items")[0].appendChild(blockPosterElem);
	
	document.getElementById("block-poster").addEventListener("click", function() {
		window.postMessage({ type: "FROM_PAGE", text: "block user:" + postUser }, "*");
	}, false);
}

//addBookmarkButton: Adds bookmark post button to post options.
function addBookmarkButton() {
	//var bookmarkPostDiv = document.createElement("div");
	var bookmarkPostElement = document.createElement("li");
	bookmarkPostElement.setAttribute("style", "text-align:center;");
	bookmarkPostElement.setAttribute("id", "bookmark-post");
	bookmarkPostElement.setAttribute("class", "addedPostOptionDiv");
	
	var textNode = document.createTextNode("bookmark post");
	bookmarkPostElement.appendChild(textNode);
	//document.getElementById("options-btn").getElementsByClassName("options")[0].appendChild(bookmarkPostDiv);
	document.getElementsByClassName("post-action-options-items")[0].appendChild(bookmarkPostElement);
	
	bookmarkPostElement.addEventListener('click', bookmarkPost);
}

//addFavoriteCommentButtons: Removes any existing favorite comment buttons and adds a favorite comment button to each visible comment.
function addFavoriteCommentButtons() {
	var existingFavoriteButtons = document.getElementsByClassName("favorite-comment");
	for (i = 0; i < existingFavoriteButtons.length; i++)
		$('.favorite-comment').remove();
	
	//console.log("adding comment buttons");
	var commentOptionsButtons = document.getElementsByClassName("caption-toolbar edit-button like-combobox-but-not ");
	for (i = 0; i < commentOptionsButtons.length; i++) {
		var favoriteCommentDiv = document.createElement("div");
		favoriteCommentDiv.setAttribute("class", "favorite-comment");
		favoriteCommentDiv.setAttribute("style", "text-align:left;padding-left:10px;;");
		var textNode = document.createTextNode("favorite");
		favoriteCommentDiv.appendChild(textNode);
		//console.log("added favorite comment button");
		commentOptionsButtons[i].getElementsByClassName("options")[0].firstChild.appendChild(favoriteCommentDiv);
	}
	
	var favoriteCommentDivs = document.getElementsByClassName("favorite-comment");
	for (i = 0; i < favoriteCommentDivs.length; i++)
		favoriteCommentDivs[i].addEventListener("click", favoriteComment);
}

//addFollowButton: Adds follow user button to post options.
function addFollowButton() {
	//var followPosterDiv = document.createElement("div");
	var followPosterElem = document.createElement("li");
	followPosterElem.setAttribute("style", "text-align:center;");
	followPosterElem.setAttribute("id", "follow-poster");
	followPosterElem.setAttribute("class", "addedPostOptionDiv");
	
	var textNode = document.createTextNode("follow user");
	followPosterElem.appendChild(textNode);
	//document.getElementById("options-btn").getElementsByClassName("options")[0].appendChild(followPosterDiv);
	document.getElementsByClassName("post-action-options-items")[0].appendChild(followPosterElem);
	
	document.getElementById("follow-poster").addEventListener("click", function() {
		window.postMessage({ type: "FROM_PAGE", text: "follow user:" + postUser }, "*");
	}, false);
}

//addToggleSlideShowButton: Adds slide show toggle button to post options.
function addToggleSlideShowButton() {
	//var slideShowToggleDiv = document.createElement("div");
	var slideShowToggleElem = document.createElement("li");
	slideShowToggleElem.setAttribute("style", "text-align:center;");
	slideShowToggleElem.setAttribute("id", "follow-poster");
	slideShowToggleElem.setAttribute("class", "addedPostOptionDiv");
	
	var textNode = document.createTextNode("toggle slideshow");
	slideShowToggleElem.appendChild(textNode);
	//document.getElementById("options-btn").getElementsByClassName("options")[0].appendChild(slideShowToggleDiv);
	document.getElementsByClassName("post-action-options-items")[0].appendChild(slideShowToggleElem);
	
	slideShowToggleElem.addEventListener("click", slideShowToggle);
}


function addViewedTexts() {
	if (window.location.href.indexOf("imgur.com/account/favorites/") > -1) //Don't add viewed spans on your own favorites list thumbnails.
		return;
	
	var postThumbnails = document.getElementsByClassName("sg-item grid");
	for (i = 0; i < postThumbnails.length; i++) {
		if (postThumbnails[i].getElementsByClassName("alreadyViewedIdentifier").length == 0) {
				var postIconID = postThumbnails[i].getAttribute("href");
				var startIndex = 1;
				if (postIconID.indexOf("/a/") == 0)
					startIndex = 3;
				
				if (viewedPostsArray.indexOf(postThumbnails[i].getAttribute("href").substring(startIndex, postIconID.length)) > -1) {
					var viewedSpan = document.createElement("span");
					viewedSpan.setAttribute("class", "alreadyViewedIdentifier");
					viewedSpan.innerHTML = "Viewed";
					
					postThumbnails[i].appendChild(viewedSpan);
					
					if (postThumbnails[i].getElementsByClassName("sg-item-num-images").length > 0) //If the thumbnail has an image-number icon: move it down.
						$(postThumbnails[i].getElementsByClassName("sg-item-num-images")[0]).css("top", "24px");
				}
		}
	}
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
	if (postID === "unknown") {
		alert("Oops, I wasn't able to get the post ID. Please sumbit a bug report with the URL of this page.");
		return;
	}
	
	var bookmarkedArrayMaxLength = 45;
	
	var titleCutoffIndex = 30;
	if (document.getElementsByClassName("post-title font-opensans-bold")[0] < 30)
		titleCutoffIndex = document.getElementsByClassName("post-title font-opensans-bold")[0].innerHTML.length;
	
	
	var shortUrlStartIndex = document.getElementsByClassName("sg-item selected grid")[0].getAttribute("style").indexOf(".com/") + 5;
	var shortUrlEndIndex = document.getElementsByClassName("sg-item selected grid")[0].getAttribute("style").indexOf(".jpg");


	var bookmarkedImg = {
		id: postID, //document.getElementsByClassName("post-image-container")[0].getAttribute("id"),
		imgSrc: document.getElementsByClassName("sg-item selected grid")[0].getAttribute("style").substring(shortUrlStartIndex, shortUrlEndIndex),
		title: document.getElementsByClassName("post-title")[0].innerHTML.substring(0, titleCutoffIndex),
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
				
				//If the user already has this post bookmarked: return.
				for (i = 0; i < bookmarkedImagesArray.length; i++) {
					if (bookmarkedImagesArray[i].id == bookmarkedImg.id) {
						alert("You already have bookmarked this post.");
						return;
					}
				}
				
				bookmarkedImagesArray.unshift(bookmarkedImg); //Add the post to the beginning of bookmarkedImagesArray.
				
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
						console.log("post bookmarked: " + postID);
				});
			});
		}
		else {
			chrome.storage.local.get({ 
				//Set defaults.
				favoritedImages: new Array()
			}, function(items) {
				var bookmarkedImagesArray = items.favoritedImages;
				
				//If the user already has this post bookmarked: return.
				for (i = 0; i < bookmarkedImagesArray.length; i++) {
					if (bookmarkedImagesArray[i].id == bookmarkedImg.id) {
						alert("You already have bookmarked this post.");
						return;
					}
				}
				
				bookmarkedImagesArray.unshift(bookmarkedImg); //Add the post to the beginning of bookmarkedImagesArray.
				
				chrome.storage.local.set({
					favoritedImages: bookmarkedImagesArray
				}, function() {
					if (!chrome.runtime.lastError)
						console.log("post bookmarked: " + postID);
				});
			});
		}
	});
}

function checkForBlockedKeywords() {		
	var postTitle = document.getElementsByClassName("post-title")[0].innerHTML.toLowerCase();
	
	for (i = 0; i < blockedKeywordsArray.length; i++) {
		if (postTitle.indexOf(blockedKeywordsArray[i].toLowerCase()) > -1) {
			console.log("***Post's title contains blocked keyword (" + blockedKeywordsArray[i] + "), skipping.***");
			
			if (blockedKeywordsArray[i].length > 16)
				addNotification("Previous Post Skipped:", "Keyword in title is blocked: (" + blockedKeywordsArray[i].substring(0, 16) + "...)");
			else
				addNotification("Previous Post Skipped:", "Keyword in title is blocked: (" + blockedKeywordsArray[i] + ")");
			
			onNewPost2(true);
			skipPost();
			return true;
		}
	}
	//Don't call onNewPost2 here because it will be done in either checkForBlockedSubreddits or checkForBlockedUsers.
	return false;
	
}

function checkForBlockedSubreddits() {
	if (blockReddit) {
		console.log("***Post's title is from Reddit, skipping.***");
			
		addNotification("Previous Post Skipped:", "Post is from Reddit.");
		
		onNewPost2(true);
		skipPost();
		return true;
	}
	
	var redditURL = document.getElementsByClassName("post-title-meta")[0].getElementsByTagName("a")[0].getAttribute("href").toLowerCase();
	redditURL = redditURL.substr(redditURL.indexOf("reddit.com/r/") + 13, redditURL.length);
	var subredditName = redditURL.substr(0, redditURL.indexOf("/"));
	console.log("subredditName: " + subredditName);
	
	for (i = 0; i < blockedSubredditsArray.length; i++) {
		if (subredditName === blockedSubredditsArray[i].toLowerCase()) {
			console.log("***Post's title is from blocked subreddit(" + blockedSubredditsArray[i] + "), skipping.***");
			
			if (blockedSubredditsArray[i].length > 16)
				addNotification("Previous Post Skipped:", "Post from blocked subreddit: (" + blockedSubredditsArray[i].substring(0, 16) + "...)");
			else
				addNotification("Previous Post Skipped:", "Post from blocked subreddit: (" + blockedSubredditsArray[i] + ")");
			
			onNewPost2(true);
			skipPost();
			return true;
		}
	}
	//Don't call onNewPost2 here because it will be done in checkForBlockedUsers.
	return false;
}

//checkForBlockedUsers: Checks if post creator is blocks, skips post if user is blocked.
function checkForBlockedUsers() {
	console.log("Checking if user(" + postUser + ") is blocked.");
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
						console.log("***Post's creator (" + blockedUserList[i] + ") has been blocked, skipping.***");
						
						if (blockedUserList[i].length > 16)
							addNotification("Previous Post Skipped:", "User is blocked: (" + blockedUserList[i].substring(0, 16) + "...)");
						else
							addNotification("Previous Post Skipped:", "User is blocked: (" + blockedUserList[i] + ")");
						
						onNewPost2(true);
						skipPost();
						return;//break;
					}
				}
				onNewPost2(false);
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
						console.log("***Post's creator (" + blockedUserList[i] + ") has been blocked, skipping.***");
						
						if (blockedUserList[i].length > 16)
							addNotification("Previous Post Skipped:", "User is blocked: (" + blockedUserList[i].substring(0, 16) + "...)");
						else
							addNotification("Previous Post Skipped:", "User is blocked: (" + blockedUserList[i] + ")");
						
						onNewPost2(true);
						skipPost();
						return;//break;
					}
				}
				onNewPost2(false);
			});
		}
	});
}

//checkForSpecialUsers: Checks if the post's creator is a "special" user, notifies if true.
function checkForSpecialUsers() {
	if (notifyOnSpecialUsers) {
		if (postUser === "ANewBadlyPhotoshoppedPhotoofMichaelCeraEveryday")
			addNotification("Tip:", "Check the username."); //Call function in notificationsContent.js
	}

	if (notifyOnTollski && postUser.indexOf("Tollski") == 0 && postUser.length == 7) 
		addNotification("Tip:", "This post was made by the creator of the imgur Browsing Aid extension."); //Call function in notificationsContent.js
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

//checkIfViewedPost: Checks if this post has already been viewed, skips the post if it has.
function checkIfViewedPost() {
	/*if (window.location.href.indexOf("imgur.com/gallery/") == -1) //If we are not in the gallery: return.
		return;*/
	if (window.location.href.indexOf("imgur.com/account/favorites/") > -1) //Don't skip already viewed images when browsing your own favorites list.
		return;
	
	for (i = 0; i < viewedPostsArray.length; i++){
		if (postID === viewedPostsArray[i]) {
			console.log("Skipping post (Already Viewed): " + postID);
			addNotification("Previous Post Skipped:", "Post Already Viewed");
			skipPost();
			return true;
		}
	}
	return false;
}

//favoriteComment: Adds comment to favoriteComments.
function favoriteComment() {
	var superParent = this.parentNode.parentNode.parentNode.parentNode.parentNode;

	var commentText = "";
	for (i = 0; i < superParent.childNodes[1].childNodes.length; i++) //Add the innerHTML of each childNode to commentText.
		commentText += superParent.childNodes[1].childNodes[i].innerHTML;
	
	console.log("https://imgur.com" + superParent.getElementsByClassName("item permalink-caption-link")[0].getAttribute("href"));
	console.log(superParent.getElementsByClassName("author")[0].children[0].innerHTML);
	console.log(commentText);
	
	var comment = {
		url: "https://imgur.com" + superParent.getElementsByClassName("item permalink-caption-link")[0].getAttribute("href"),
		userName: superParent.getElementsByClassName("author")[0].children[0].innerHTML,
		text: commentText
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

function movedBack() {
	rightTrueLeftFalse = false;
	if (slideShowRunning && !slideShowPaused) {
		slideShowSecondsRemaining = slideShowTime;
		updateSlideShowMessage(slideShowSecondsRemaining);
		slideShowPauseToggle();
	}
}

function movedForward() {
	rightTrueLeftFalse = true;
	if (slideShowRunning) {
		slideShowSecondsRemaining = slideShowTime;
		updateSlideShowMessage(slideShowSecondsRemaining);
		if (slideShowPaused)
			slideShowPauseToggle();
	}
}

//permanentlyDisableSpecialUsersNotifications: Sets the option to notify on special users to false.
function permanentlyDisableSpecialUsersNotifications() {
	notifyOnSpecialUsers = false;
	
	chrome.storage.sync.set({
		specialUserNotificationEnabled: notifyOnSpecialUsers
	}, function() {
		if (!chrome.runtime.lastError) 
			addNotification("Notification:", "You have disabled notifications for special users.");
	});
}

//permanentlyDisableSpecialUsersNotifications: Sets the option to notify on special users to false.
function permanentlyDisableTollskiNotifications() {
	notifyOnTollski = false;
	
	chrome.storage.sync.set({
		tollskiNotificationEnabled: notifyOnTollski
	}, function() {
		if (!chrome.runtime.lastError) 
			addNotification("Notification:", "You have disabled notifications for Tollski.");
	});
}

//removeViaElements: Removes "via Android" and "via iPhone" links next to comment author names.
function removeViaElements() {
	//Not working everytime, what do we have to wait for?
	var viaClassElements = document.getElementsByClassName("via");
	var origLength = viaClassElements.length;
	
	//console.log("starting removal: " + origLength);
	for (i = origLength - 1; i >=0; i--) {
		//console.log(i + " " + origLength + " removing via: " + viaClassElements[0].parentNode.firstChild.innerHTML);
		viaClassElements[i].parentNode.removeChild(viaClassElements[i]);
	}
	
}

//sideGalleryClicked: Runs when a thumbnail in the side gallery has been clicked. Determines if we need to move forward or backward in the gallery.
function sideGalleryClicked() {
	if (clickingBecauseSkipping) {
		clickingBecauseSkipping = false;
		movedForward();
	}
	else
		movedBack();
}

//skipPost: Skips current post.
function skipPost() {
	if (rightTrueLeftFalse){
		//Variables for debugging.
		var postsSkipped = 1; //Variable to count how many posts will be skipped.
		var postIDsSkipped = postID; //Track the IDs skipped.
		
		if (skipViewed) { //If skipping viewed posts is enabled: find the next non-viewed/non-downvoted post and click it.
			var sgItems = document.getElementsByClassName("sg-item grid");
			var foundCurrentSgItem = false, foundNextNonViewed = false;
			for (i = 0; i < sgItems.length; i++) {
				//console.log("searching sg item");
				if (!foundCurrentSgItem) {
					if (sgItems[i].className == "sg-item selected grid")
						foundCurrentSgItem = true;
				}
				else {				
					if (sgItems[i].getElementsByClassName("alreadyViewedIdentifier").length == 0 && sgItems[i].getElementsByClassName("sg-item-vote icon-downvote").length == 0) { //If the thumbnail hasn't already been viewed and hasn't been downvoted: ...
						//console.log("found next non-viewed post");
						foundNextNonViewed = true;
						clickingBecauseSkipping = true;
						sgItems[i].click();
						break;
					}
					else {
						postsSkipped++;
						var startIndex;
						if (sgItems[i].getAttribute("href").indexOf("/a/") == 0)
							startIndex = 3;
						else
							startIndex = 1;
						
						postIDsSkipped += ", " + sgItems[i].getAttribute("href").substring(startIndex, sgItems[i].getAttribute("href").length);
					}
				}
			}
			
			if (!foundNextNonViewed) {//If no suitable non-viewed post was found: click the last element.
				console.log("No non-viewed posts found, going to last thumbnail in side gallery.");
				sgItems[sgItems.length - 1].click();
			}
		}
		else //If skipping viewed posts is disabled: click the next button.
			document.getElementsByClassName("btn btn-action navNext")[0].click();
			
		console.log("Posts skipped: " + postsSkipped + ". (IDs: " + postIDsSkipped +")");
	}
	else 
		document.getElementsByClassName("btn navPrev icon icon-arrow-left")[0].click();
}

function slideShowPauseToggle() {
	if (slideShowInterval && slideShowRunning) {
		if (slideShowPaused) {
			slideShowStart(true);
			slideShowPaused = false;
		}
		else {
			clearInterval(slideShowInterval);
			slideShowPaused = true;
		}
	}
}

function slideShowStart(unpausing) {
	if (canSlideShow) {
		if (!unpausing) {
			slideShowRunning = true;
			addSlideShowMessageBox();
			slideShowSecondsRemaining = slideShowTime;
			updateSlideShowMessage(slideShowSecondsRemaining);
		}
		
		slideShowInterval = setInterval( function() {
			if (slideShowSecondsRemaining <= 0) {
				document.getElementsByClassName("btn btn-action navNext")[0].click();
				slideShowSecondsRemaining = slideShowTime;
			}
			else
				slideShowSecondsRemaining--;
			updateSlideShowMessage(slideShowSecondsRemaining); //Call function in notificationsContent.js
		}, 1000);
	}
}

function slideShowStop() {
	if (slideShowInterval) {
		clearInterval(slideShowInterval);
		closeSlideShowMessageBox(); //Call function in notificationsContent.js
		slideShowPaused = false;
		console.log("Slide show stopped.");
	}
	slideShowRunning = false;
}

function slideShowToggle() {
	if (slideShowRunning)
		slideShowStop();
	else
		slideShowStart(false);
}

function temporarilyStopSkippingViewedPosts() {
	skipViewed = false;
	addNotification("Notification:", "Skipping of viewed posts has been temporarily disabled. Press 'F9' to re-enable.");
}