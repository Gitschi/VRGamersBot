var Twit = require('twit');
var env = require("./env"); // Imports API keys
var T = new Twit(env.keys); 
var maxHashtags = 7; // Sets max amount of Hashtags for spam check

// Looks for certain hashtags
var stream = T.stream('statuses/filter', { track: [
  'vrgamers', '#vrgaming', '#vrgame', '#vrgames', '#vrchat', '#beatsaber', '#jobsimulator'
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
        console.log("Retweeted " + tweet.user.name + "'s post with id: " + tweet.id_str)
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
 if(checkOriginality(tweet) && checkSpam(tweet) && checkInsta(tweet)){
   return true;
 }
 else{
   return false;
 }
}

// Checks that the found tweet is not a quote, retweet or reply
function checkOriginality(tweet){
  var isOriginal = false;
  if(!tweet.retweeted_status && !tweet.is_quote_status && tweet.in_reply_to_status_id === null){
    isOriginal = true;
  }
  else{
    console.log(tweet.user.name + "'s tweet with id: " + tweet.id_str + " is not original.")
  }
  return isOriginal;
}

// Checks that the tweet is not spamming tags
function checkSpam(tweet){
  var isNotSpam = false;
  if(tweet.entities.hashtags.length <= maxHashtags){
    isNotSpam = true;
  }
  else{
    console.log(tweet.user.name + "'s tweet with id: " + tweet.id_str + " is not most likely spam.")
  }
  return isNotSpam;
}

// Checks that the tweet does not contain instagram links
function checkInsta(tweet){
  var noInstaLink = true;
  for(let i = 0; i < tweet.entities.urls.length; i++){
    if(tweet.entities.urls[i].expanded_url.slice(0, 24) === "https://www.instagram.com"){
      noInstaLink = false;
      console.log(tweet.user.name + "'s tweet with id: " + tweet.id_str + " contains an instagram link.")
    }  
  }
  return noInstaLink;
}