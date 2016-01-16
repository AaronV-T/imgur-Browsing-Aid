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
		overCapacityCountDate: "neverSet"
	}, function (items) {
		overCapacityViews = items.overCapacityPageViews;
		overCapacityDate = items.overCapacityCountDate;
		overCapacityViews++;
	
		if (overCapacityDate == "neverSet") {
			var d = new Date();
			overCapacityDate = d.getDate();
		}
		
		chrome.storage.sync.set({
			overCapacityPageViews: overCapacityViews,
			overCapacityCountDate: overCapacityDate
		}, function () {
			addNotification("FYI:", "You have seen the over capacity page " + overCapacityViews + " times since " + overCapacityDate + "."); //Call function in notificationsContent.js
		});
		
		if (!document.getElementById("snakeGameDiv"))
			initializeSnakeGame(); //Call function in snakeContent.js
	});
}