chrome.runtime.sendMessage( { messageType: "checkForMessage" } ); //Send message to background script to check for messages.

chrome.storage.sync.get({ 
	lastMessage: "",
	lastMessageRead: true
}, function(items) {
	if (!items.lastMessageRead) {
		addSystemNotification(items.lastMessage);
		console.log("displaying system message");
	}
});
