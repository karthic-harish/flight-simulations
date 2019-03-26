# flight-simulations

## Project Description

The primary objective of this project is to identify the optimal boarding strategy for a typical 180-seat, single-aisle aircraft based on the aforementioned 3 boarding methods. Our models will be implemented on Javascript as 3 independent agent based discrete event simulations.

Our models are unique in their consideration of 2 key parameters: 

- luggage constraints 
- time differences in moving from the aisle to the 3 different types of seats (window, middle, aisle) 

Parameters will be estimated from research papers based on real-life observations

## How to use this? 

```
├── Simulations
│   ├── Back to front boarding
│   ├── Inside out boarding
│   ├── Random boarding
│   │   ├── FlightModel.html
│   │   ├── lib
│   │   ├── img
│   │   ├── style
│   │   ├── test-script
│
├── flight-simulation-tour.pdf
```

Open **FlightModel.html** to run simulation
JS code resides in the **lib** folder

Please read all the content in the **Project Info** folder to fully understand the project

Else, check out **flight-simulation-tour.pdf** for a walkthrough of the code

## What's next

Use the framework here to build other traffic simulations or more advanced flight simulations
