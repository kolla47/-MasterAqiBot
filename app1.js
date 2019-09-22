var request = require('request')
var telegram=require('telegram-bot-api')
var api = new telegram({
  token: '937165465:AAF-KxyHE472_DYQljcn4i92dtBoNg_G9sg',
  updates: {
    enabled: true
  }
});

console.log("Server has started!!")

api.on('message',function(mes){
  console.log("A message from: "+mes.from.first_name)
  if(mes.text.toString().toLowerCase()=="hi" || mes.text.toString().toLowerCase().includes("hello")){
    api.sendMessage({
      chat_id: mes.chat.id,
      text: 'Hello!! Welcome to AirSense, '+mes.from.first_name+'.'
    });
  }
  else if(mes.text.toString().toLowerCase().includes("bye")){
    api.sendMessage({
      chat_id: mes.chat.id,
      text: 'Hope to see you around again , Bye'
    });
  }
  else{
    var location = mes.text
    var key = 'AIzaSyARQySxubEs__UG8deSPrERiCwAiFHt4GM'
    request('https://maps.googleapis.com/maps/api/geocode/json?address='+location+'&key='+key, { 
      json: true 
    },
    (err, res, body) => {
      if (err) { 
        console.log(err); 
      }
      else if(body.status=="ZERO_RESULTS"){
        console.log("invalid input!")
        api.sendMessage({
          chat_id: mes.chat.id,
          text: "The location: "+location+" is invalid \n please input a valid address."
        })
      }
      else{
        var address=body.results[0].formatted_address
        console.log(body.results[0].formatted_address)
        var lat=body.results[0].geometry.location.lat
        var lng=body.results[0].geometry.location.lng
        console.log(lat,lng)
        request("https://api.breezometer.com/air-quality/v2/current-conditions?lat=" + lat + "&lon=" + lng + "&key=99db6c3bc52249dd9169f02f239c3a87&features=breezometer_aqi,local_aqi,health_recommendations,sources_and_effects,pollutants_concentrations,pollutants_aqi_information", function (error, response, body){
          if(err){
            console.log(err)
          }
          else{
            var b=JSON.parse(body)
            var aqi=b.data.indexes.baqi.aqi_display
            var cat=b.data.indexes.baqi.category
            var dom=b.data.indexes.baqi.dominant_pollutant
            var hre=b.data.health_recommendations.general_population
            var sae=b.data.pollutants 
            console.log(aqi,cat,dom)
            api.sendMessage({
              chat_id: mes.chat.id,
              text: "The Air-quality Index of "+address +": "+aqi
              +"\nCategory : "+cat
              +"\nDominant pollutant: "+dom 
              +"\n\nPollutants(in AQI):\n"
              +sae.co.display_name+" : "+sae.co.aqi_information.baqi.aqi_display+"\n"
              +sae.no2.display_name+" : "+sae.no2.aqi_information.baqi.aqi_display+"\n"
              +sae.o3.display_name+" : "+sae.o3.aqi_information.baqi.aqi_display+"\n"
              +sae.pm10.display_name+" : "+sae.pm10.aqi_information.baqi.aqi_display+"\n"
              +sae.pm25.display_name+" : "+sae.pm25.aqi_information.baqi.aqi_display+"\n"
              +sae.so2.display_name+" : "+sae.so2.aqi_information.baqi.aqi_display+"\n"
              +"\nHealth recommendations: \n"+ hre
            })

          }
        })
      }
    });
  }
});