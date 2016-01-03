var blockedUserList = new Array();
var followedUserList = new Array();
var lastSavedUseSynchronizedStorage;
var moveRunning = false;

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('clearViewedPostsButton').addEventListener('click', deleteViewedPosts);

document.getElementById("versionSpan").innerHTML = "(Version: " + chrome.runtime.getManifest().version + ")";

// Loads options from chrome.storage
function restore_options() {
  chrome.storage.sync.get({ //(Main settings are always stored in storage.sync.)
    // Set defaults.
	promotedSkipEnabled: false,
	topBarCloseEnabled: true,
	removeViaMobileSpansEnabled: true,
	slideShowModeEnabled: true,
	slideShowSecondsPerPost: 10,
	notificationsEnabled: true,
	specialUserNotificationEnabled: true,
	viewedIconsEnabled: true,
	skipViewedPostsEnabled: false,
	useSynchronizedStorage: "neverSet"
  }, function(items) {
    document.getElementById('promotedSkipCheckbox').checked = items.promotedSkipEnabled;
	document.getElementById('topBarCloseCheckbox').checked = items.topBarCloseEnabled;
	document.getElementById('removeViaMobileSpansCheckbox').checked = items.removeViaMobileSpansEnabled;
	document.getElementById('synchronizedStorageCheckbox').checked = items.useSynchronizedStorage;
	document.getElementById('slideShowModeCheckbox').checked = items.slideShowModeEnabled;
	document.getElementById('slideShowPostTimeTextbox').value = items.slideShowSecondsPerPost;
	document.getElementById('notificationsCheckbox').checked = items.notificationsEnabled;
	document.getElementById('specialUserNotificationCheckbox').checked = items.specialUserNotificationEnabled;
	document.getElementById('viewedIconsCheckbox').checked = items.viewedIconsEnabled;
	document.getElementById('skipViewedPostsCheckbox').checked = items.skipViewedPostsEnabled;
	
	if (items.useSynchronizedStorage == "neverSet") { //If the user just installed or just updated from < v0.4.0: convert storage to local.
		moveStorage(true);
		alert("An important update is taking place, this will only take about two seconds. \n(Note: The options page should never again randomly open.)\n\nYou may now press OK.");
		
		chrome.storage.sync.set({
			useSynchronizedStorage: false
		}, function() {
			if (!chrome.runtime.lastError) { 
				console.log("neverSet, converted.")
				setTimeout(function() {
					if (!moveRunning)
						window.location.reload();
				}, 2000);
			}
		});
		
		return;
	}
	else //Else: we can assume it is true or false.
		lastSavedUseSynchronizedStorage = items.useSynchronizedStorage;
	
	if (lastSavedUseSynchronizedStorage) {
		chrome.storage.sync.get({
			blockedUsers: new Array(),
			followedUsers: new Array()
		}, function(items) {
			populateListsAndSetReady(items.blockedUsers, items.followedUsers);
		});
	}
	else {
		chrome.storage.local.get({
			blockedUsers: new Array(),
			followedUsers: new Array()
		}, function(items) {
			populateListsAndSetReady(items.blockedUsers, items.followedUsers);
		});
	}
  });
}

// Saves options to chrome.storage
function save_options() {
	if (moveRunning)
		return;
	
	var promotedSkip = document.getElementById('promotedSkipCheckbox').checked;
	var topBarClose = document.getElementById('topBarCloseCheckbox').checked;
	var removeViaMobileSpans = document.getElementById('removeViaMobileSpansCheckbox').checked;
	var useSync = document.getElementById('synchronizedStorageCheckbox').checked;
	var slideShowMode = document.getElementById('slideShowModeCheckbox').checked;
	var slideShowPostTime = document.getElementById('slideShowPostTimeTextbox').value;
	console.log(slideShowPostTime);
	if (!slideShowPostTime || isNaN(slideShowPostTime) || slideShowPostTime < 1 || slideShowPostTime > 999) { //If slideShowPostTime is not a number between 1-3 characters long...
		updateStatusText("Not saved. Please enter a valid number between 1 and 999 for the slide show seconds per post.", false);
		return;
	}
	var useNotifications = document.getElementById('notificationsCheckbox').checked;
	var specialUserNotify = document.getElementById('specialUserNotificationCheckbox').checked;
	var viewedIcons = document.getElementById('viewedIconsCheckbox').checked
	var skipViewed = document.getElementById('skipViewedPostsCheckbox').checked;
	
	if (useSync != lastSavedUseSynchronizedStorage) { //If the user changed their sync setting...
		if (useSync) { //If they selected to use storage.sync: prompt for confirmation.
			var confirmMove = confirm("Do you really wish to use Chrome sync?\n(Bookmarked images and favorite comments may be lost if you have too many.)");
			if (confirmMove)
				moveStorage(lastSavedUseSynchronizedStorage);
			else
				return;
		}
		else
			moveStorage(lastSavedUseSynchronizedStorage);
	}
	  
	chrome.storage.sync.set({
		promotedSkipEnabled: promotedSkip,
		topBarCloseEnabled: topBarClose,
		removeViaMobileSpansEnabled: removeViaMobileSpans,
		slideShowModeEnabled: slideShowMode,
		slideShowSecondsPerPost: slideShowPostTime,
		notificationsEnabled: useNotifications,
		specialUserNotificationEnabled: specialUserNotify,
		viewedIconsEnabled: viewedIcons,
		skipViewedPostsEnabled: skipViewed,
		useSynchronizedStorage: useSync
	}, function() {
		lastSavedUseSynchronizedStorage = useSync;
		
		updateStatusText("Options saved. Please refresh any open imgur tabs.", true);
	});
}




function deleteViewedPosts() {
	var confirmDelete = confirm("Do you really wish erase your viewed post history?");
	if (!confirmDelete)
		return;
	
	chrome.storage.local.set({
		viewedPosts: new Array()
	}, function() {
		updateStatusText("Viewed posts history has been deleted.", true);
	});
}

//moveStorage: Moves blockedUsers, followedUsers, favoriteComments, favoritedImages, and favoritedImagesDirectories to storage.local from storage.sync, or visa versa.
function moveStorage(syncToLocal) {
	moveRunning = true;
	if (syncToLocal) { //Convert from synchronized to local.
		chrome.storage.sync.get({
			blockedUsers: new Array(),
			followedUsers: new Array(),
			favoriteComments: new Array(),
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
			favoritedImages13: new Array(),
			favoritedImagesDirectories: new Array()
		}, function(items) {
			var favoritedImagesArray = items.favoritedImages;
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
			
			chrome.storage.local.set({
				blockedUsers: items.blockedUsers,
				followedUsers: items.followedUsers,
				favoriteComments: items.favoriteComments,
				favoritedImages: favoritedImagesArray,
				favoritedImagesDirectories: items.favoritedImagesDirectories
			}, function() {
				if (chrome.runtime.lastError) { 
					console.log("Failed to move storage from Chrome sync to local: " + chrome.runtime.lastError.message);
				}
				else {
					console.log("Storage moved from Chrome sync to local.");
				}
				moveRunning = false;
			});
		});
	}
	else { //Convert from local to synchronized.
		chrome.storage.local.get({
			blockedUsers: new Array(),
			followedUsers: new Array(),
			favoriteComments: new Array(),
			favoritedImages: new Array(),
			favoritedImagesDirectories: new Array()
		}, function(items) {
			var favoritedImagesArray = items.favoritedImages;
			favoriteArrayMaxLength = 45;
			chrome.storage.sync.set({
				blockedUsers: items.blockedUsers,
				followedUsers: items.followedUsers,
				favoriteComments: items.favoriteComments,
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
				favoritedImages13: favoritedImagesArray.slice(13 * favoriteArrayMaxLength , 14 * favoriteArrayMaxLength),
				favoritedImagesDirectories: items.favoritedImagesDirectories
			}, function() {
				if (chrome.runtime.lastError) { 
					console.log("Failed to move storage from local to Chrome sync:" + chrome.runtime.lastError.message);
				}
				else {
					console.log("Storage moved from local to Chrome sync.");
				}
				moveRunning = false;
			});
		});
	}
}

//populateBlockedUserList: Displays all the blocked users.
function populateBlockedUserList() {
	var listHTML = "";
	
	for (i = 0; i < blockedUserList.length; i++) 
		listHTML += '<tr><td>' + blockedUserList[i] + '</td><td><input type="button" value="Unblock" id="remove' + i + '" userName="' + blockedUserList[i] + '" /></td></tr>';
	
	document.getElementById("blockedUserTable").innerHTML = listHTML;
	
	for (i = 0; i < blockedUserList.length; i++) {
		document.getElementById("remove" + i).addEventListener("click", unblockUser);
	}
		
}

//populateFollowedUserList: Displays all the followed users.
function populateFollowedUserList() {
	var listHTML = "";
	
	for (i = 0; i < followedUserList.length; i++) 
		listHTML += '<tr><td>' + followedUserList[i] + '</td><td><input type="button" value="Unfollow" id="removeFollow' + i + '" userName="' + followedUserList[i] + '" /></td></tr>';
	
	document.getElementById("followedUserTable").innerHTML = listHTML;
	
	for (i = 0; i < followedUserList.length; i++) {
		document.getElementById("removeFollow" + i).addEventListener("click", unfollowUser);
	}	
}

//populateListsAndSetReady: Calls the functions to display blocked and followed users, shows the mainDiv.
function populateListsAndSetReady(blockedUsers, followedUsers) {
	blockedUserList = blockedUsers;
	populateBlockedUserList();
	followedUserList = followedUsers;
	populateFollowedUserList();
	
	document.getElementById('mainDiv').style.display = "inline";
	document.getElementById('loadingDiv').style.display = "none";
}

//unblockUser: Removes a user from the blocked users list.
function unblockUser() {
	var userName = this.getAttribute("userName");
	console.log("unblocking " + userName);
	
	if (lastSavedUseSynchronizedStorage) {
		chrome.storage.sync.get({ 
			//Set defaults.
			blockedUsers: new Array()
		}, function(items) {
			blockedUserList = items.blockedUsers;
			unblockUserHelper(userName);
		});
	}
	else {
		chrome.storage.local.get({ 
			//Set defaults.
			blockedUsers: new Array()
		}, function(items) {
			blockedUserList = items.blockedUsers;
			unblockUserHelper(userName);
		});
	}
}

function unblockUserHelper(userName) {
	var index = blockedUserList.indexOf(userName);
	blockedUserList.splice(index, 1);
	
	console.log("Still blocked: " + blockedUserList.toString());
	
	if (lastSavedUseSynchronizedStorage) {
		chrome.storage.sync.set({
			blockedUsers: blockedUserList
		}, function() {
			populateBlockedUserList();
		});
	}
	else {
		chrome.storage.local.set({
			blockedUsers: blockedUserList
		}, function() {
			populateBlockedUserList();
		});
	}
}

//unfollowUser: Removes a user from the followed users list.
function unfollowUser() {
	var userName = this.getAttribute("userName");
	console.log("unfollowing " + userName);
	
	if (lastSavedUseSynchronizedStorage) {
		chrome.storage.sync.get({ 
			//Set defaults.
			followedUsers: new Array()
		}, function(items) {
			followedUserList = items.followedUsers;
			unfollowUserHelper(userName);
		});
	}
	else {
		chrome.storage.local.get({ 
			//Set defaults.
			followedUsers: new Array()
		}, function(items) {
			followedUserList = items.followedUsers;
			unfollowUserHelper(userName);
		});
	}
}

function unfollowUserHelper(userName) {
	var index = followedUserList.indexOf(userName);
	followedUserList.splice(index, 1);
	
	console.log("Still followed: " + followedUserList.toString());
	
	if (lastSavedUseSynchronizedStorage) {
		chrome.storage.sync.set({
			followedUsers: followedUserList
		}, function() {
			populateFollowedUserList();
		});
	}
	else {
		chrome.storage.local.set({
			followedUsers: followedUserList
		}, function() {
			populateFollowedUserList();
		});
	}
}

function updateStatusText(text, saveSuccessful) {
	// Update status to let user know options were saved.
	var status = document.getElementById('status');
	status.textContent = text;
	
	if (saveSuccessful) 
		status.setAttribute("style", "color:black;");
	else
		status.setAttribute("style", "color:red;");
	
	setTimeout(function() {
		status.textContent = '';
	}, 3000);
}