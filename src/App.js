import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';



const particlesOptions = {
  particles: {
    number: {
      value: 60,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }/* Configuring Interactivity,
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "repulse"
      },
      onclick: {
        enable: true,
        mode: "push"
      }
    }
  },
  modes: {
    repulse: {
      distance: 400,
      duration: 0.4
    },
    push: {
      particles_nb: 2
    }
  }*/
}

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  boxes: [],
  route: "signin",
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {

  constructor() {
    super();

    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
    // console.log(this.state.user);
  }

  // Checking for connection
  // componentDidMount() {
  //   fetch('http://localhost:3001')
  //     .then(response => response.json())
  //     //.then(data => console.log(data)) or 
  //     .then(console.log)
  // }

  calculateFaceLocation = (data) => {
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    let coordinateArray = [];
    for (let i = 0; i < data.outputs[0].data.regions.length; i++) {
      let clarifaiFace = data.outputs[0].data.regions[i].region_info.bounding_box;
      coordinateArray.push({
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height),
        index: i
      });
    }
    return coordinateArray;
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  displayFaceBoxes = (boxes) => {
    this.setState({ boxes: boxes });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value, box: {}, boxes: [] })
  }

  onImageSubmit = () => {
    this.setState({ imageUrl: this.state.input })
    fetch('https://mighty-wildwood-42011.herokuapp.com/imageurl', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          const posArray = this.calculateFaceLocation(response);
          fetch('https://mighty-wildwood-42011.herokuapp.com/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id,
              faceCount: posArray.length
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }))
            })
            .catch(console.log)
          if (posArray.length === 1) {
            this.displayFaceBox(posArray[0]);
          } else if (posArray.length > 1) {
            this.displayFaceBoxes(posArray);
          }
        }
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  }

  render() {
    const { isSignedIn, imageUrl, route, box, boxes } = this.state;
    return (
      <div className="App">
        <Particles className="particles"
          params={particlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {
          route === 'home'
            ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onImageSubmit={this.onImageSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} boxes={boxes} />
            </div>
            : (
              route === 'signin'
                ? <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
                : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
            )
        }
      </div>
    );
  }
}

export default App;
