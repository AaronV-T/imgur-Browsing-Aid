var favoritedImagesArray = new Array();
var syncRunning = false;
var favoriteArrayMaxLength = 45;
var imagesAdded = 0, favoritesFound = 0;

$('body').ready(main);

/*$(window).scroll( function() {
   if($(window).scrollTop() + $(window).height() == $(document).height()) {
       alert("bottom!");
   }
});*/

/*



*/
function main() {
	addSyncButton();
}

/*



*/
function addSyncButton() {
	var syncButtonDiv = document.createElement("div");
	syncButtonDiv.setAttribute("style", "text-align:center;");
	syncButtonDiv.setAttribute("id", "sync-div");
	
	var syncButton = document.createElement("input");
	syncButton.setAttribute("type", "button");
	syncButton.setAttribute("value", "Sync Favorites");
	syncButton.setAttribute("id", "sync-favorites");
	syncButtonDiv.appendChild(syncButton);
	
	var placementElement = document.getElementById("imagelist");
	placementElement.insertBefore(syncButtonDiv, placementElement.childNodes[0]);
	
	document.getElementById("sync-favorites").addEventListener("click", scrollAndSync);
}

function scrollAndSync() {
	var scrolling = setInterval( function() {
		scrollBy(0,300);
		if (document.getElementById("nomore") !== null) {
			clearInterval(scrolling);
			window.scrollTo(0, 0);
			syncFavorites();
		}
	}, 25);
}

function syncFavorites() {
	if (syncRunning)
		return;
	
	syncRunning = true;
	
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) { //If using Chrome sync for storage is enabled...
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
				favoritedImagesArray = items.favoritedImages;
				if (items.favoritedImages1.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages1);
				if (items.favoritedImages2.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages2);
				if (items.favoritedImages3.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages3);
				if (items.favoritedImages4.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages4);
				if (items.favoritedImages5.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages5);
				if (items.favoritedImages6.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages6);
				if (items.favoritedImages7.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages7);
				if (items.favoritedImages8.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages8);
				if (items.favoritedImages9.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages9);
				if (items.favoritedImages10.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages10);
				if (items.favoritedImages11.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages11);
				if (items.favoritedImages12.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages12);
				if (items.favoritedImages13.length > 0)
					favoritedImagesArray.push.apply(favoritedImagesArray, items.favoritedImages13);
				
				syncFavoritesHelper();
			});
		}
		else {
			chrome.storage.local.get({ 
				//Set defaults.
				favoritedImages: new Array()
			}, function(items) {
				favoritedImagesArray = items.favoritedImages;
				
				syncFavoritesHelper();
			});
		}
	});
}

function syncFavoritesHelper() {
	var actualFavoritedImagesArray = new Array();
				
	var postElements = document.getElementsByClassName("post");
	for (i = 0; i < postElements.length; i++) {
		if (postElements[i].getAttribute("class").indexOf("empty") > -1) continue;
		
		var titleCutoffIndex = 30;
		if (postElements[i].getElementsByClassName("hover")[0].getElementsByTagName("p")[0].innerHTML.length < 30)
			titleCutoffIndex = postElements[i].getElementsByClassName("hover")[0].getElementsByTagName("p")[0].innerHTML.length;
		
		var shortUrlStartIndex = postElements[i].getElementsByTagName("img")[0].getAttribute("src").indexOf(".com/") + 5;
		var shortUrlEndIndex = postElements[i].getElementsByTagName("img")[0].getAttribute("src").indexOf(".jpg");
		
		var favImg = {
			id: postElements[i].getAttribute("id"),
			//url: postElements[i].getElementsByTagName("a")[0].getAttribute("href"),
			imgSrc: postElements[i].getElementsByTagName("img")[0].getAttribute("src").substring(shortUrlStartIndex, shortUrlEndIndex),
			title: postElements[i].getElementsByClassName("hover")[0].getElementsByTagName("p")[0].innerHTML.substring(0, titleCutoffIndex),
			directory: "root"
		}
		actualFavoritedImagesArray.push(favImg);
	}
	favoritesFound = actualFavoritedImagesArray.length;
	
	var indicesFound = new Array();
	for (i = 0; i < actualFavoritedImagesArray.length; i++) {
		var imgFound = false;
		for (j = 0; j < favoritedImagesArray.length; j++) {
			if (actualFavoritedImagesArray[i].id == favoritedImagesArray[j].id) {
				imgFound = true;
				indicesFound.push(j);
				break;
			}
		}
		
		if (!imgFound) {
			favoritedImagesArray.push(actualFavoritedImagesArray[i]);
			indicesFound.push(favoritedImagesArray.length - 1);
			imagesAdded++;
		}
		
	}
	
	/*for (i = favoritedImagesArray.length; i >= 0; i--) { Delete images that were saved but are no longer favorited.
		if (indicesFound.indexOf(i) == -1)
			favoritedImagesArray.splice(i, 1);
	}*/
	
	console.log("favoritedImagesArray.length: " + favoritedImagesArray.length);
	for (i = 0; i < favoritedImagesArray.length; i++)
		console.log("favoritedImagesArray has id: " + favoritedImagesArray[i].id);
	
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) { //If using Chrome sync for storage is enabled...
			chrome.storage.sync.set({
				favoritedImages: favoritedImagesArray.slice(0, favoriteArrayMaxLength),
				favoritedImages1: favoritedImagesArray.slice(favoriteArrayMaxLength , 2 * favoriteArrayMaxLength),
				favoritedImages2: favoritedImagesArray.slice(2 * favoriteArrayMaxLength , 3 * favoriteArrayMaxLength),
				favoritedImages3: favoritedImagesArray.slice(3 * favoriteArrayMaxLength , 4 * favoriteArrayMaxLength),
				favoritedImages4: favoritedImagesArray.slice(4 * favoriteArrayMaxLength , 5 * favoriteArrayMaxLength),
				favoritedImages5: favoritedImagesArray.slice(5 * favoriteArrayMaxLength , 6 * favoriteArrayMaxLength),
				favoritedImages6: favoritedImagesArray.slice(6 * favoriteArrayMaxLength , 7 * favoriteArrayMaxLength),
				favoritedImages7: favoritedImagesArray.slice(7 * favoriteArrayMaxLength , 8 * favoriteArrayMaxLength),
				favoritedImages8: favoritedImagesArray.slice(8 * favoriteArrayMaxLength , 9 * favoriteArrayMaxLength),
				favoritedImages9: favoritedImagesArray.slice(9 * favoriteArrayMaxLength , 10 * favoriteArrayMaxLength),
				favoritedImages10: favoritedImagesArray.slice(10 * favoriteArrayMaxLength , 11 * favoriteArrayMaxLength),
				favoritedImages11: favoritedImagesArray.slice(11 * favoriteArrayMaxLength , 12 * favoriteArrayMaxLength),
				favoritedImages12: favoritedImagesArray.slice(12 * favoriteArrayMaxLength , 13 * favoriteArrayMaxLength),
				favoritedImages13: favoritedImagesArray.slice(13 * favoriteArrayMaxLength , 14 * favoriteArrayMaxLength)
			}, function() {
				syncMessageSetter(chrome.runtime.lastError);
			});
		}
		else {
			chrome.storage.local.set({
				favoritedImages: favoritedImagesArray
			}, function() {
				syncMessageSetter(chrome.runtime.lastError);
			});
		}
	});
}

function syncMessageSetter(lastError) {
	if (lastError) { 
		console.log("Error syncing: " + chrome.runtime.lastError.message);
		var syncFailedSpan = document.createElement("span");
		syncFailedSpan.setAttribute("style", "color:red;");
		syncFailedSpan.innerHTML = 'Sync failed.';
		
		document.getElementById("sync-div").appendChild(document.createElement("br"));
		document.getElementById("sync-div").appendChild(syncFailedSpan);
	}
	else {
		var syncSuccessfulSpan = document.createElement("span");
		syncSuccessfulSpan.setAttribute("style", "color:green;");
		syncSuccessfulSpan.innerHTML = 'Sync successful (' + imagesAdded + ' new images out of ' + favoritesFound +' favorites found). You can organize your bookmarked images via the "iBA"" icon in the top right.';
		
		imagesAdded = 0;
		favoritesFound = 0;
		
		document.getElementById("sync-div").appendChild(document.createElement("br"));
		document.getElementById("sync-div").appendChild(syncSuccessfulSpan);
	}
	syncRunning = false;
}
