var favoritedImagesArray = new Array();
var favoritedImagesDirectoriesArray = new Array();
var currentDirName;
var favoriteArrayMaxLength = 45;
var dirDivPos;
var imgDeletionConfirmation = true;

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('newDirectoryButton').addEventListener('click', createNewDirectory);
document.getElementById('syncButton').addEventListener('click', goToFavorites);
document.getElementById('requireDeleteConfirm').addEventListener('click', updateImgDeletionConfirmation);

$(window).scroll(function() {
	if (dirDivPos === undefined) {
		console.log ("dirDivPos undefined");
		return;
	}
	if($(window).scrollTop() > dirDivPos.top)
		$('#directoriesDiv').css('position','fixed').css('top','0').css('left','50%').css('marginLeft','-500px');
	else 
		$('#directoriesDiv').css('position','static').css('left','').css('marginLeft','');    
});

// Loads options from chrome.storage
function restore_options() {
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) { //If using Chrome sync for storage is enabled...
			chrome.storage.sync.get({
			// Set defaults.
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
				chrome.storage.sync.getBytesInUse(null, function(bytesInUse) { 
					var percentInUse = bytesInUse/chrome.storage.sync.QUOTA_BYTES;
					
					console.log("chrome.storage.sync bytesInUse: " + bytesInUse +". (" + Math.round(percentInUse * 100) + "% of total)"); 
				});
				chrome.storage.sync.getBytesInUse("favoritedImages", function(bytesInUse) { console.log("favoritedImages bytesInUse: " + bytesInUse); });
				chrome.storage.sync.getBytesInUse("favoritedImages1", function(bytesInUse) { console.log("favoritedImages1 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages1.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages2", function(bytesInUse) { console.log("favoritedImages2 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages2.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages3", function(bytesInUse) { console.log("favoritedImages3 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages3.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages4", function(bytesInUse) { console.log("favoritedImages4 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages4.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages5", function(bytesInUse) { console.log("favoritedImages5 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages5.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages6", function(bytesInUse) { console.log("favoritedImages6 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages6.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages7", function(bytesInUse) { console.log("favoritedImages7 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages7.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages8", function(bytesInUse) { console.log("favoritedImages8 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages8.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages9", function(bytesInUse) { console.log("favoritedImages9 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages9.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages10", function(bytesInUse) { console.log("favoritedImages10 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages10.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages11", function(bytesInUse) { console.log("favoritedImages11 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages11.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages12", function(bytesInUse) { console.log("favoritedImages12 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages12.length); });
				chrome.storage.sync.getBytesInUse("favoritedImages13", function(bytesInUse) { console.log("favoritedImages13 bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages13.length); });
				
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
				
				favoritedImagesDirectoriesArray = items.favoritedImagesDirectories;
				
				console.log("favoritedImagesArray.length: " + favoritedImagesArray.length);
				main();
			});
		}
		else {
			chrome.storage.local.get({
			// Set defaults.
				favoritedImages: new Array(),
				favoritedImagesDirectories: new Array()
			}, function(items) {
				chrome.storage.local.getBytesInUse(null, function(bytesInUse) { 
					var percentInUse = bytesInUse/chrome.storage.local.QUOTA_BYTES;
					
					console.log("chrome.storage.local bytesInUse: " + bytesInUse +". (" + Math.round(percentInUse * 100) + "% of total)"); 
				});
				chrome.storage.sync.getBytesInUse("favoritedImages", function(bytesInUse) { console.log("favoritedImages bytesInUse: " + bytesInUse + ". length: " + items.favoritedImages.length); });
				
				favoritedImagesArray = items.favoritedImages;
				favoritedImagesDirectoriesArray = items.favoritedImagesDirectories;
				
				main();
			});
		}
	});
}

function main() {
	/*for (i = 0; i < favoritedImagesArray.length; i++) {
		if (favoritedImagesArray[i] != null)
			console.log("favoritedImagesArray has id: " + favoritedImagesArray[i].id);
	}*/
	
	setCurrentDirName();
	updateCurrentDirectoryHeader();
	populateDirectories();
	populateImages();
	
	document.getElementById("requireDeleteConfirm").checked = imgDeletionConfirmation;
	
	document.getElementById('mainDiv').style.display = "inline";
	document.getElementById('loadingDiv').style.display = "none";
	
	dirDivPos = $('#directoriesDiv').offset();
}

function allowDrop(ev) {
	event.preventDefault();
}

function createNewDirectory() {
	var newDirectoryName = document.getElementById("newDirectoryName").value;

	if (newDirectoryName.length <= 0) {
		document.getElementById("newDirectoryError").innerHTML = "Please enter a folder name.";
		return;
	}
	
	cleanedDirectoryName = newDirectoryName.replace(/[^a-zA-Z0-9-_]/g, '');
	
	if (newDirectoryName.length != cleanedDirectoryName.length) {
		document.getElementById("newDirectoryError").innerHTML = "Please enter a valid folder name. (No special characters or spaces.)";
		return;
	}
	
	for (i = 0; i < favoritedImagesDirectoriesArray.length; i++) {
		if (newDirectoryName == favoritedImagesDirectoriesArray[i]) {
			document.getElementById("newDirectoryError").innerHTML = "Folder already exists.";
			return;
		}
	}
	
	if (newDirectoryName == "root") {
		document.getElementById("newDirectoryError").innerHTML = "You can not use that folder name.";
		return;
	}
	
	favoritedImagesDirectoriesArray.push(newDirectoryName);
	favoritedImagesDirectoriesArray.sort();
	
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) { //If using Chrome sync for storage is enabled...
			chrome.storage.sync.set({
				favoritedImagesDirectories: favoritedImagesDirectoriesArray
			}, function() {
				document.getElementById("newDirectoryName").value = "";
				document.getElementById("newDirectoryError").innerHTML = "";
				populateDirectories();
			});
		}
		else {
			chrome.storage.local.set({
				favoritedImagesDirectories: favoritedImagesDirectoriesArray
			}, function() {
				document.getElementById("newDirectoryName").value = "";
				document.getElementById("newDirectoryError").innerHTML = "";
				populateDirectories();
			});
		}
	});
}

function deleteCurrentDirectory() {
	if (currentDirName == "root") {
		document.getElementById("deleteCurrentDirectoryError").innerHTML = "You can't delete the root folder.";
		return;
	}
	
	var isEmpty = true;
	for (i = 0; i < favoritedImagesArray.length; i++) {
		if (favoritedImagesArray[i].directory == currentDirName) {
			isEmpty = false;
			break;
		}
	}
	
	if (!isEmpty) {
		document.getElementById("deleteCurrentDirectoryError").innerHTML = "Folder must be empty to delete.";
		return;
	}
	
	var dirIndex = -1;
	for (i = 0; i < favoritedImagesDirectoriesArray.length; i++) {
		if (currentDirName == favoritedImagesDirectoriesArray[i]) {
			dirIndex = i;
			break;
		}
	}
	
	if (dirIndex == -1) {
		document.getElementById("deleteCurrentDirectoryError").innerHTML = "Folder not found. Can't be deleted.";
	}
	else {
		favoritedImagesDirectoriesArray.splice(dirIndex, 1);
		
		chrome.storage.sync.get({ 
			useSynchronizedStorage: false
		}, function(items) {
			if (items.useSynchronizedStorage) { //If using Chrome sync for storage is enabled...
				chrome.storage.sync.set({
					favoritedImagesDirectories: favoritedImagesDirectoriesArray
				}, function() {
					chrome.tabs.getSelected(null,function(tab) {
						chrome.tabs.update(tab.id, { url: "chrome-extension://" + chrome.runtime.id + "/favoriteImages.html" });
					});
				});
			}
			else {
				chrome.storage.local.set({
					favoritedImagesDirectories: favoritedImagesDirectoriesArray
				}, function() {
					chrome.tabs.getSelected(null,function(tab) {
						chrome.tabs.update(tab.id, { url: "chrome-extension://" + chrome.runtime.id + "/favoriteImages.html" });
					});
				});
			}
		});
		
	}
}

function deleteImgClick() {
	if (imgDeletionConfirmation) {
		var ask = confirm('Do you really wish to delete this image?');
		if(ask)
			deleteImg(this.parentNode.parentNode.firstChild.getAttribute("id"));
	}
	else
		deleteImg(this.parentNode.parentNode.firstChild.getAttribute("id"));
}

function deleteImg(delID) {
	var delIndex = -1;
	for (i = 0; i < favoritedImagesArray.length; i++) {
		if (delID == favoritedImagesArray[i].id) {
			delIndex = i;
			break;
		}
	}
	
	if (delIndex > -1)
		favoritedImagesArray.splice(delIndex, 1);
	
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
				populateImages();
			});
		}
		else {
			chrome.storage.local.set({
				favoritedImages: favoritedImagesArray
			}, function() {
				populateImages();
			});
		}
	});
}
		
function drag(ev) {
	ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
	ev.preventDefault();
	var id = ev.dataTransfer.getData("text");
	console.log(id + " ::: " + ev.target.innerHTML);
	
	chrome.storage.sync.get({ 
		useSynchronizedStorage: false
	}, function(items) {
		if (items.useSynchronizedStorage) { //If using Chrome sync for storage is enabled...
			chrome.storage.sync.get({
			// Set defaults.
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
				
				for (i = 0; i < favoritedImagesArray.length; i++) {
					if (id == favoritedImagesArray[i].id) {
						favoritedImagesArray[i].directory = ev.target.innerHTML;
						break;
					}
				}
				
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
					//window.location.reload();
					populateImages();
				});
			});
		}
		else {
			chrome.storage.local.get({
			// Set defaults.
				favoritedImages: new Array()
			}, function(items) {
				favoritedImagesArray = items.favoritedImages;
				
				for (i = 0; i < favoritedImagesArray.length; i++) {
					if (id == favoritedImagesArray[i].id) {
						favoritedImagesArray[i].directory = ev.target.innerHTML;
						break;
					}
				}
				
				chrome.storage.local.set({
					favoritedImages: favoritedImagesArray
				}, function() {
					//window.location.reload();
					populateImages();
				});
			});
		}
	});
}

function goToDirectory() {
	var dirName = this.innerHTML;
	var href = "chrome-extension://" + chrome.runtime.id + "/favoriteImages.html";
	
	if (dirName != "root")
		href += "?" + dirName;
		
	chrome.tabs.getSelected(null,function(tab) {
		chrome.tabs.update(tab.id, { url: href });
	});
}

function goToFavorites() {
	chrome.tabs.getSelected(null,function(tab) {
		chrome.tabs.update(tab.id, { url: "http://imgur.com/account/favorites" });
	});
}

function goToPost() {
	chrome.tabs.create({ 'url': "http://imgur.com/account/favorites/" + this.getAttribute("id") });
}

function populateDirectories() {
	var tableHTML = '<tr><th style="text-align:center;" colspan="10">Folders</th></tr>';
	tableHTML += '<tr><td><span style="color:#4E76C9;" class="goToDirectory">root</span></td>';
	var colMax = 8;
	var colCount = 1;
	for (i = 0; i < favoritedImagesDirectoriesArray.length; i++) {
		if (favoritedImagesDirectoriesArray[i] == "root") continue;
		if (colCount == colMax){
			tableHTML += '</tr>';
			colCount = 0;
		}
		
		if (colCount == 0)
			tableHTML += '<tr>';
			
		tableHTML += '<td><span style="color:#4E76C9;" class="goToDirectory">' + favoritedImagesDirectoriesArray[i] + '</span></td>';
		colCount++;
	}
	tableHTML += '</tr>';
	
	document.getElementById("directoriesTable").innerHTML = tableHTML;
	
	var goToDirectoryButtons = document.getElementsByClassName("goToDirectory");
	for (i = 0; i < goToDirectoryButtons.length; i++) {
		goToDirectoryButtons[i].addEventListener("click", goToDirectory);
		goToDirectoryButtons[i].addEventListener("dragover", function(event) { allowDrop(event); });
		goToDirectoryButtons[i].addEventListener("drop", function(event) { drop(event); });
	}
		
}

function populateImages() {
	$('.imgDiv').remove();
	
	var colCount = 0;
	for (i = 0; i < favoritedImagesArray.length; i++) {
		if (favoritedImagesArray[i] == null) {
			console.log("favoritedImagesArray[" + i + "] was null. Please submit a bug report with this information.");
			continue;
		}
		if (favoritedImagesArray[i].directory == currentDirName) {
			var imgDiv = document.createElement("div");
			imgDiv.setAttribute("class", "imgDiv");
			if (colCount == 4) {
				imgDiv.setAttribute("style", "padding-bottom:14.5px;float:left;");
				colCount = 0;
			}
			else {
				imgDiv.setAttribute("style", "padding-bottom:14.5px;padding-right:9.5px;float:left;");
				colCount++;
			}
			
			var img = document.createElement("img");
			img.setAttribute("style", "width:180px;height:180px;");
			
			if (favoritedImagesArray[i].imgSrc.indexOf("http://i.imgur.com") > -1) //For images synced with extension versions < 0.3.3
				img.setAttribute("src", favoritedImagesArray[i].imgSrc);
			else
				img.setAttribute("src", "http://i.imgur.com/" + favoritedImagesArray[i].imgSrc  + ".jpg");
			img.setAttribute("id", favoritedImagesArray[i].id);
			
			if (favoritedImagesArray[i].title.length < 30)
				img.setAttribute("title", favoritedImagesArray[i].title);
			else
				img.setAttribute("title", favoritedImagesArray[i].title + "...");
			
			img.setAttribute("class", "favoriteImage");
			img.setAttribute("draggable", "true");
			
			var imgControlsDiv = document.createElement("div");
			imgControlsDiv.setAttribute("style", "text-align: center;")
			var deleteImgSpan = document.createElement("span");
			deleteImgSpan.setAttribute("class", "deleteImg");
			deleteImgSpan.innerHTML = "Delete";
			
			imgControlsDiv.appendChild(deleteImgSpan);
			
			imgDiv.appendChild(img);
			imgDiv.appendChild(imgControlsDiv);
			
			var placementElement = document.getElementById("imagesDiv");
			placementElement.appendChild(imgDiv);
		}
	}
	
	var favImgs = document.getElementsByClassName("favoriteImage");
	for (i = 0; i < favImgs.length; i++) {
		favImgs[i].addEventListener("click", goToPost);
		favImgs[i].addEventListener("dragstart", drag);
	}
	
	var deleteImgs = document.getElementsByClassName("deleteImg");
	for (i = 0; i < deleteImgs.length; i++) {
		deleteImgs[i].addEventListener("click", deleteImgClick);
	}
}

function setCurrentDirName() {
	if (window.location.href.lastIndexOf("?") == -1)
		currentDirName = "";
	else
		currentDirName = window.location.href.substring(window.location.href.lastIndexOf("?") + 1, window.location.href.length);

	if (currentDirName === undefined || currentDirName.length == 0)
		currentDirName = "root";
}

function updateCurrentDirectoryHeader() {
	document.getElementById("currentDirectoryHeader").innerHTML = "Folder: " + currentDirName;
	
	if (currentDirName != "root") {
		var deleteCurrentDirectorySpan = document.getElementById("deleteCurrentDirectory");
		deleteCurrentDirectorySpan.innerHTML = "(Click here to delete this folder.)";
		deleteCurrentDirectorySpan.addEventListener('click', deleteCurrentDirectory);
	}
}

function updateImgDeletionConfirmation() {
	imgDeletionConfirmation = document.getElementById("requireDeleteConfirm").checked;
}