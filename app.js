var Twit = require('twit');
var env = require("./env"); // Imports API keys
var blacklist = require("./blacklist"); // Imports blacklist
var T = new Twit(env.keys); 
var maxHashtags = 7; // Sets max amount of Hashtags for spam check

// Looks for certain hashtags
var stream = T.stream('statuses/filter', { track: [
  '#vrgamers', '#vrgaming', '#vrgame', '#vrgames', '#beatsaber', '#jobsimulator', "#arizonasunshine",
  '#recroom', '#gargantuavr', '#seekingdawn', '#bladeandsorcery', '#asgardswrath', '#standoutvrbattleroyale',
  '#zerocalibervr', '#orbusvr', '#journeyforelysium', "#untilyoufallvr", "#halflifealyx", "#pop1", "#realvrfishing",
  '#frostpointvr', '#monsterreapersvr'
], language: 'en'});

// retweets found posts that match the criteria
stream.on('tweet', function (tweet) {
  var id = { id: tweet.id_str };

  if(checkTweet(tweet)){
    T.post('statuses/retweet/:id', id, function (err, data, response) {
      if(err){
        console.log(err)
      }
      else{
        console.log("Retweeted " + tweet.user.screen_name + "'s post with id: " + tweet.id_str)
      }
    }) 
    T.post('favorites/create', id, function (err, data, response) {
      if(err){
        console.log(err);
      }
    }) 
  }
})

// Runs tweet through checks
function checkTweet(tweet){
 if(
    checkOriginality(tweet) &&
    checkSpam(tweet) && 
    checkInsta(tweet) && 
    checkBlacklistedUsers(tweet) &&
    checkBlacklistedHashtags(tweet) &&
    checkBlacklistedWords(tweet)
  ){
   return true;
 }
 else{
   return false;
 }
}

// Checks that the found tweet is not a quote, retweet or reply
function checkOriginality(tweet){
  let isOriginal = false;
  if(!tweet.retweeted_status && !tweet.is_quote_status && tweet.in_reply_to_status_id === null){
    isOriginal = true;
  }
  else{
    console.log(tweet.user.screen_name + "'s tweet with id: " + tweet.id_str + " is not original.")
  }
  return isOriginal;
}

// Checks that the tweet is not spamming tags
function checkSpam(tweet){
  let isNotSpam = false;

  if(!tweet.truncated && tweet.entities.hashtags.length <= maxHashtags){
    console.log("(truncated)hashtags: " + tweet.entities.hashtags.length + " of maximum: " + maxHashtags);
    isNotSpam = true;
  }
  else if(tweet.truncated && tweet.extended_tweet.entities.hashtags.length <= maxHashtags){
    console.log("(non truncated)hashtags: " + tweet.extended_tweet.entities.hashtags.length + " of maximum: " + maxHashtags);
    isNotSpam = true;
  }
  else{
    console.log(tweet.user.screen_name + "'s tweet with id: " + tweet.id_str + " is most likely spam.")
  }
  return isNotSpam;
}

// Checks that the tweet does not contain instagram links
function checkInsta(tweet){
  let noInstaLink = true;

  if(!tweet.truncated){
    for(let i = 0; i < tweet.entities.urls.length; i++){
      console.log(tweet.entities.urls[i].expanded_url.slice(0, 24));
      if(tweet.entities.urls[i].expanded_url.slice(0, 25) === "https://www.instagram.com"){
        noInstaLink = false;
        console.log(tweet.user.name + "'s tweet with id: " + tweet.id_str + " contains an instagram link.")
      }  
    }  
  }
  else if(tweet.truncated){
    for(let i = 0; i < tweet.extended_tweet.entities.urls.length; i++){
      console.log(tweet.extended_tweet.entities.urls[i].expanded_url.slice(0, 24));
      if(tweet.extended_tweet.entities.urls[i].expanded_url.slice(0, 25) === "https://www.instagram.com"){
        noInstaLink = false;
        console.log(tweet.user.name + "'s tweet with id: " + tweet.id_str + " contains an instagram link.")
      }  
    }  
  }
  return noInstaLink;
}

// Checks that the user is not blacklisted
function checkBlacklistedUsers(tweet){
  let isNotBlacklisted = true;
  let screenName = tweet.user.screen_name;

  for(let i = 0; i < blacklist.names.length; i++){
    if(screenName === blacklist.names[i]){
      isNotBlacklisted = false;
      console.log("User: " + screenName + " is blacklisted.");
    }
  }
  return isNotBlacklisted;
}

// Checks that the tweet doesn't contain blacklisted hashtags
function checkBlacklistedHashtags(tweet){
  let isNotBlacklisted = true;
  let screenName = tweet.user.screen_name;

  for(let i = 0; i < blacklist.hashtags.length; i++){
    for(let j = 0; j < tweet.entities.hashtags.length; j++){
      if(blacklist.hashtags[i] === tweet.entities.hashtags[j]){
        isNotBlacklisted = false;
        console.log("Post cointains blacklisted hashtag: " + blacklist.hashtags[i]);
      }  
    }
  }
  return isNotBlacklisted;
}

function checkBlacklistedWords(tweet){
  let text;
  if(tweet.truncated){
    text = tweet.extended_tweet.full_text;
  } else {
    text = tweet.text;
  }

  const wordArr = blacklist.words.exec(text);
  if(wordArr){
    console.log("BLOCKED")
    return false;
  } else {
    console.log("OK")
    return true;
  }
}