var Twit = require('twit');
var secret = require("./secret"); // Imports API keys
var T = new Twit(secret); // Pushes API keys into constructor and makes new object

// Looks for certain hashtags in the stream
var stream = T.stream('statuses/filter', { track: ['#vrgamers', '#vrgames', '#vrchat', '#beatsaber'], language: 'en'});

// retweets found tweets that match the criteria
stream.on('tweet', function (tweet) {
  if(isNotRt(tweet)){
    T.post('statuses/retweet/:id', { id: tweet.id }, function (err, data, response) {
      console.log(data)
    }) 
  }
})

// Checks that the found tweet is not a quote, retweet or reply
function isNotRt(tweet){
  var isClean = false;
  if(!tweet.is_quote_status && !tweet.retweeted_status && tweet.in_reply_to_status_id === null){
    isClean = true;
  }

  return isClean;
}