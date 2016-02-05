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
                                    // Rewrite the blocked keyword array to reflect the update.
                                    populateBlockedKeywordList();
                                 
                                    // Notify the user that they need to reload Imgur for the change to take effect.
                                    updateStatusText("keywordStatus");
                                 });
    } else if (typeof value == 'number') {
        // Keyword already existed in the array. Highlight it and inform the user of what went wrong.
        populateBlockedKeywordListHighlight(value);
        updateStatusTextCustom("keywordStatus", "That keyword has already been blocked.");
    } else {
        // An error was encountered. Redraw the array to clear highlights and display the error for the user.
        populateBlockedKeywordList();
        updateStatusTextCustom("keywordStatus", value);
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
                                 // Rewrite the blocked subreddit array to reflect the update.
                                 populateBlockedSubredditList();
                                 
                                 // Notify the user that they need to reload Imgur for the change to take effect.
                                 updateStatusText("subredditStatus");
                             });
    } else if (typeof value == 'number') {
        // Subreddit already existed in the array. Highlight it and inform the user of what went wrong.
        populateBlockedSubredditListHighlight(value);
        updateStatusTextCustom("subredditStatus", "That subreddit has already been blocked.");
    } else {
        // An error was encountered. Redraw the array to clear highlights and display the error for the user.
        populateBlockedSubredditList();
        updateStatusTextCustom("subredditStatus", value);
        
    }
}

// Helper function for addBlockedKeyword and addBlockedSubreddit. Checks precondition (length > 0), performs binary search, pushes word if not in array.
// If an error condition was encountered, a string describing the error is returned.
// If the word was found in the array, the index of the word is returned.
// If the word was successfully inserted into the array, nothing is returned.
function addBlockedWord(wordToBlock, blockArray) {
    if (wordToBlock.length == 0)
        return "You must specify a word to block."; // Error state.
    
    //Check if keyword is already blocked. Now with binary search to speed up comparisons over large arrays.
    var bsMin = 0, bsMax = blockArray.length - 1, bsMid = 0, comparison = 0;
    while (bsMax >= bsMin) {
        bsMid = Math.floor(bsMin + ((bsMax - bsMin) / 2));
        comparison = blockArray[bsMid].localeCompare(wordToBlock);
        if (comparison > 0)
            bsMax = bsMid - 1; // Key must be in the lower subset.
        else if (comparison < 0)
            bsMin = bsMid + 1; // Key must be in the upper subset.
        else
            return bsMid; // Key has been found. Return its index for highlighting.
    }
    
    if (comparison < 0)
        blockArray.splice(bsMid+1, 0, wordToBlock); // Key should be at a greater index than the last tested key.
    else
        blockArray.splice(bsMid, 0, wordToBlock); // Key should be at the same index as the last tested key.
    
    return; // Success: Word inserted in array.
}

//blockAllSubredditsCheckboxClicked: Gets value of blockAllSubredditsCheckbox and saves to storage.
function blockAllSubredditsCheckboxClicked() {
	var blockAll = document.getElementById('blockAllSubredditsCheckbox').checked;
	
	chrome.storage.local.set({
		blockAllSubreddits: blockAll
	}, function() {
		updateStatusText("subredditStatus");
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
		updateStatusText("keywordStatus");
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
		updateStatusText("subredditStatus");
	});
}

// Displays the "Please refresh" message in the element with id matching 'field' parameter.
function updateStatusText(field) {
    updateStatusTextCustom(field, "Please refresh any open Imgur pages for changes to go into effect.");
}

// Performs the same function as updateStatusText, but allows custom text to be inserted.
function updateStatusTextCustom(field, customText) {
    var status;
    
    status = document.getElementById(field);
        
    status.textContent = customText;
    
    if (field == "keywordStatus") {
        if (disableKeywordStatus)
            clearTimeout(disableKeywordStatus);
        
        disableKeywordStatus = setTimeout(function() { status.textContent = ''; }, 3000);
    }
    else if (type == "subredditStatus") {
        if (disableSubredditStatus)
            clearTimeout(disableSubredditStatus);
        
        disableSubredditStatus = setTimeout(function() { status.textContent = ''; }, 3000);
    }
}