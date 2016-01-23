var activeNotification;
var slideShowMessageBox;
var closeNotificationInterval;
var canDisplayNotifications;

//Load notifications options from storage.
chrome.storage.sync.get({ 
	//Set defaults.
	notificationsEnabled: true
}, function(items) {
	canDisplayNotifications = items.notificationsEnabled;
});


function addNotification(reasonGiven, descriptionGiven) {
	if(!canDisplayNotifications)
		return;
	
	closeActiveNotification();
	
	var notificationDiv = document.createElement("div");
	notificationDiv.setAttribute("id", "ibaNotification");
	
	var msgWidth = (window.innerWidth - 1030) / 2;
	if (msgWidth > 200)
		msgWidth = 200;
	else if (msgWidth < 150) //If the screen is too small: return.
		return;
	//var msgHeight = msgWidth / 2;
	
	var topPos = 0;
	var slideShowMsgBox = document.getElementById("slideShowMessageBox");
	if (slideShowMsgBox)
		topPos = slideShowMsgBox.style.height;
	
	notificationDiv.setAttribute("style", "z-index:9999;position: absolute;margin: 0 auto;width:"+msgWidth+"px;transform: translate(-50%);left: 50%;top:15%;border:2px solid;border-color: #2086E0;background-color: #272727;border-radius: .3em;padding: 0.6em;text-align:center;");
	
	var linebreak1 = document.createElement("br");
	notificationDiv.appendChild(linebreak1);
	
	var reasonTxt = document.createElement("span");
	reasonTxt.innerHTML = reasonGiven;
	notificationDiv.appendChild(reasonTxt);
	
	var linebreak2 = document.createElement("br");
	notificationDiv.appendChild(linebreak2);
	
	var descTxt = document.createElement("span");
	descTxt.innerHTML = descriptionGiven;
	notificationDiv.appendChild(descTxt);
	
	var closeNotificationButton = document.createElement("span");
	closeNotificationButton.innerHTML = "Close";
	closeNotificationButton.setAttribute("style", "cursor:pointer;position:absolute;top:.2em;right:.2em;color:#4E76C9;");
	closeNotificationButton.addEventListener("click", closeNotification);
	notificationDiv.appendChild(closeNotificationButton);
	
	var linebreak3 = document.createElement("br");
	notificationDiv.appendChild(linebreak3);
	
	if (descriptionGiven === "Post Already Viewed") {
		var disableButton = document.createElement("span");
		disableButton.innerHTML = "Press 'F9' to disable.";
		disableButton.setAttribute("style", "cursor:pointer;color:#4E76C9;");
		disableButton.addEventListener("click", temporarilyStopSkippingViewedPosts);
		notificationDiv.appendChild(disableButton);
	}
	else if (descriptionGiven.indexOf("User is blocked:") == 0) {
		$(descTxt).css("color", "red");
	}
	else if (descriptionGiven === "Check the username.") {
		$(descTxt).css("color", "green");
	
		var disableButton = document.createElement("span");
		disableButton.innerHTML = "Click to disable these notifications.";
		disableButton.setAttribute("style", "cursor:pointer;color:#4E76C9;");
		disableButton.addEventListener("click", permanentlyDisableSpecialUsersNotifications);
		notificationDiv.appendChild(disableButton);
	}
	else if (descriptionGiven === "This post was made by the creator of the imgur Browsing Aid extension.") {
		$(descTxt).css("color", "green");
		
		var disableButton = document.createElement("span");
		disableButton.innerHTML = "Disable These Notifications";
		disableButton.setAttribute("style", "cursor:pointer;color:#4E76C9;");
		disableButton.addEventListener("click", permanentlyDisableTollskiNotifications);
		notificationDiv.appendChild(disableButton);
	}
	
	document.getElementsByTagName("body")[0].appendChild(notificationDiv);
	activeNotification = document.getElementById("ibaNotification");
	
	var notificationBox = document.getElementById("ibaNotification");
	while (($(notificationBox.lastChild).position().top + $(notificationBox.lastChild).height()) >  $(notificationBox).innerHeight()) { //While the inside text is vertically overflowing: decrease font-size by 10%.
		console.log("Notification text overflow, fixing.");
		var oldFontSize = parseInt($(notificationBox).css("font-size"));
		var smallFontSize = oldFontSize * 0.9;
		$(notificationBox).css("font-size", smallFontSize + "px");
	}
	
	closeNotificationInterval = setInterval( function() {
		closeActiveNotification();
	}, 6500);
}

function addSlideShowMessageBox() {
	if(!canDisplayNotifications)
		return;
	
	if (slideShowMessageBox)
		$('#slideShowMessageBox').remove();
	
	var msgDiv = document.createElement("div");
	msgDiv.setAttribute("id", "slideShowMessageBox");
	
	var msgWidth = (window.innerWidth - 1030) / 2;
	if (msgWidth > 200)
		msgWidth = 200;
	else if (msgWidth < 150) //If the screen is too small: return.
		return;
	var msgHeight = msgWidth / 2;
	
	msgDiv.setAttribute("style", "z-index:9999;position: absolute;margin: 0 auto;width:"+msgWidth+"px;transform: translate(-50%);left: 50%;top: 15%;border:2px solid;border-color: #2086E0;background-color: #272727;border-radius: .3em;padding: 0.6em;text-align:center;");
	
	var timeTxt = document.createElement("span");
	timeTxt.innerHTML = "Next Post: ";
	timeTxt.setAttribute("id", "slideShowNextPostTime");
	msgDiv.appendChild(timeTxt);
	
	var linebreak1 = document.createElement("br");
	msgDiv.appendChild(linebreak1);
	
	var pauseTxt = document.createElement("span");
	pauseTxt.innerHTML = "Pause: 'p' or left arrow";
	msgDiv.appendChild(pauseTxt);
	
	var linebreak2 = document.createElement("br");
	msgDiv.appendChild(linebreak2);
	
	var unpauseTxt = document.createElement("span");
	unpauseTxt.innerHTML = "Un-Pause: 'p' or right arrow";
	msgDiv.appendChild(unpauseTxt);
	
	var linebreak3 = document.createElement("br");
	msgDiv.appendChild(linebreak3);
	
	var stopTxt = document.createElement("span");
	stopTxt.innerHTML = "Stop: 'e'";
	msgDiv.appendChild(stopTxt);
	
	var closeNotificationButton = document.createElement("span");
	closeNotificationButton.innerHTML = "Close";
	closeNotificationButton.setAttribute("style", "cursor:pointer;position:absolute;top: .2em;right: .2em;color:#4E76C9;");
	closeNotificationButton.setAttribute("class", "closeNotificationButton");
	closeNotificationButton.addEventListener("click", closeNotification);
	msgDiv.appendChild(closeNotificationButton);
	
	document.getElementsByTagName("body")[0].appendChild(msgDiv);
	slideShowMessageBox = document.getElementById("slideShowMessageBox");
}

function addSystemNotification(notificationText) {
	var notificationDiv = document.createElement("div");
	notificationDiv.setAttribute("id", "ibaSystemNotification");
	
	var msgWidth = 300;
	//var msgHeight = msgWidth / 2;
		
	notificationDiv.setAttribute("style", "z-index:9999;position: absolute;margin: 0 auto;width:"+msgWidth+"px;transform: translate(-50%);left: 50%;top: 15%;border:2px solid;border-color: #2086E0;background-color: #272727;border-radius: .3em;padding: 0.6em;text-align:center;");

	var titleSpan = document.createElement("span");
	titleSpan.innerHTML = "imgur Browsing Aid";
	notificationDiv.appendChild(titleSpan);
	
	var linebreak1 = document.createElement("br");
	notificationDiv.appendChild(linebreak1);
	
	var linebreak2 = document.createElement("br");
	notificationDiv.appendChild(linebreak2);
	
	var notificationSpan = document.createElement("span");
	notificationSpan.innerHTML = notificationText;
	notificationDiv.appendChild(notificationSpan);
		
	var closeNotificationButton = document.createElement("span");
	closeNotificationButton.innerHTML = "Close";
	closeNotificationButton.setAttribute("style", "cursor:pointer;position:absolute;top: .2em;right: .2em;color:#4E76C9;");
	closeNotificationButton.addEventListener("click", closeSystemMessage);
	notificationDiv.appendChild(closeNotificationButton);
	
	var aElements = notificationDiv.getElementsByTagName("a");
	for ( i = 0; i < aElements.length; i++) {
		aElements[i].addEventListener("click", function() {
			chrome.storage.sync.set({
				lastMessageRead: true
			}, function() {});
		});
	}
	
	document.getElementsByTagName("body")[0].appendChild(notificationDiv);
}


function closeActiveNotification() {
	$('#ibaNotification').remove();
	
	if (closeNotificationInterval)
		clearInterval(closeNotificationInterval);
}

function closeNotification() {
	if (closeNotificationInterval)
		clearInterval(closeNotificationInterval);
	
	var messageBox = this.parentNode;
	
	$(messageBox).remove();
}

function closeSystemMessage() {
	chrome.storage.sync.set({
		lastMessageRead: true
	}, function() {});
	
	var messageBox = this.parentNode;
	
	$(messageBox).remove();
}

function closeSlideShowMessageBox() {
	if (slideShowMessageBox)
		$('#slideShowMessageBox').remove();
}

function updateSlideShowMessage(secondsRemaining) {
	if(!canDisplayNotifications)
		return;
	
	var slideShowPostTimeSpan = document.getElementById("slideShowNextPostTime");
	if (slideShowPostTimeSpan)
		slideShowPostTimeSpan.innerHTML = "Next Post: " + secondsRemaining;
}