$('body').ready(function() {
	var h1Elements = document.getElementsByTagName("h1");
	
	for (i = 0; i < h1Elements.length; i++) {
		if (h1Elements[i].innerHTML == "Imgur is over capacity!") {
			loadOverCapacityContent(); //Call function in overCapacityContent.js
			return;
		}
	}
});

var overCapacityViews, overCapacityDate;

//main: Called when an over capacity page is loaded.
function loadOverCapacityContent() {
	chrome.storage.sync.get({
		overCapacityPageViews: 0,
		overCapacityCountDate: "neverSet",
        snakeGameEnabled: true
	}, function (items) {
		overCapacityViews = items.overCapacityPageViews;
		overCapacityDate = items.overCapacityCountDate;
		overCapacityViews++;
	
		if (overCapacityDate == "neverSet") {
			var d = new Date();
			
			var theMonth = d.getMonth();
			if (theMonth == 0) theMonth = "January";
			else if (theMonth == 1) theMonth = "February";
			else if (theMonth == 2) theMonth = "March";
			else if (theMonth == 3) theMonth = "April";
			else if (theMonth == 4) theMonth = "May";
			else if (theMonth == 5) theMonth = "June";
			else if (theMonth == 6) theMonth = "July";
			else if (theMonth == 7) theMonth = "August";
			else if (theMonth == 8) theMonth = "September";
			else if (theMonth == 9) theMonth = "October";
			else if (theMonth == 10) theMonth = "November";
			else if (theMonth == 11) theMonth = "December";
			
			overCapacityDate = d.getDate() + " " + theMonth + " " + d.getFullYear();
		}
		console.log("overCapacityDate: " + overCapacityDate);
		chrome.storage.sync.set({
			overCapacityPageViews: overCapacityViews,
			overCapacityCountDate: overCapacityDate
		}, function () {
			addNotification("FYI:", "You have seen the over capacity page " + overCapacityViews + " times since " + overCapacityDate + "."); //Call function in notificationsContent.js
		});
		
		if (snakeGameEnabled && !document.getElementById("snakeGameDiv"))
			initializeSnakeGame(); //Call function in snakeContent.js
	});
}