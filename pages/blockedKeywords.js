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
    
    if (addBlockedWord(keywordToBlock, blockedKeywordArray) == 0) {
        // Keyword was added successfully. Save to storage.
        chrome.storage.local.set({
                                 blockedKeywords: blockedKeywordArray
                                 }, function() {
                                 document.getElementById("blockKeywordInput").value = "";
                                 
                                 populateBlockedKeywordList();
                                 updateStatusText("keyword");
                                 });
    }
}

//addBlockedSubreddit: Gets value input by user and adds it to the blockedSubreddits array.
function addBlockedSubreddit() {
    var subredditToBlock = document.getElementById("blockSubredditInput").value;
    
    if (addBlockedWord(subredditToBlock, blockedSubredditArray) == 0) {
        // Subreddit was added successfully. Save to storage.
        chrome.storage.local.set({
                             blockedSubreddits: blockedSubredditArray
                             }, function() {
                             document.getElementById("blockSubredditInput").value = "";
                             
                             populateBlockedSubredditList();
                             updateStatusText("subreddit");
                             });
    }
}

// Helper function for addBlockedKeyword and addBlockedSubreddit. Checks precondition (length > 0), performs binary search, pushes word if not in array.
function addBlockedWord(wordToBlock, blockArray) {
    if (wordToBlock.length == 0)
        return 1; // Error code 1: No word specified.
    
    //Check if keyword is already blocked. Now with binary search to speed up comparisons over large arrays.
    var bsMin = 0, bsMax = blockArray.length - 1, bsMid;
    while (bsMax >= bsMin) {
        bsMid = Math.floor(bsMin + ((bsMax - bsMin) / 2));
        var comparison = blockArray[bsMid].localeCompare(wordToBlock);
        if (comparison > 0) {
            // Key must be in the lower subset.
            bsMax = bsMid - 1;
        }
        else if (comparison < 0) {
            // Key must be in the upper subset.
            bsMin = bsMid + 1;
        }
        else {
            // Key has been found.
            // TODO: Highlight the key in the array for a moment so they can see it was already added.
            // TODO: Blank out the input box.
            return 2; // Error code 2: Key already exists in array.
        }
    }
    
    blockArray.push(wordToBlock);
    blockArray.sort();
    
    return 0;
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