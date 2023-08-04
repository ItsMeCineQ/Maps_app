'use strict'


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.input_select-type');
const inputDistance = document.querySelector('.input_distance');
const inputCadence = document.querySelector('.input_cadence');
const inputDuration = document.querySelector('.input_duration');
const inputElevation = document.querySelector('.input_elevation');
const btnRemoveWorkout = document.querySelector('.workout_delete');
const btnRemoveAllWorkout = document.querySelector('.workout_delete-all');
const modalRemoveAllWorkouts = document.querySelector('.modal_remove-workouts-all')

class Workout{
    date = new Date();
    id = (Date.now() + '').slice(-10);
    constructor(coords, distance, duration){
        this.coords = coords; // [lat, lng]
        this.distance = distance;
        this.duration = duration;
    }
    
    _setDescription(){
        const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${month[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout{
    type = 'running';
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
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
        this._setDescription();
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
    #mapZoomLevel = 13;
    #workouts = [];

    constructor(){
        // Get user's position
        this._getPosition();

        // Get data from local storage
        this._getLocalStorage();

        // Attach event handlers
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
        btnRemoveAllWorkout.addEventListener('click', function(){
            
            if(true) this._deleteAllWorkouts;
        });
        btnRemoveWorkout.addEventListener('click', this._deleteWorkout);
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
        //console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

         // Handling clicks on map
        this.#map.on('click', this._showForm.bind(this));

        // Rendering markers
        this.#workouts.forEach(work => {
            this._renderWorkoutMarker(work);
        });
    }

    _showForm(mapE){
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm(){
        form.classList.add('hidden');
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
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

        // Render workout on map as marker
        this._renderWorkoutMarker(workout);

        // Render workout on the sidebar
        this._renderWorkout(workout);

        // Hide form
        this._hideForm();

        // Set local storage to all workouts
        this._setLocalStorage();
    }
    _renderWorkoutMarker(workout){
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
            .setPopupContent(`${workout.type === 'running' ? '🏃🏻 ' : '🚴🏻 '}${workout.description}`)
            .openPopup();
            }
    
    _renderWorkout(workout){
        let html = `
            <div class="workout_summary workout_${workout.type}" data-id="${workout.id}">
            <h2 class="workout_title">${workout.description}</h2>
            <button class="workout_delete">❎</button>
            <div class="workout_details">
                <div class="workout_stats">
                    <span class="workout_icon">${workout.type === 'running' ? '🏃🏻' : '🚴🏻'}</span>
                    <span class="workout_value">${workout.distance}</span>
                    <span class="workout_unit">km</span>
                </div>
                <div class="workout_stats">
                    <span class="workout_icon">⏲️</span>
                    <span class="workout_value">${workout.duration}</span>
                    <span class="workout_unit">min</span>
                </div>
        `;
        if(workout.type === 'running')
            html += `
                <div class="workout_stats">
                <span class="workout_icon">⚡</span>
                <span class="workout_value">${workout.pace.toFixed(1)}</span>
                <span class="workout_unit">min/km</span>
            </div>
            <div class="workout_stats">
                <span class="workout_icon">🦶🏻</span>
                <span class="workout_value">${workout.cadence}</span>
                <span class="workout_unit">spm</span>
            </div>
        </div>
        </div>
            `
        if(workout.type === 'cycling')
            html += `
            <div class="workout_stats">
                <span class="workout_icon">⚡</span>
                <span class="workout_value">${workout.speed.toFixed(1)}</span>
                <span class="workout_unit">km/h</span>
            </div>
            <div class="workout_stats">
                <span class="workout_icon">🗻</span>
                <span class="workout_value">${workout.elevation}</span>
                <span class="workout_unit">m</span>
                </div>
            </div>
            </div>
            `
        form.insertAdjacentHTML('afterend', html);
        btnRemoveAllWorkout.classList.remove('hidden');
    }

    _deleteWorkout(e){
        e.preventDefault();
        console.log('click');
    }

    _deleteAllWorkouts(){
        localStorage.removeItem('workouts');
        location.reload();
        btnRemoveAllWorkout.classList.add('hidden');
    }

    _moveToPopup(e){
        const workoutEl = e.target.closest('.workout_summary');

        if(!workoutEl) return;

        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
        
        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }

    _setLocalStorage(){
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('workouts'));

        if(!data) return;

        this.#workouts = data;

        this.#workouts.forEach(work => {
            this._renderWorkout(work);
        });
    }
}

const app = new App();

app._getPosition();

// List of things to do
// Add edit workout function
// Add delete workout function
// Add delete all workouts function
// Add sorting function
// Add better looking alert messages
// Add ability to draw lines instead of just points