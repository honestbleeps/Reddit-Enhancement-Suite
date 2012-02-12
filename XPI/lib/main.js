// Import the APIs we need.
var pageMod = require("page-mod");
var Request = require('request').Request;
var self = require("self"); 
var firefox = typeof(require);
var tabs = require("tabs");
var ss = require("simple-storage");
var workers = new Array();

function detachWorker(worker, workerArray) {
	var index = workerArray.indexOf(worker);
	if(index != -1) {
		workerArray.splice(index, 1);
	}
}
var localStorage = ss.storage;

localStorage.getItem = function(key) {
	return ss.storage[key];
}
localStorage.setItem = function(key, value) {
	ss.storage[key] = value;
}
localStorage.removeItem = function(key) {
	delete ss.storage[key];
}


const {Cc,Ci} = require("chrome");

const fileDirectoryService = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD",Ci.nsIFile);
const storageService = Cc["@mozilla.org/storage/service;1"].getService(Ci.mozIStorageService);
fileDirectoryService.append("votes.sqlite");
var sql = storageService.openDatabase(fileDirectoryService);

var dbReady = false;
if (sql.schemaVersion == 0) {
	sql.executeAsync([
		//Done in one statemeny due to asyncronity issues
		sql.createStatement(
			'CREATE TABLE votes(thing TEXT PRIMARY KEY ON CONFLICT REPLACE, link TEXT NOT NULL, user TEXT NOT NULL, vote INTEGER CHECK (vote IN (1, 0, -1)), content TEXT NOT NULL, timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, subreddit NOT NULL);'
		+	'CREATE INDEX user_index ON votes(user);'
		+	'CREATE INDEX subreddit_index ON votes(subreddit);')
		], 1, {
			handleError: function(error) {
				console.error(error);
			},
			handleCompletion: function(reason) {
				if (reason == Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED){
					console.log("schema created");
					dbReady = true;
					sql.schemaVersion = 1;
				} else {
	      			console.error("Database setup failure!");
				}
			}
		});
} else {
	dbReady = true;
}

pageMod.PageMod({
  include: ["*.reddit.com"],
  contentScriptWhen: 'ready',
  // contentScriptFile: [self.data.url('jquery-1.6.4.min.js'), self.data.url('reddit_enhancement_suite.user.js')],
  contentScriptFile: [self.data.url('jquery-1.6.4.min.js'), self.data.url('reddit_enhancement_suite.user.js')],
  onAttach: function(worker) {
    workers.push(worker);
	worker.on('detach', function () {
		detachWorker(this, workers);
		// console.log('worker detached, total now: ' + workers.length);
    });
	// console.log('total workers: ' + workers.length);
	// worker.postMessage('init');
	worker.on('message', function(data) {
		var request = data;
		switch(request.requestType) {
			case 'GM_xmlhttpRequest':
				var responseObj = {
					XHRID: request.XHRID,
					name: request.requestType
				}
				if (request.method == 'POST') {
					Request({
						url: request.url,
						onComplete: function(response) {
							responseObj.response = {
								responseText: response.text,
								status: response.status
							}
							worker.postMessage(responseObj);
						},
						headers: request.headers,
						content: request.data
					}).post();
				} else {
					Request({
						url: request.url,
						onComplete: function(response) {
							responseObj.response = {
								responseText: response.text,
								status: response.status
							}
							worker.postMessage(responseObj);
						},
						headers: request.headers,
						content: request.data
					}).get();
				}
				
				break;
			case 'singleClick':
				var button = ((request.button == 1) || (request.ctrl == 1));
				// handle requests from singleClick module
				if (request.openOrder == 'commentsfirst') {
					// only open a second tab if the link is different...
					if (request.linkURL != request.commentsURL) {
						tabs.open({url: request.commentsURL, inBackground: button });
					}
					tabs.open({url: request.linkURL, inBackground: button });
				} else {
					tabs.open({url: request.linkURL, inBackground: button });
					// only open a second tab if the link is different...
					if (request.linkURL != request.commentsURL) {
						tabs.open({url: request.commentsURL, inBackground: button });
					}
				}
				worker.postMessage({status: "success"});
				break;
			case 'keyboardNav':
				var button = (request.button == 1);
				// handle requests from keyboardNav module
				thisLinkURL = request.linkURL;
				if (thisLinkURL.toLowerCase().substring(0,4) != 'http') {
					(thisLinkURL.substring(0,1) == '/') ? thisLinkURL = 'http://www.reddit.com' + thisLinkURL : thisLinkURL = location.href + thisLinkURL;
					
				}
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				tabs.open({url: thisLinkURL, inBackground: button });
				worker.postMessage({status: "success"});
				break;
			case 'openLinkInNewTab':
				var focus = (request.focus == true);
				thisLinkURL = request.linkURL;
				if (thisLinkURL.toLowerCase().substring(0,4) != 'http') {
					(thisLinkURL.substring(0,1) == '/') ? thisLinkURL = 'http://www.reddit.com' + thisLinkURL : thisLinkURL = location.href + thisLinkURL;
					
				}
				// Get the selected tab so we can get the index of it.  This allows us to open our new tab as the "next" tab.
				tabs.open({url: thisLinkURL, inBackground: !focus });
				worker.postMessage({status: "success"});
				break;
			case 'loadTweet':
				Request({
					url: request.url,
					onComplete: function(response) {
						var resp = JSON.parse(response.text);
						var responseObj = {
							name: 'loadTweet',
							response: resp
						}
						worker.postMessage(responseObj);
					},
					headers: request.headers,
					content: request.data
				}).get();
				break;
			case 'getLocalStorage':
				worker.postMessage({ name: 'getLocalStorage', message: localStorage });
				break;
			case 'saveLocalStorage':
				for (var key in request.data) {
					localStorage.setItem(key,request.data[key]);
				}
				localStorage.setItem('importedFromForeground',true);
				worker.postMessage({ name: 'saveLocalStorage', message: localStorage });
				break;
			case 'localStorage':
				switch (request.operation) {
					case 'getItem':
						worker.postMessage({status: true, value: localStorage.getItem(request.itemName)});
						break;
					case 'removeItem':
						localStorage.removeItem(request.itemName);
						// worker.postMessage({status: true, value: null});
						break;
					case 'setItem':
						localStorage.setItem(request.itemName, request.itemValue);
						// worker.postMessage({status: true, value: null});
						for each (var thisWorker in workers) {
							if (thisWorker != worker) {
								thisWorker.postMessage({ name: "localStorage", itemName: request.itemName, itemValue: request.itemValue });
							} 
						}
						break;
				}
				break;
			case 'vote':
				if (!dbReady) {
					console.log("ERROR: DATABASE UNACCESSIBLE");
					return;
				}
				switch (request.operation) {
					case 'insert':
						voteInsert(request, function(rs){
						}, function(err){
							console.error(JSON.stringify(err));
							worker.postMessage({"name": "vote", operation:"insert", status:"insert failed", error:err});
						});
						break;
					case 'select-user':
						console.log('select-user');
						selectUser(request, function(data){
							console.log('complete');
							var msg = {
								name:'vote',
								status:'success',
								operation:'select-user',
								user:request.user,
								data:data.data,
								count:data.count,
								page:request.page,
								length:request.length
							};
							worker.postMessage(msg);
						}, function(error){
							worker.postMessage({msgType:'vote', status:error});
						});
						break;
				}
				break;
			default:
				worker.postMessage({status: "unrecognized request type"});
				break;
		}


	});
  }
});


function voteInsert(data, resultCallback, errorCallback) {
	sql.beginTransaction();
	var stat = sql.createStatement("INSERT INTO votes(thing, link, user, vote, content, subreddit) VALUES(:thing, :link, :user, :vote, :content, :subreddit);");

	stat.params.thing = data.thing;
	stat.params.link = data.link;
	stat.params.user = data.user;
	stat.params.vote = data.vote;
	stat.params.content = data.content;
	stat.params.subreddit = data.subreddit;
	stat.executeAsync({
		handleResult: function(rs){
			resultCallback(rs);
		},
		handleError: function(error) {
			console.error(error);
			errorCallback(error);
			
		},
		handleCompletion: function(reason) {
			if (reason == Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED){
				sql.commitTransaction();
				
			} else {
		      	console.log("Query canceled or aborted!");
			}
		}
	});
}

function selectUser(request, success, failure) {
	var pageLen = ('length' in request?request.length:25);
	var offset = (('page' in request?request.page:1)-1)*pageLen;
	var stat = sql.createStatement('SELECT thing, link, vote, content, subreddit, timestamp FROM votes WHERE user = :user LIMIT :limit OFFSET :offset;');
	stat.params.user = request.user;
	stat.params.limit = pageLen;
	stat.params.offset = offset;
	stat.executeAsync({
		handleResult: function(rs){
			var columns = ['thing', 'link', 'vote', 'content', 'subreddit', 'timestamp'];
			var data = [];
			for (let row = rs.getNextRow(); row; row = rs.getNextRow()) {
				var row_ = {};
				for  (let i = 0; i < columns.length; i++) {
					row_[columns[i]] = row.getResultByName(columns[i]);
				}
				data.push(row_);
			}
			var stat2 = sql.createStatement('SELECT COUNT(*) AS count FROM votes WHERE user = :user;');
			stat.params.user = request.user;
			stat2.executeAsync({
				handleResult: function(rs){
					var count = rs.getNextRow().getResultByName('count');
					success({
						data: data,
						count: count
					});
				},
				handleError: function(error) {
					console.error(JSON.stringify(error));
					failure(error);
				}
			});
		},
		handleError: function(error) {
			console.error(JSON.stringify(error));
			failure(error);
		},
		handleCompletion: function(reason) {}
	});
}