var blockedKeywordArray = new Array();
var blockedSubredditArray = new Array();
var disableKeywordStatus, disableSubredditStatus;

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('blockAllSubredditsCheckbox').addEventListener('click', blockAllSubredditsCheckboxClicked);
document.getElementById('blockKeywordButton').addEventListener('click', addBlockedKeyword);
document.getElementById('blockSubredditButton').addEventListener('click', addBlockedSubreddit);

/*




*/

// Loads options from chrome.storage
function restore_options() {
	chrome.storage.local.get({
		blockedKeywords: new Array(),
		blockedSubreddits: new Array(),
		blockAllSubreddits: false
	}, function(items) {
		document.getElementById('blockAllSubredditsCheckbox').checked = items.blockAllSubreddits;
		blockedKeywordArray = items.blockedKeywords;
		blockedSubredditArray = items.blockedSubreddits;
		
		populateListsAndSetReady();
	});
}


//populateListsAndSetReady: Calls the functions to display blocked keywords and subreddits, shows the mainDiv.
function populateListsAndSetReady() {
	populateBlockedKeywordList();
	populateBlockedSubredditList();
	
	document.getElementById('mainDiv').style.display = "inline";
	document.getElementById('loadingDiv').style.display = "none";
}

/*



*/

//addBlockedKeyword: Gets value input by user and adds it to the blockedKeywords array.
function addBlockedKeyword() {
	var keywordToBlock = document.getElementById("blockKeywordInput").value;
	
	if (keywordToBlock.length == 0)
		return;
	
	//Check if keyword is already blocked.
	for (i = 0; i < blockedKeywordArray.length; i++) {
		if (keywordToBlock == blockedKeywordArray[i]) 
			return;
	}
	
	blockedKeywordArray.push(keywordToBlock);
	blockedKeywordArray.sort();
	
	chrome.storage.local.set({
		blockedKeywords: blockedKeywordArray
	}, function() {
		document.getElementById("blockKeywordInput").value = "";
	
		populateBlockedKeywordList();
		updateStatusText("keyword");
	});
}

//addBlockedSubreddit: Gets value input by user and adds it to the blockedSubreddits array.
function addBlockedSubreddit() {
	var subredditToBlock = document.getElementById("blockSubredditInput").value;
	
	if (subredditToBlock.length == 0)
		return;
	
	//Check if subreddit is already blocked.
	for (i = 0; i < blockedSubredditArray.length; i++) {
		if (subredditToBlock == blockedSubredditArray[i]) 
			return;
	}
	
	blockedSubredditArray.push(subredditToBlock);
	blockedSubredditArray.sort();
	
	chrome.storage.local.set({
		blockedSubreddits: blockedSubredditArray
	}, function() {
		document.getElementById("blockSubredditInput").value = "";
	
		populateBlockedSubredditList();
		updateStatusText("subreddit");
	});
}

//blockAllSubredditsCheckboxClicked: Gets value of blockAllSubredditsCheckbox and saves to storage.
function blockAllSubredditsCheckboxClicked() {
	var blockAll = document.getElementById('blockAllSubredditsCheckbox').checked;
	
	chrome.storage.local.set({
		blockAllSubreddits: blockAll
	}, function() {
		updateStatusText("subreddit");
	});
}

//populateBlockedKeywordList: Displays all the blocked keywords and adds buttons to unblock them.
function populateBlockedKeywordList() {
	var listHTML = "";
	
	for (i = 0; i < blockedKeywordArray.length; i++) 
		listHTML += '<tr><td>' + blockedKeywordArray[i] + '</td><td><input type="button" value="Unblock" id="removeKeyword' + i + '" keyword="' + blockedKeywordArray[i] + '" /></td></tr>';
	
	document.getElementById("blockedKeywordsTable").innerHTML = listHTML;
	
	for (i = 0; i < blockedKeywordArray.length; i++) {
		document.getElementById("removeKeyword" + i).addEventListener("click", unblockKeyword);
	}
}

//populateBlockedSubredditList: Displays all the blocked subreddits and adds buttons to unblock them.
function populateBlockedSubredditList() {
	var listHTML = "";
	
	for (i = 0; i < blockedSubredditArray.length; i++) 
		listHTML += '<tr><td>' + blockedSubredditArray[i] + '</td><td><input type="button" value="Unblock" id="removeSubreddit' + i + '" subreddit="' + blockedSubredditArray[i] + '" /></td></tr>';
	
	document.getElementById("blockedSubredditsTable").innerHTML = listHTML;
	
	for (i = 0; i < blockedSubredditArray.length; i++) {
		document.getElementById("removeSubreddit" + i).addEventListener("click", unblockSubreddit);
	}
}

//unblockKeyword: Removes keyword from blockedKeywords array.
function unblockKeyword() {
	var keyword = this.getAttribute("keyword");
	console.log("unblocking keyword:" + keyword);
	
	var index = blockedKeywordArray.indexOf(keyword);
	blockedKeywordArray.splice(index, 1);

	chrome.storage.local.set({
		blockedKeywords: blockedKeywordArray
	}, function() {
		populateBlockedKeywordList();
		updateStatusText("keyword");
	});
}

//unblockSubreddit: Removes subreddit from blockedSubreddits array.
function unblockSubreddit() {
	var subreddit = this.getAttribute("subreddit");
	console.log("unblocking subreddit:" + subreddit);
	
	var index = blockedSubredditArray.indexOf(subreddit);
	blockedSubredditArray.splice(index, 1);

	chrome.storage.local.set({
		blockedSubreddits: blockedSubredditArray
	}, function() {
		populateBlockedSubredditList();
		updateStatusText("subreddit");
	});
}

function updateStatusText(type) {
	var status;
	if (type == "keyword") {
		status = document.getElementById('keywordStatus');
		
		status.textContent = "Please refresh any open Imgur pages for changes to go into effect.";
		
		if (disableKeywordStatus)
		clearTimeout(disableKeywordStatus);
	
		disableKeywordStatus = setTimeout(function() {
			status.textContent = '';
		}, 3000);
	}
	else if (type == "subreddit") {
		status = document.getElementById('subredditStatus');
		
		status.textContent = "Please refresh any open Imgur pages for changes to go into effect.";
		
		if (disableSubredditStatus)
		clearTimeout(disableSubredditStatus);
	
		disableSubredditStatus = setTimeout(function() {
			status.textContent = '';
		}, 3000);
	}
	else
		return;
}