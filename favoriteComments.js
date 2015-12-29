var favoriteCommentList = new Array();

document.addEventListener('DOMContentLoaded', restore_options);

// Loads options from chrome.storage
function restore_options() {
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) {
			chrome.storage.sync.get({
				// Set defaults.
				favoriteComments: new Array(),
			}, function(items) {
				favoriteCommentList = items.favoriteComments;
				populateFavoriteCommentList();
			});
		}
		else {
			chrome.storage.local.get({
				// Set defaults.
				favoriteComments: new Array(),
			}, function(items) {
				favoriteCommentList = items.favoriteComments;
				populateFavoriteCommentList();
			});
		}
	});
}

function populateFavoriteCommentList() {
	var listHTML = "";
	
	for (i = 0; i < favoriteCommentList.length; i++) 
		listHTML += '<tr><td><a href="' + favoriteCommentList[i].url + '">View Comment</a></td><td>' + favoriteCommentList[i].userName + '</td><td>' + favoriteCommentList[i].text + '</td><td><input type="button" value="Unfavorite" id="remove' + i + '" url="' + favoriteCommentList[i].url + '" /></td></tr>';
	
	document.getElementById("favoriteCommentTable").innerHTML = listHTML;
	
	for (i = 0; i < favoriteCommentList.length; i++) {
		document.getElementById("remove" + i).addEventListener("click", unfavoriteComment);
	}

	document.getElementById('mainDiv').style.display = "inline";
	document.getElementById('loadingDiv').style.display = "none";
}


function unfavoriteComment() {
	var url = this.getAttribute("url");
	
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) {
			chrome.storage.sync.get({ 
				//Set defaults.
				favoriteComments: new Array()
			}, function(items) {
				favoriteCommentList = items.favoriteComments;
				
				var index = -1;
				searchLoop:
				for (i = 0; i < favoriteCommentList.length; i++) {
					if (url === favoriteCommentList[i].url) {
						index = i;
						break searchLoop;
					}
				}
				if (index > -1)
					favoriteCommentList.splice(index, 1);
				
				chrome.storage.sync.set({
					favoriteComments: favoriteCommentList
				}, function() {
					//window.location.reload();
					populateFavoriteCommentList();
				});
			});
		}
		else {
			chrome.storage.local.get({ 
				//Set defaults.
				favoriteComments: new Array()
			}, function(items) {
				favoriteCommentList = items.favoriteComments;
				
				var index = -1;
				searchLoop:
				for (i = 0; i < favoriteCommentList.length; i++) {
					if (url === favoriteCommentList[i].url) {
						index = i;
						break searchLoop;
					}
				}
				if (index > -1)
					favoriteCommentList.splice(index, 1);
				
				chrome.storage.local.set({
					favoriteComments: favoriteCommentList
				}, function() {
					//window.location.reload();
					populateFavoriteCommentList();
				});
			});
		}
	});
}