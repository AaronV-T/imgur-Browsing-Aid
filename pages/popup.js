//Script injected into popup window.
document.getElementById('donateSpan').addEventListener('click', openDonationPage);
document.getElementById('snakeSpan').addEventListener('click', showSnakeGame);
document.getElementById('openOptions').addEventListener('click', openOptions);
document.getElementById('openBlockedKeywords').addEventListener('click', openBlockedKeywords);
document.getElementById('openFavoriteComments').addEventListener('click', openFavoriteComments);
document.getElementById('openBookmarkedPosts').addEventListener('click', openBookmarkedPosts);
document.getElementById('openFeedback').addEventListener('click', openFeedback);

var followedUserList = new Array();

window.onload = getFollowedUserListAndPopulate();

document.getElementById("versionSpan").innerHTML = "(Version: " + chrome.runtime.getManifest().version + ")";

function getFollowedUserListAndPopulate() {
	
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) {
			chrome.storage.sync.get({ 
				//Set defaults.
				followedUsers: new Array()
			}, function(items) {
				followedUserList = items.followedUsers;
				getFollowedUserListAndPopulateHelper();
			});
		}
		else {
			chrome.storage.local.get({ 
				//Set defaults.
				followedUsers: new Array()
			}, function(items) {
				followedUserList = items.followedUsers;
				getFollowedUserListAndPopulateHelper();
			});
		}
	});
}

function getFollowedUserListAndPopulateHelper() {
	var listHTML;
	if (followedUserList.length > 0) {
		listHTML = '<tr><th style="text-align:center;" colspan="2">Users You Follow:</th></tr>';

		for (i = 0; i < followedUserList.length; i++) 
			listHTML += '<tr><td>' + followedUserList[i] + '</td><td><span style="color:blue;" userName="' + followedUserList[i] + '" class="visitUserPage">Visit Page</span></td></tr>';
	}
	else
		listHTML = "";
	
	document.getElementById("followedUserTable").innerHTML = listHTML;	
	
	var visitUserLinks = document.getElementsByClassName("visitUserPage");
	for (i = 0; i < visitUserLinks.length; i++)
		visitUserLinks[i].addEventListener("click", visitUserPage);
}

function openBlockedKeywords() {
	chrome.tabs.create({ 'url': "chrome-extension://" + chrome.runtime.id + "/pages/blockedKeywords.html" });
}

function openDonationPage() {
	chrome.tabs.create({ 'url': "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=FLE9GSV5HK9WU" });
}

function openFavoriteComments() {
	chrome.tabs.create({ 'url': "chrome-extension://" + chrome.runtime.id + "/pages/favoriteComments.html" });
}

function openBookmarkedPosts() {
	chrome.tabs.create({ 'url': "chrome-extension://" + chrome.runtime.id + "/pages/bookmarkedPosts.html" });
}

function openFeedback() {
	chrome.tabs.create({ 'url': "https://docs.google.com/forms/d/1m9giW20aIkCb1tsWeED4w0v0pec3A1WfrDBzCScxxZA/viewform?usp=send_form" });
}

function openOptions() {
	chrome.runtime.openOptionsPage();
}

function showSnakeGame() {
	//Send message to selected tab to initializeSnakeGame.
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {messageType: "initializeSnakeGame"});
	});
}

function visitUserPage() {
	var userName = this.getAttribute("userName");
	chrome.tabs.create({ url: "http://imgur.com/user/" + userName + "/submitted" });
}