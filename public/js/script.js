const socket= io();
let mylocation=null;
let mapcenter=false;
if(navigator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        const lat=position.coords.latitude;
        const lng=position.coords.longitude;
        const speed=position.coords.speed;
        const direction=position.coords.heading;
        const altitude=position.coords.altitude;
        mylocation=[lat,lng];
        console.log(`Latitude: ${lat}, Longitude: ${lng}, Speed: ${speed}, Direction: ${direction}, Altitude: ${altitude}`);
        socket.emit('location',{lat,lng,speed,direction,altitude});
        
    },error=>{
        console.error('Error getting location:', error);
    },
{
    enableHighAccuracy:true,
    maximumAge:0,
    timeout:5000
    
});
}

const map= L.map("map").setView([0,0],2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"Track-Map-Dhruv-Tyagi"
}).addTo(map);

const marker={};
socket.on('received-location',(data)=>{
    const {id,lat,lng,speed,direction,altitude}=data;

 if (!mapcenter) {
        map.setView([lat, lng], 16);
        mapcenter = true;
    }

    // map.setView([lat,lng], 16);
    if(marker[id]){
        marker[id].setLatLng([lat,lng]).setPopupContent(`
            Speed: ${speed ?? 'N/A'} m/s <br>
            Direction: ${direction ?? 'N/A'}° <br>
            Altitude: ${altitude ?? 'N/A'} m
        `);

    }else{
        marker[id]=L.marker([lat,lng]).addTo(map).bindPopup(`
                Speed: ${speed ?? 'N/A'} m/s <br>
                Direction: ${direction ?? 'N/A'}° <br>
                Altitude: ${altitude ?? 'N/A'} m
            `);

            marker[id].on('click',()=>{
                if(mylocation){
                    const distance=map.distance(mylocation,[lat,lng]);
                    this.setPopupContent(`
                        Speed: ${speed ?? 'N/A'} m/s <br>
                        Direction: ${direction ?? 'N/A'}° <br>
                        Altitude: ${altitude ?? 'N/A'} m <br>
                        Distance: ${distance.toFixed(2)} km
                    `).openPopup();
                }
            })
    }

});
socket.on('user-disconnected',(id)=>{
    if(marker[id]){
        map.removeLayer(marker[id]);
        delete marker[id];
    }
});

