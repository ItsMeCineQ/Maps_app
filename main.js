'use strict'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.input_select-type');
const inputDistance = document.querySelector('.input_distance');
const inputCadence = document.querySelector('.input_cadence');
const inputDuration = document.querySelector('.input_duration');
const inputElevation = document.querySelector('.input_elevation');

class Workout{
    date = new Date();
    id = (Date.now() + '').slice(-10);
    constructor(coords, distance, duration){
        this.coords = coords; // [lat, lng]
        this.distance = distance;
        this.duration = duration;
    }
}

class Running extends Workout{
    type = 'running';
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace(){
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout{
    type = 'cycling';

    constructor(coords, distance, duration, elevation){
        super(coords, distance, duration);
        this.elevation = elevation;
        this.calcSpeed();
    }

    calcSpeed(){
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

// APPLICATION ARCHITECTURE
class App {
    #map;
    #mapEvent;
    #workouts = [];

    constructor(){
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
    }

    _getPosition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
                function(){
                    alert('Could not get your position');
                });
        };
    }

    _loadMap(position){
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        const coords = [latitude, longitude];
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        this.#map = L.map('map').setView(coords, 13);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

         // Handling clicks on map
        this.#map.on('click', this._showForm.bind(this)); 
    }

    _showForm(mapE){
        this.#mapEvent = mapE;
            form.classList.remove('hidden');
            inputDistance.focus();
    }

    _toggleElevationField(){
        inputElevation.closest('.form_row').classList.toggle('hidden');
        inputCadence.closest('.form_row').classList.toggle('hidden');
    }

    _newWorkout(e){
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const positiveNum = (...inputs) => inputs.every(inp => inp > 0);
        e.preventDefault();

        // Get data from the form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;
    
        // If workout is running, create running object
        if(type === 'running'){
            const cadence = +inputCadence.value;
            // Check if data is valid
            if(!validInputs(distance, duration, cadence) || !positiveNum(distance, duration, cadence))
                return alert('Input must be a positive number!');
            workout = new Running([lat, lng], distance, duration, cadence);
        }
        
        // If workout is cycling, create cycling object
        if(type === 'cycling'){
            const elevation = +inputElevation.value;
            if(!validInputs(distance, duration, elevation) || !positiveNum(distance, duration))
            return alert('Input must be a positive number!');
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }
        
        // Add new object to workout array
        this.#workouts.push(workout);
        console.log(workout);
        // Render workout on map as marker
        this.renderWorkoutMarker(workout);

        inputDistance.value = inputDuration.value = inputCadence.value = '';
    }
    renderWorkoutMarker(workout){
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,
            })
            )
            .setPopupContent('workout')
            .openPopup();
            }
}

const app = new App();

app._getPosition();