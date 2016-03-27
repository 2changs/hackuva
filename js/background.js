//JUST AN EXAMPLE, PLEASE USE YOUR OWN PICTURE!
        var imageAddr = "http://www.kenrockwell.com/contax/images/g2/examples/31120037-5mb.jpg"; 
        var downloadSize = 4995374; //bytes
        var globalAddress = "";
        var buildingLat;
        var buildingLong;
        var lati;
        var longi;
        var globalEndtime;
        var globalStarttime;
        var internetSpeed;
        var latitudePoint = [];
        var longitudePoint = [];
        var speedMbpsList = [];
        var averageSpeed;
        var averages = [];
        var addressess = [];
        function getReverseGeocodingData(lat, lng) {

            var latlng = new google.maps.LatLng(lat, lng);




    // This is making the Geocode request
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'latLng': latlng }, function (results, status) {
            if (status !== google.maps.GeocoderStatus.OK) {
                alert(status);
            }
        // This is checking to see if the Geoeode Status is OK before proceeding
            if (status == google.maps.GeocoderStatus.OK) {
                console.log(results);
                //var address = (results[0].formatted_address);
                globalAddress = (results[0].formatted_address);
                globalAddress = globalAddress.replace(/\//g, '');

                return globalAddress;
                //getGeocodeAddress();    
            } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {    
                setTimeout(function() {
                    getReverseGeocodingData(lat, lng);
                }, 200);

            }


            });
        }

        function getGeocodeAddress(address){
            var geocoder1 = new google.maps.Geocoder();
            geocoder1.geocode({'address': address}, function (results, status){
                if (status === google.maps.GeocoderStatus.OK) {

                    buildingLat = results[0].geometry.location.lat();
                    buildingLong = results[0].geometry.location.lng();

                    if(latitudePoint.indexOf(buildingLat) == -1){
                        latitudePoint.push(buildingLat);
                        longitudePoint.push(buildingLong);

                    }

                }else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {    
                    setTimeout(function() {
                    getGeocodeAddress(address);
                    }, 200);
                }
                else{
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }

        function ShowProgressMessage(msg) {
            if (console) {
                if (typeof msg == "string") {
                    console.log(msg);
                } else {
                    for (var i = 0; i < msg.length; i++) {
                        console.log(msg[i]);
                    }
                }
            }
            
            var oProgress = document.getElementById("progress");
            if (oProgress) {
                var actualHTML = (typeof msg == "string") ? msg : msg.join("<br />");
                oProgress.innerHTML = actualHTML;
            }
        }



        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                x.innerHTML = "Geolocation is not supported by this browser.";
            }
        }

        function showPosition(position){
            lati = position.coords.latitude;
            longi = position.coords.longitude;

            if(longi == -76.7115604){
                
                lati = 39.253802;
                longi = -76.714273;
            }

            if(lati == 39.2556423){
                
                lati = 39.253802;
                longi = -76.714273;
            }




            var endTime = globalEndtime;
            var startTime = globalStarttime;
            getReverseGeocodingData(lati, longi);

                var duration = (endTime - startTime) / 1000;
                var bitsLoaded = downloadSize * 8;
                var speedBps = (bitsLoaded / duration).toFixed(2);
                var speedKbps = (speedBps / 1024).toFixed(2);
                var speedMbps = (speedKbps / 1024).toFixed(2);
                ShowProgressMessage([
                    "Your connection speed is:", 
                    speedBps + " bps", 
                    speedKbps + " kbps", 
                    speedMbps + " Mbps",
                    lati + "latitude",
                    longi + "longitude",
                    globalAddress,
                    "BuildLat: " + buildingLat,
                    "BuildLong: " + buildingLong 
                ]);

              var addressesRef = new Firebase('https://hackuva.firebaseio.com/address');

              timeList = [(new Date).getTime()];
              allTimeList = [(new Date).getTime()];
              allSpeedList = [speedMbps];
              speedList = [speedMbps];
              averageSpeed = Number(speedMbps);


              internetSpeed = averageSpeed;


              addressesRef.once('value', function(snapshot) {
                  if (snapshot.hasChild(globalAddress)) {
                    //update

                        oldTimeList = snapshot.child(globalAddress).child('times').val(); 
                        oldSpeedList = snapshot.child(globalAddress).child('speed').val();

                        oldAllTimeList = snapshot.child(globalAddress).child('allTimes').val();
                        oldAllSpeedList = snapshot.child(globalAddress).child('allSpeeds').val();

                        allSpeedList =  oldAllSpeedList.concat(allSpeedList);
                        allTimeList =   oldAllTimeList.concat(allTimeList);

                        if(timeList[0]-oldTimeList[oldTimeList.length-1]<600000){

                            if(oldTimeList.length >= 10){
                                averageSpeed = 0;
                                for(i = 0; i < oldTimeList.length - 1; i++){

                                    oldTimeList[i] = oldTimeList[i+1];
                                    oldSpeedList[i] = oldSpeedList[i+1]
                                    averageSpeed = averageSpeed + Number(oldSpeedList[i])
                                }

                                oldSpeedList[9] = speedMbps;
                                oldTimeList[9] = (new Date).getTime(); 
                                averageSpeed = averageSpeed + Number(speedMbps);

                                averageSpeed = averageSpeed/10;

                                speedList = oldSpeedList;
                                timeList = oldTimeList;
                            
                            }
                            else{
                                speedList = oldSpeedList.concat(speedList);
                                timeList = oldTimeList.concat(timeList);

                                averageSpeed = 0;
                                for(j=0;j<speedList.length;j++){
                                    averageSpeed+= Number(speedList[j])
                                }
                                averageSpeed /= speedList.length;

                            }
                        }

                        addressesRef.child(globalAddress).set({
                            times: timeList,
                            speed: speedList,
                            average: averageSpeed, 
                            allSpeeds: allSpeedList,
                            allTimes: allTimeList
                        })

                  }
                  else{
                    addressesRef.child(globalAddress).set({
                        times: timeList,
                        speed: speedList,
                        average: averageSpeed,
                        allSpeeds: allSpeedList,
                        allTimes: allTimeList
                    })
                  }
                });
        }

        function MeasureConnectionSpeed(position) {
            var startTime, endTime;
            var download = new Image();
            download.onload = function () {
                endTime = (new Date()).getTime();
                showResults();

            }
            
            download.onerror = function (err, msg) {
                ShowProgressMessage("Invalid image, or error downloading");
            }
            
            startTime = (new Date()).getTime();
            globalStarttime = startTime;
            var cacheBuster = "?nnn=" + startTime;
            download.src = imageAddr + cacheBuster;
            
            function showResults() {
                globalEndtime = endTime
                getLocation();  
            }
        }




document.addEventListener('DOMContentLoaded', function(){

    window.alert = function() {};
    ShowProgressMessage("Loading the image, please wait...");
    window.setInterval(function(){
        window.setTimeout(MeasureConnectionSpeed, 1);
    }, 10000);
        
});


        function getPoints(){

            var addressesRef = new Firebase('https://hackuva.firebaseio.com/address');
            addressesRef.orderByValue().on("value", function(snapshot) {
              snapshot.forEach(function(data) {

                        getGeocodeAddress(data.key());
                        if(data.val().average < 0){
                            var avg = -1*data.val().average;
                            averages.push(avg.toFixed(2));
                            addressess.push(data.key());
                        }
                        else{
                            averages.push(data.val().average.toFixed(2));
                            addressess.push(data.key());
                        }
                        
     
                    //ssgetGeocodeAddress(snapshot.key());


              });
            });
        }












