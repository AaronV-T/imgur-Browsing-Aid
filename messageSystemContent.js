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
	if (closeNotificationInterval)
		clearInterval(closeNotificationInterval);
	
	var notificationDiv = document.createElement("div");
	notificationDiv.setAttribute("id", "ibaNotification");
	
	var msgWidth = (window.innerWidth - 1030) / 2;
	if (msgWidth > 200)
		msgWidth = 200;
	else if (msgWidth < 150) //If the screen is too small: return.
		return;
	var msgHeight = msgWidth / 2;
	
	var topPos = 0;
	var slideShowMsgBox = document.getElementById("slideShowMessageBox");
	if (slideShowMsgBox)
		topPos = slideShowMsgBox.style.height;
	
	notificationDiv.setAttribute("style", "z-index:9999;position:fixed;top:" + topPos + ";left:0;height:" + msgHeight + "px;width:" + msgWidth + "px;border:2px solid;background-color:#121212;text-align:center;");
	
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
	
	var closeMessageButton = document.createElement("span");
	closeMessageButton.innerHTML = "Close";
	closeMessageButton.setAttribute("style", "cursor:pointer;position:absolute;top:0;right:0;color:#4E76C9;");
	//closeMessageButton.setAttribute("class", "closeMessageButton");
	closeMessageButton.addEventListener("click", closeMessage);
	notificationDiv.appendChild(closeMessageButton);
	
	if (descriptionGiven === "Post Already Viewed") {
		var linebreak3 = document.createElement("br");
		notificationDiv.appendChild(linebreak3);
		
		var allowButton = document.createElement("span");
		closeMessageButton.innerHTML = "Press 'F9' to disable.";
		closeMessageButton.setAttribute("style", "cursor:pointer;color:#4E76C9;");
		closeMessageButton.addEventListener("click", temporarilyStopSkippingViewedPosts);
		notificationDiv.appendChild(closeMessageButton);
	}
	else if (descriptionGiven === "Check the username.") {
		var linebreak3 = document.createElement("br");
		notificationDiv.appendChild(linebreak3);
		
		var allowButton = document.createElement("span");
		closeMessageButton.innerHTML = "Click here to disable these notifications.";
		closeMessageButton.setAttribute("style", "cursor:pointer;color:#4E76C9;");
		closeMessageButton.addEventListener("click", permanentlyDisableSpecialUsersNotifications);
		notificationDiv.appendChild(closeMessageButton);
	}
	
	document.getElementsByTagName("body")[0].appendChild(notificationDiv);
	activeNotification = document.getElementById("ibaNotification");
	
	closeNotificationInterval = setInterval( function() {
		closeActiveNotification();
	}, 5000);
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
	
	msgDiv.setAttribute("style", "z-index:9999;position:fixed;top:0;left:0;height:" + msgHeight + "px;width:" + msgWidth + "px;border:2px solid;background-color:#121212;");
	
	var timeTxt = document.createElement("span");
	timeTxt.innerHTML = "Next Post: ";
	timeTxt.setAttribute("id", "slideShowNextPostTime");
	msgDiv.appendChild(timeTxt);
	
	var linebreak1 = document.createElement("br");
	msgDiv.appendChild(linebreak1);
	
	var pauseTxt = document.createElement("span");
	pauseTxt.innerHTML = "Pause: 'p'";
	msgDiv.appendChild(pauseTxt);
	
	var linebreak2 = document.createElement("br");
	msgDiv.appendChild(linebreak2);
	
	var stopTxt = document.createElement("span");
	stopTxt.innerHTML = "Stop: 'e' or left arrow.";
	msgDiv.appendChild(stopTxt);
	
	var closeMessageButton = document.createElement("span");
	closeMessageButton.innerHTML = "Close";
	closeMessageButton.setAttribute("style", "cursor:pointer;position:absolute;top:0;right:0;color:#4E76C9;");
	closeMessageButton.setAttribute("class", "closeMessageButton");
	closeMessageButton.addEventListener("click", closeMessage);
	msgDiv.appendChild(closeMessageButton);
	
	document.getElementsByTagName("body")[0].appendChild(msgDiv);
	slideShowMessageBox = document.getElementById("slideShowMessageBox");
}

function closeActiveNotification() {
	$('#ibaNotification').remove();
}

function closeMessage() {
	if (closeNotificationInterval)
		clearInterval(closeNotificationInterval);
	
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