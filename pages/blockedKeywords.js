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
    var result;
    
    // Blank out the input box.
    document.getElementById("blockKeywordInput").value = "";
    
    if (typeof (value = addBlockedWord(keywordToBlock, blockedKeywordArray)) == 'undefined') {
        // Keyword was added successfully. Save to storage.
        chrome.storage.local.set({
                                 blockedKeywords: blockedKeywordArray
                                 }, function() {
                                    populateBlockedKeywordList();
                                    updateStatusText("keyword");
                                 });
    } else if (typeof value == 'number') {
        // Subreddit already existed in the array. Highlight it.
        populateBlockedKeywordListHighlight(value);
        
        // Inform the user of what went wrong.
        updateStatusTextCustom("keyword", "That keyword has already been blocked.");
    } else {
        // An error was encountered. Display it for the user.
        updateStatusTextCustom("keyword", value);
        
        // Redraw the array to clear highlights.
        populateBlockedKeywordList();
    }
}

//addBlockedSubreddit: Gets value input by user and adds it to the blockedSubreddits array.
function addBlockedSubreddit() {
    var subredditToBlock = document.getElementById("blockSubredditInput").value;
    var index;
    
    // Blank out the input box.
    document.getElementById("blockSubredditInput").value = "";
    
    if (typeof (value = addBlockedWord(subredditToBlock, blockedSubredditArray)) == 'undefined') {
        // Subreddit was added successfully. Save to storage.
        chrome.storage.local.set({
                             blockedSubreddits: blockedSubredditArray
                             }, function() {
                                 populateBlockedSubredditList();
                                 updateStatusText("subreddit");
                             });
    } else if (typeof value == 'number') {
        // Subreddit already existed in the array. Highlight it.
        populateBlockedSubredditListHighlight(value);
        
        // Inform the user of what went wrong.
        updateStatusTextCustom("subreddit", "That subreddit has already been blocked.");
    } else {
        // An error was encountered. Display it for the user.
        updateStatusTextCustom("subreddit", value);
        
        // Redraw the array to clear highlights.
        populateBlockedSubredditList();
    }
}

// Helper function for addBlockedKeyword and addBlockedSubreddit. Checks precondition (length > 0), performs binary search, pushes word if not in array.
// If an error condition was encountered, a string describing the error is returned.
// If the word was found in the array, the index of the word is returned.
// If the word was successfully inserted into the array, nothing is returned.
function addBlockedWord(wordToBlock, blockArray) {
    if (wordToBlock.length == 0)
        return "You must specify a word to block.";
    
    //Check if keyword is already blocked. Now with binary search to speed up comparisons over large arrays.
    var bsMin = 0, bsMax = blockArray.length - 1, bsMid = 0, comparison = 0;
    while (bsMax >= bsMin) {
        bsMid = Math.floor(bsMin + ((bsMax - bsMin) / 2));
        comparison = blockArray[bsMid].localeCompare(wordToBlock);
        // console.log(wordToBlock + " vs " + blockArray[bsMid] + ": " + comparison + ". bsMax="+bsMax+", bsMid="+bsMid+", bsMin="+bsMin+".");
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
            return bsMid;
        }
    }
    
    // Removed push/sort in favor of insertion, since we know the position of the array that the key should go into.
    if (comparison < 0) {
        // Key should be at a greater index than the last tested key.
        // This also accounts for edge case of empty array (in which case bsMid == -1).
        blockArray.splice(bsMid+1, 0, wordToBlock);
    } else {
        // Key should be at the same index as the last tested key.
        blockArray.splice(bsMid, 0, wordToBlock);
    }
    
    return; // Success: Word inserted in array.
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
    populateBlockedKeywordListHighlight(-1);
}

//populateBlockedSubredditListHighlight: Displays all the blocked subreddits and adds buttons to unblock them.
function populateBlockedSubredditList() {
    populateBlockedSubredditListHighlight(-1);
}

//populateBlockedKeywordListHighlight: Displays all the blocked keywords and adds buttons to unblock them. Highlights the entry at the given index.
function populateBlockedKeywordListHighlight(index) {
    var listHTML = "";
    
    for (i = 0; i < blockedKeywordArray.length; i++) {
        if (i == index) {
            // TODO: Instead of a static highlight, make this a red pulse that fades back to black.
            listHTML += '<tr><td><font color = "ff0000">' + blockedKeywordArray[i] + '</font></td><td><input type="button" value="Unblock" id="removeKeyword' + i + '" keyword="' + blockedKeywordArray[i] + '" /></td></tr>';
        } else {
            listHTML += '<tr><td>' + blockedKeywordArray[i] + '</td><td><input type="button" value="Unblock" id="removeKeyword' + i + '" keyword="' + blockedKeywordArray[i] + '" /></td></tr>';
        }
    }
    
    document.getElementById("blockedKeywordsTable").innerHTML = listHTML;
    
    for (i = 0; i < blockedKeywordArray.length; i++) {
        document.getElementById("removeKeyword" + i).addEventListener("click", unblockKeyword);
    }
}

//populateBlockedSubredditListHighlight: Displays all the blocked subreddits and adds buttons to unblock them. Highlights the entry at the given index.
function populateBlockedSubredditListHighlight(index) {
    var listHTML = "";
    
    for (i = 0; i < blockedSubredditArray.length; i++) {
        if (i == index) {
            // TODO: Instead of a static highlight, make this a red pulse that fades back to black.
            listHTML += '<tr><td><font color = "ff0000">' + blockedSubredditArray[i] + '</font></td><td><input type="button" value="Unblock" id="removeSubreddit' + i + '" subreddit="' + blockedSubredditArray[i] + '" /></td></tr>';
        } else {
            listHTML += '<tr><td>' + blockedSubredditArray[i] + '</td><td><input type="button" value="Unblock" id="removeSubreddit' + i + '" subreddit="' + blockedSubredditArray[i] + '" /></td></tr>';
        }
    }
    
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

// Displays the "Please refresh" message in the selected text box.
function updateStatusText(type) {
    updateStatusTextCustom(type, "Please refresh any open Imgur pages for changes to go into effect.");
}

// Performs the same function as updateStatusText, but allows custom text to be inserted.
function updateStatusTextCustom(type, customText) {
    var status;
    if (type == "keyword") {
        status = document.getElementById('keywordStatus');
        
        status.textContent = customText;
        
        if (disableKeywordStatus)
            clearTimeout(disableKeywordStatus);
        
        disableKeywordStatus = setTimeout(function() {
                                          status.textContent = '';
                                          }, 3000);
    }
    else if (type == "subreddit") {
        status = document.getElementById('subredditStatus');
        
        status.textContent = customText;
        
        if (disableSubredditStatus)
            clearTimeout(disableSubredditStatus);
        
        disableSubredditStatus = setTimeout(function() {
                                            status.textContent = '';
                                            }, 3000);
    }
    else
        return;
}