'use strict'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.input_select-type');
const inputDistance = document.querySelector('.input-distance');
const inputTime = document.querySelector('.input-time');
const inputCadence = document.querySelector('.input-cadence');
const inputDuration = document.querySelector('.input-duration');
const inputElevation = document.querySelector('.input-elevation');

// Geolocation API
if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const {latitude} = position.coords;
            const {longitude} = position.coords;
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        }, 
        function(){
            alert('Could not get your position');
        });
}