'use strict'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.input_select-type');
const inputDistance = document.querySelector('.input_distance');
const inputTime = document.querySelector('.input_time');
const inputCadence = document.querySelector('.input_cadence');
const inputDuration = document.querySelector('.input_duration');
const inputElevation = document.querySelector('.input_elevation');

let mapEvent, map;

// Geolocation API
if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const {latitude} = position.coords;
            const {longitude} = position.coords;
            const coords = [latitude, longitude];
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
            map = L.map('map').setView(coords, 13);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Handling clicks on map
            map.on('click', function(mapE){
                mapEvent = mapE;
                form.classList.remove('hidden');
                inputDistance.focus();
            });
        }, 
        function(){
            alert('Could not get your position');
        });
};

form.addEventListener('submit', function(e){
    //Dispaly marker
    inputDistance.value = inputDuration.value = inputCadence.value = '';
    e.preventDefault();
    console.log('form submitted');
    console.log(mapEvent);
    const {lat, lng} = mapEvent.latlng;
    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup',
        })
    )
    .setPopupContent('Workout')
    .openPopup();
});

inputType.addEventListener('change', function(e){
    inputElevation.closest('.form_row').classList.toggle('hidden');
    inputCadence.closest('.form_row').classList.toggle('hidden');
})