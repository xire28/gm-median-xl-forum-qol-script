// ==UserScript==
// @name     Median XL - Forum QoL script
// @description Add more username status colors on median XL forum (online, ingame, offline), more features to come...
// @version  1.0.3
// @grant    GM.xmlHttpRequest
// @include https://forum.median-xl.com/*
// @require https://code.jquery.com/jquery-3.1.0.min.js
// ==/UserScript==

(function(GM, $, document, localStorage, console){
  
  // Constants
  var EXTENSION_NAME = 'Greasemonkey',
  		SCRIPT_NAME = 'median_xl_forum_qol.js',
      
      STATUS_LEGEND_SELECTOR = 'em:contains(Legend:)',
      STATUS_LEGEND_ONLINE = "ingame users",
      STATUS_LEGEND_FORUM = 'forum users',
      STATUS_LEGEMD_OFFLINE = 'offline users',
  
      LOGS_PREFIX = '[' + EXTENSION_NAME + '][' + SCRIPT_NAME + '] ',
      CACHE_LOG_MESSAGE = function(onlineUsers, forumUsers, cacheTime){ return "Loaded " + onlineUsers.length + " " + STATUS_LEGEND_ONLINE + " and " + forumUsers.length + " " + STATUS_LEGEND_FORUM + " from localstorage cache (expire each " + cacheTime + " ms)"; },
      REQUEST_LOG_MESSAGE = function(url){ return "Requesting " + url + " and caching users"; },
  		GET_METHOD = 'GET',
  		FORUM_USERS_URL = 'https://forum.median-xl.com',
      ONLINE_USERS_URL = 'https://tsw.median-xl.com/info',
      CURRENT_TIMESTAMP = (new Date()).getTime(),
      CACHE_AVOIDANCE_URL_SUFFIX = "?t=" + CURRENT_TIMESTAMP,
      
      NOT_COLORED_USERNAME_SELECTOR = '.username:not([color])',
      
      ONLINE_USERS_SELECTOR = 'h3:contains("Players Online")+.list',
      ONLINE_USERS_SEPARATOR = ', ',
      ONLINE_USERS_COLOR = 'lightgreen',
      
      CACHE_ARRAY_SEPARATOR = ',',
      
      CACHED_ONLINE_USERS_KEY = 'onlineUsers',
      CACHED_ONLINE_USERS_RAW = localStorage.getItem(CACHED_ONLINE_USERS_KEY),
      CACHED_ONLINE_USERS = CACHED_ONLINE_USERS_RAW && CACHED_ONLINE_USERS_RAW.split(CACHE_ARRAY_SEPARATOR),
      
      FORUM_USERS_SELECTOR = '.online-list .username',
      FORUM_USERS_COLOR = 'cyan',
      CACHED_FORUM_USERS_KEY = 'forumUsers',
      CACHED_FORUM_USERS_RAW = localStorage.getItem(CACHED_FORUM_USERS_KEY),
      CACHED_FORUM_USERS = CACHED_FORUM_USERS_RAW && CACHED_FORUM_USERS_RAW.split(CACHE_ARRAY_SEPARATOR),
      
      SECONDS = 1000,
      CACHE_TIME = 30 * SECONDS,
      CACHED_EXPIRATION_KEY = 'expiration',
      CACHED_EXPIRATION = parseInt(localStorage.getItem(CACHED_EXPIRATION_KEY)),
      
      NOT_FOUND = -1,
      OFFLINE_USERS_COLOR = 'gray',
  		REAPPLY_USERNAME_COLORS_INTERVAL = 0.1 * SECONDS,
      
      STATUS_LEGEND_TAG = $('<span/>').css({'text-transform': 'capitalize'}),
      STATUS_LEGEND_SEPARATOR = ', ',
      STATUS_LEGEND_ONLINE_TAG = STATUS_LEGEND_TAG.clone().text(STATUS_LEGEND_ONLINE).css({color: ONLINE_USERS_COLOR}),
      STATUS_LEGEND_FORUM_TAG = STATUS_LEGEND_TAG.clone().text(STATUS_LEGEND_FORUM).css({color: FORUM_USERS_COLOR}),
      STATUS_LEGEND_OFFLINE_TAG = STATUS_LEGEND_TAG.clone().text(STATUS_LEGEMD_OFFLINE).css({color: OFFLINE_USERS_COLOR});
  
  function applyColorOnUsernameLinks(onlineUsers, forumUsers){
    $(document.body).find(NOT_COLORED_USERNAME_SELECTOR).each(function(_, usernameTag) {
      var $usernameTag = $(usernameTag),
          username = $usernameTag.text(),
          isOnline = onlineUsers.indexOf(username) != NOT_FOUND,
          isOnForum = forumUsers.indexOf(username) != NOT_FOUND;
    
      $usernameTag.css({color: isOnline ? ONLINE_USERS_COLOR : (isOnForum ? FORUM_USERS_COLOR : OFFLINE_USERS_COLOR)});
    });
  }
  
  if(CACHED_ONLINE_USERS && CACHED_FORUM_USERS && CACHED_EXPIRATION && CACHED_EXPIRATION + CACHE_TIME >= CURRENT_TIMESTAMP){
    console.log(LOGS_PREFIX + CACHE_LOG_MESSAGE(CACHED_ONLINE_USERS, CACHED_FORUM_USERS, CACHE_TIME));
    var bindedApplyColors = applyColorOnUsernameLinks.bind(this, CACHED_ONLINE_USERS, CACHED_FORUM_USERS);
    $(bindedApplyColors);
    setInterval(bindedApplyColors, REAPPLY_USERNAME_COLORS_INTERVAL);
  } else {
    console.log(LOGS_PREFIX + REQUEST_LOG_MESSAGE(FORUM_USERS_URL));
    GM.xmlHttpRequest({
      method: GET_METHOD,
      url: FORUM_USERS_URL + CACHE_AVOIDANCE_URL_SUFFIX,
      onload: function(forumResponse) {
          var $html = $(forumResponse.responseText),
              $forumUserLinks = $html.find(FORUM_USERS_SELECTOR),
              forumUsers = $.map($forumUserLinks, function(l) { return $(l).text() });
                  
        	console.log(LOGS_PREFIX + REQUEST_LOG_MESSAGE(ONLINE_USERS_URL));
          GM.xmlHttpRequest({
            method: GET_METHOD,
            url: ONLINE_USERS_URL + CACHE_AVOIDANCE_URL_SUFFIX,
            onload: function(infoResponse) {
              var $infoHtml = $(infoResponse.responseText),
                  onlineUsers = $infoHtml.find(ONLINE_USERS_SELECTOR).text().split(ONLINE_USERS_SEPARATOR);

              applyColorOnUsernameLinks(onlineUsers, forumUsers);
              
              localStorage.setItem(CACHED_ONLINE_USERS_KEY, onlineUsers);
    					localStorage.setItem(CACHED_FORUM_USERS_KEY, forumUsers);
    					localStorage.setItem(CACHED_EXPIRATION_KEY, CURRENT_TIMESTAMP);
            }
          }); 
      }    
    });
  }
  
  $(STATUS_LEGEND_SELECTOR).append(STATUS_LEGEND_SEPARATOR).append(STATUS_LEGEND_ONLINE_TAG).append(STATUS_LEGEND_SEPARATOR).append(STATUS_LEGEND_FORUM_TAG).append(STATUS_LEGEND_SEPARATOR).append(STATUS_LEGEND_OFFLINE_TAG)
  
})(GM, jQuery, document, localStorage, console);

